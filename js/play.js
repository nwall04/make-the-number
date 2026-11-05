// Team phone. play.html?room=ABCD
import { STEPS, ROUNDS, METERS, BOARD, BOARD_ROUND, BOARD_BUDGET, MAX, CASE_FILE, teamMeters, standings, validBoard } from './content.js';
import { OnlineStore, client } from './store.js';
import { isConfigured } from './config.js';
import { remaining, fmt } from './controls.js';
import { esc } from './views.js';

const app = document.getElementById('app');
const params = new URLSearchParams(location.search);
let code = (params.get('room') || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
const presetName = (params.get('team') || '').slice(0, 24);
const key = (c) => `mtn-team-${c}`;
let me = null; let store = null; let boardDraft = null; let boardSaving = false;

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.hidden = false; clearTimeout(t._t); t._t = setTimeout(() => (t.hidden = true), 3500);
}
const ERR = {
  room_not_found: 'That room code does not exist. Check the big screen.',
  name_taken: 'Another team already has that name.',
  bad_name: 'Team names need 1 to 24 characters.',
  room_full: 'This room is full.',
  round_closed: 'This round is closed.',
  time_up: 'Time is up for this round.',
  not_your_team: 'Your team session expired. Rejoin with a new name.',
};
const errText = (e) => { const m = e?.message || String(e); return Object.entries(ERR).find(([k]) => m.includes(k))?.[1] || m; };

function win(title, body) {
  return `<div class="win"><div class="titlebar"><span class="tb-icon"></span><span class="tb-title">${esc(title)}</span><span class="tb-btns"><i></i><i></i><i></i></span></div><div class="win-body">${body}</div></div>`;
}

function meters(m) {
  return `<div class="pmeters">${METERS.map((x) => `
    <div class="pm"><span>${esc(x.short)}</span><div class="mbar m-${x.key}"><i style="width:${Math.round((m[x.key] / MAX) * 100)}%"></i></div><b>${m[x.key]}</b></div>`).join('')}</div>`;
}

// ---------- Case file: always one tap away (and always open beside the game on a laptop) ----------
function buildCaseFile() {
  const aside = document.getElementById('casefile');
  aside.innerHTML = `<div class="win"><div class="titlebar"><span class="tb-title">Case file</span><button type="button" class="cf-close" id="cfClose" aria-label="Close case file">Close</button></div>
    <div class="win-body">${CASE_FILE.map((sec, i) => `<details ${i < 2 ? 'open' : ''}><summary>${esc(sec.title)}</summary><ul>${sec.items.map((it) => `<li>${esc(it)}</li>`).join('')}</ul></details>`).join('')}</div></div>`;
  const btn = document.getElementById('cfBtn');
  btn.addEventListener('click', () => { document.body.classList.add('cf-open'); });
  aside.querySelector('#cfClose').addEventListener('click', () => document.body.classList.remove('cf-open'));
}
buildCaseFile();

function showJoin(msg = '') {
  app.innerHTML = win('Join your team', `
    <h1 class="pixel">Make the Number</h1>
    <p class="body">One phone or computer per team (a computer is easier). Use your group number as the team name.</p>
    <form id="join" class="join">
      <label class="field">Room code<input id="code" value="${esc(code)}" maxlength="4" autocapitalize="characters" autocomplete="off" required></label>
      <label class="field">Group number<input id="name" placeholder="Group 3" maxlength="24" autocomplete="off" required value="${esc(presetName)}"></label>
      <button class="btn primary big" type="submit">Join</button>
      ${msg ? `<p class="err">${esc(msg)}</p>` : ''}
    </form>`);
  app.querySelector('#join').addEventListener('submit', async (e) => {
    e.preventDefault();
    const c = app.querySelector('#code').value.toUpperCase().replace(/[^A-Z]/g, '');
    const n = app.querySelector('#name').value.trim();
    const btn = e.target.querySelector('button'); btn.disabled = true; btn.textContent = 'Joining…';
    try {
      const sb = await client();
      const { data, error } = await sb.rpc('join_team', { p_code: c, p_name: n });
      if (error) throw error;
      code = data.room_code; me = data;
      try { localStorage.setItem(key(code), JSON.stringify(me)); } catch {}
      history.replaceState(null, '', `?room=${code}`);
      startGame();
    } catch (err) { showJoin(errText(err)); }
  });
}

async function submit(round, choice) {
  const sb = await client();
  const { error } = await sb.rpc('submit_answer', { p_team: me.team_id, p_secret: me.secret, p_round: round, p_choice: choice });
  if (error) throw error;
  await store.refreshAnswers();
}

function myAnswers(snap) { return snap.answers[me.team_id] || {}; }

const P = {
  waiting(snap) {
    return win('Standing by', `<p class="kicker">Team</p><h1 class="pixel">${esc(me.name)}</h1><p class="body">You are in. Watch the big screen.</p>${meters(teamMeters(myAnswers(snap), -1))}`);
  },
  question(snap) {
    const r = snap.state.round; const R = ROUNDS[r]; const cur = myAnswers(snap)[r];
    const left = remaining(snap.state); const closed = left === 0;
    return win(`Round ${r + 1} · Decision`, `
      <div class="phead"><span class="kicker">${esc(R.company)} · ${esc(R.year)}</span><span class="ptimer" data-timer>${left === null ? '' : closed ? 'Time' : fmt(left)}</span></div>
      <p class="psit"><span class="qlabel">The situation</span>${esc(R.brief)} <span class="muted">Full details are on the big screen.</span></p>
      <span class="qlabel">Your decision</span>
      <h2 class="ptitle">${esc(R.prompt)}</h2>
      <div class="pchoices">${R.choices.map((c) => `
        <button type="button" class="pchoice ${cur === c.id ? 'on' : ''}" data-choice="${c.id}" ${closed ? 'disabled' : ''}>
          <span class="letter">${c.id}</span><span><b>${esc(c.label)}</b><small>${esc(c.detail)}</small></span></button>`).join('')}
      </div>
      <p class="status-line">${cur ? `Locked in: <b>${cur}</b>. ${closed ? '' : 'You can change it until time runs out.'}` : closed ? 'No answer this round.' : 'Discuss as a team, then tap one.'}</p>`);
  },
  result(snap) {
    const r = snap.state.round; const R = ROUNDS[r]; const cur = myAnswers(snap)[r];
    const ch = R.choices.find((c) => c.id === cur);
    const showFx = ['effects', 'don', 'standings'].includes(snap.state.kind);
    return win(`Round ${r + 1} · Result`, `
      <p class="kicker">Round ${r + 1}: ${esc(R.title)}</p>
      <h2 class="ptitle">${ch ? `You chose <span class="letter inline">${ch.id}</span> ${esc(ch.label)}` : 'Your team did not answer'}</h2>
      ${showFx && ch ? `<div class="pdeltas">${METERS.map((m) => { const v = ch.effects[m.key]; return `<span class="m-${m.key}">${esc(m.short)} <b class="${v > 0 ? 'up' : v < 0 ? 'down' : ''}">${v > 0 ? '+' : ''}${v}</b></span>`; }).join('')}</div>` : '<p class="body">Watch the screen.</p>'}
      ${snap.state.kind === 'don' ? `<p class="pverdict v-${R.standard.verdict === 'Partly meets' ? 'part' : 'bad'}">Don\u2019s choice: <b>${esc(R.standard.verdict)}</b> the expected standard. Closest to expected conduct: <b>${R.standard.expected}</b>.</p>` : ''}
      ${showFx ? meters(teamMeters(myAnswers(snap), r)) : ''}
      ${snap.state.kind === 'standings' ? rankLine(snap, r, 'short') + '<p class="hint">This ranking counts earnings and bonus only. The simulation tracks all four meters.</p>' : ''}`);
  },
  unravel() {
    return win('Trading halted', `<h1 class="pixel alert-text">Short-term gains, long-term consequences</h1><p class="body">The numbers caught up with ETI. Scores are about to be recalculated on what lasts. Watch the screen.</p>`);
  },
  board(snap) {
    const saved = validBoard(myAnswers(snap)[BOARD_ROUND]);
    if (boardDraft === null) boardDraft = saved.slice();
    const spent = boardDraft.reduce((a, id) => a + BOARD.fixes.find((f) => f.id === id).cost, 0);
    const left = remaining(snap.state); const closed = left === 0;
    return win('Round 6 · Boardroom', `
      <div class="phead"><span class="kicker">You are ETI’s new board</span><span class="ptimer" data-timer>${left === null ? '' : closed ? 'Time' : fmt(left)}</span></div>
      <details class="pfails" open><summary>The six failures to fix</summary><ol>${BOARD.failures.map((f) => `<li>${esc(f.text)}</li>`).join('')}</ol></details>
      <div class="budget"><span>Budget</span><div class="mbar m-info"><i style="width:${(spent / BOARD_BUDGET) * 100}%"></i></div><b>${BOARD_BUDGET - spent} left</b></div>
      <div class="pfixes">${BOARD.fixes.map((f) => {
        const on = boardDraft.includes(f.id); const cant = !on && spent + f.cost > BOARD_BUDGET;
        return `<button type="button" class="pfix ${on ? 'on' : ''}" data-fix="${f.id}" ${closed || cant ? 'disabled' : ''}><span>${esc(f.label)}</span><b>${f.cost}</b></button>`;
      }).join('')}</div>
      <p class="status-line">${closed ? `Locked: ${saved.length} fixes.` : boardSaving ? 'Saving…' : JSON.stringify(saved) === JSON.stringify(boardDraft) ? (saved.length ? 'Saved. You can change it until time runs out.' : 'Tap fixes to spend your points.') : 'Saving…'}</p>`);
  },
  boardfail(snap) {
    const i = snap.state.step - STEPS.findIndex((s) => s.kind === 'boardfail');
    const f = BOARD.failures[i]; const picks = validBoard(myAnswers(snap)[BOARD_ROUND]);
    const ok = f.caughtBy.some((id) => picks.includes(id));
    return win('Audit log', `<p class="kicker">Failure ${i + 1} of ${BOARD.failures.length}</p><h2 class="ptitle">${esc(f.concept)}</h2><p class="verdict ${ok ? 'ok' : 'miss'}">${ok ? 'Your board caught it' : 'Your board missed it'}</p>`);
  },
  final(snap) {
    return win('Final standings', `<p class="kicker">Final</p>${rankLine(snap, ROUNDS.length - 1, 'final')}${meters(teamMeters(myAnswers(snap), ROUNDS.length - 1))}`);
  },
  quote() {
    return win('In his own words', `<p class="kicker">Don Russell</p><p class="body">Watch the screen.</p>`);
  },
  summary(snap) {
    return win('End of simulation', `<h1 class="pixel">Thanks for playing</h1>${rankLine(snap, ROUNDS.length - 1, 'final')}${meters(teamMeters(myAnswers(snap), ROUNDS.length - 1))}<p class="body">Team ${esc(me.name)}. You can put the phone away.</p>`);
  },
};

function rankLine(snap, r, mode) {
  const rows = standings(snap.teams, snap.answers, r, mode);
  const i = rows.findIndex((x) => x.id === me.team_id);
  if (i < 0) return '';
  return `<div class="rank"><span class="pixel">#${i + 1}</span><span>of ${rows.length} · score ${rows[i].score}${mode === 'final' ? ` · board ${rows[i].catches}/6` : ''}</span></div>`;
}

let lastKey = '';
function render(snap) {
  if (!snap.exists) { app.innerHTML = win('Room closed', '<p class="body">This room no longer exists.</p><button class="btn" id="leave">Join another room</button>'); bindLeave(); return; }
  if (!snap.teams.some((t) => t.id === me.team_id) && snap.teams.length && snap.status === 'live') {
    try { localStorage.removeItem(key(code)); } catch {}
    me = null; showJoin('Your team was removed by the host. Join again.'); return;
  }
  const kind = snap.state.kind || STEPS[snap.state.step ?? 0]?.kind;
  if (kind !== 'board') boardDraft = null;
  const k = JSON.stringify([snap.state, snap.teams.length, myAnswers(snap), kind === 'standings' || kind === 'final' || kind === 'summary' ? snap.answers : 0, boardDraft, boardSaving]);
  if (k === lastKey) return; lastKey = k;
  let html;
  if (kind === 'question') html = P.question(snap);
  else if (['tally', 'effects', 'don', 'standings'].includes(kind)) html = P.result(snap);
  else if (P[kind]) html = P[kind](snap);
  else html = P.waiting(snap);
  app.innerHTML = html + `<p class="foot">Team ${esc(me.name)} · Room ${esc(code)} · <button type="button" class="link" id="leave">Leave</button></p>`;
  bindLeave();
}

function bindLeave() {
  app.querySelector('#leave')?.addEventListener('click', (e) => {
    const b = e.target;
    if (b.dataset.confirm !== '1') { b.dataset.confirm = '1'; b.textContent = 'Tap again to leave'; return; }
    try { localStorage.removeItem(key(code)); } catch {}
    location.href = `play.html?room=${code}`;
  });
}

app.addEventListener('click', async (e) => {
  const c = e.target.closest('[data-choice]');
  if (c && !c.disabled) {
    const snap = store.snapshot();
    app.querySelectorAll('.pchoice').forEach((b) => b.classList.toggle('on', b === c));
    try { await submit(snap.state.round, c.dataset.choice); } catch (err) { toast(errText(err)); lastKey = ''; render(store.snapshot()); }
    return;
  }
  const f = e.target.closest('[data-fix]');
  if (f && !f.disabled) {
    const id = f.dataset.fix;
    boardDraft = boardDraft.includes(id) ? boardDraft.filter((x) => x !== id) : [...boardDraft, id];
    boardDraft = validBoard(boardDraft);
    boardSaving = true; render(store.snapshot());
    try { await submit(BOARD_ROUND, boardDraft); } catch (err) { toast(errText(err)); boardDraft = null; }
    boardSaving = false; lastKey = ''; render(store.snapshot());
  }
});

setInterval(() => {
  const t = app.querySelector('[data-timer]'); if (!t || !store) return;
  const r = remaining(store.snapshot().state); if (r === null) return;
  t.textContent = r === 0 ? 'Time' : fmt(r);
  if (r === 0 && !t.dataset.closed) { t.dataset.closed = '1'; lastKey = ''; render(store.snapshot()); }
}, 500);

async function startGame() {
  app.innerHTML = win('Connecting', '<p class="body">Connecting to the room…</p>');
  store = new OnlineStore(code);
  await store.start();
  store.onChange(render);
}

if (!isConfigured()) app.innerHTML = win('Setup needed', '<p class="body">The game is not connected to its database yet.</p>');
else {
  try { me = JSON.parse(localStorage.getItem(key(code)) || 'null'); } catch { me = null; }
  if (me && code) startGame();
  else { showJoin(); if (presetName && code) app.querySelector('#join').requestSubmit(); }
}
