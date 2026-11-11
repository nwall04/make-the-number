// Host panel (Noah's MacBook). Signs in, creates a room, and drives the projector.
import { STEPS, BOARD_ROUND, PLANNED_MINUTES, CLASS_MINUTES, hostNote } from './content.js';
import { OnlineStore, client, stateForStep } from './store.js';
import { isConfigured, playUrl } from './config.js';
import { next, back, addTime, lockNow, reopen, goTo, remaining, elapsed, fmt } from './controls.js';
import { renderEntry, renderTeams, bindEntry, patch, entryRound } from './entry.js';
import { esc } from './views.js';

const app = document.getElementById('app');
let store = null; let sb = null; let user = null;

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.hidden = false; clearTimeout(t._t); t._t = setTimeout(() => (t.hidden = true), 3500);
}
const win = (title, body, cls = '') => `<div class="win ${cls}"><div class="titlebar"><span class="tb-icon"></span><span class="tb-title">${esc(title)}</span><span class="tb-btns"><i></i><i></i><i></i></span></div><div class="win-body">${body}</div></div>`;

function signInView(msg = '') {
  app.innerHTML = `<div class="host-narrow">${win('Host login', `
    <h1 class="pixel">Host login</h1>
    <form id="login" class="join">
      <label class="field">Email<input id="email" type="email" autocomplete="username" required></label>
      <label class="field">Password<input id="pw" type="password" autocomplete="current-password" required></label>
      <button class="btn primary big" type="submit">Sign in</button>
      ${msg ? `<p class="err">${esc(msg)}</p>` : ''}
    </form>
    <p class="muted">No internet in class? Open <a href="screen.html?offline=1">the offline version</a> on the classroom computer.</p>`)}</div>`;
  app.querySelector('#login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const { data, error } = await sb.auth.signInWithPassword({ email: app.querySelector('#email').value, password: app.querySelector('#pw').value });
    if (error) return signInView(error.message);
    user = data.user; roomsView();
  });
}

const planClock = (m) => `${Math.floor(m)}:${String(Math.round((m % 1) * 60)).padStart(2, '0')}`;
const randomCode = () => Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 24)]).join('');

async function roomsView() {
  const { data: rooms } = await sb.from('rooms').select('code,created_at,state').eq('host_id', user.id).order('created_at', { ascending: false });
  app.innerHTML = `<div class="host-narrow">${win('Your rooms', `
    <h1 class="pixel">Your rooms</h1>
    <button class="btn primary big" id="create">Create a new room</button>
    <ul class="room-list">${(rooms || []).map((r) => `<li><button class="btn" data-open="${r.code}">Open ${r.code}</button><span class="muted">${new Date(r.created_at).toLocaleString()} · step ${(r.state?.step ?? 0) + 1}/${STEPS.length}</span><button class="link danger" data-del="${r.code}">Delete</button></li>`).join('') || '<li class="muted">No rooms yet. Create one for the rehearsal and a fresh one for class.</li>'}</ul>
    <p class="muted"><button class="link" id="signout">Sign out</button></p>`)}</div>`;
  app.querySelector('#create').addEventListener('click', async () => {
    for (let i = 0; i < 5; i++) {
      const code = randomCode();
      const { error } = await sb.from('rooms').insert({ code, state: stateForStep(0, 0) });
      if (!error) return openRoom(code);
      if (!String(error.message).includes('duplicate')) return toast(error.message);
    }
  });
  app.querySelectorAll('[data-open]').forEach((b) => b.addEventListener('click', () => openRoom(b.dataset.open)));
  app.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', async () => {
    if (b.dataset.confirm !== '1') { b.dataset.confirm = '1'; b.textContent = 'Confirm delete'; return; }
    const { error } = await sb.from('rooms').delete().eq('code', b.dataset.del);
    if (error) toast(error.message); roomsView();
  }));
  app.querySelector('#signout').addEventListener('click', async () => { await sb.auth.signOut(); signInView(); });
}

async function openRoom(code) {
  store = new OnlineStore(code);
  await store.start();
  const screenUrl = location.href.replace(/host\.html.*$/, `screen.html?room=${code}`);
  app.innerHTML = `
  <div class="console">
    <div class="console-main">
      ${win(`Room ${code} · Control`, `
        <div class="now"><span class="kicker">Now</span><b id="nowLabel"></b><span id="nowTimer" class="ptimer"></span></div>
        <div class="clock-row"><span id="classClock" class="class-clock"></span><span class="muted">Plan: ${PLANNED_MINUTES} min of ${CLASS_MINUTES}. The clock starts when you leave the lobby.</span></div>
        <div class="ctrl-row big-ctrls">
          <button class="btn" data-act="back">◀ Back</button>
          <button class="btn primary" data-act="next">Next ▶</button>
          <button class="btn" data-act="add30">+30 s</button>
          <button class="btn" data-act="lock">Lock now</button>
          <button class="btn" data-act="reopen">Reopen</button>
        </div>
        <p class="muted" id="nextLabel"></p>
        <div id="notes" class="notes"></div>`)}
      ${win('Answers', `<p class="muted" id="answeredCount"></p><div id="entry"></div>`)}
      ${win('Projector preview', `<div class="preview"><iframe id="preview" src="${esc(screenUrl)}" title="Projector preview" tabindex="-1"></iframe></div>`)}
    </div>
    <div class="console-side">
      ${win('Links', `
        <label class="field">Projector (open on the class computer)<input readonly value="${esc(screenUrl)}" onclick="this.select()"></label>
        <label class="field">Phones<input readonly value="${esc(playUrl(code))}" onclick="this.select()"></label>
        <p><a class="btn" href="${esc(screenUrl)}" target="_blank" rel="noopener">Open projector view</a> <a class="btn" href="${esc(playUrl(code))}" target="_blank" rel="noopener">Open a test phone</a></p>
        <p class="muted"><a href="slides.html" target="_blank" rel="noopener">Printable deck</a> of every slide and round, for submitting before class.</p>`)}
      ${win('Run of show', `<ol class="steps" id="steps">${STEPS.map((s, i) => `<li class="k-${s.kind}"><span class="plan">${planClock(s.planAt)}</span><button class="link" data-jump="${i}">${esc(s.label)}</button><span class="mins">${s.minutes} min</span></li>`).join('')}</ol>`)}
      ${win('Teams', `<form id="addTeam" class="ctrl-row"><input id="teamName" maxlength="24" placeholder="Add a team by hand"><button class="btn" type="submit">Add</button></form><div id="teams"></div>
        <p><button class="link danger" id="clear">Clear all answers</button> · <button class="link" id="leaveRoom">Back to rooms</button></p>`)}
    </div>
  </div>`;
  app.addEventListener('click', onClick);
  app.querySelector('#addTeam').addEventListener('submit', async (e) => {
    e.preventDefault(); const i = app.querySelector('#teamName');
    try { await store.addTeam(i.value.trim()); i.value = ''; } catch (err) { toast(err.message); }
  });
  bindEntry(app, store, (err) => toast(err.message));
  const pv = app.querySelector('.preview');
  new ResizeObserver(() => pv.style.setProperty('--s', String(pv.clientWidth / 1600))).observe(pv);
  store.onChange(render);
}

async function onClick(e) {
  const act = e.target.closest('[data-act]')?.dataset.act;
  try {
    if (act === 'next') await next(store); else if (act === 'back') await back(store);
    else if (act === 'add30') await addTime(store, 30); else if (act === 'lock') await lockNow(store); else if (act === 'reopen') await reopen(store);
    const j = e.target.closest('[data-jump]'); if (j) await goTo(store, Number(j.dataset.jump));
  } catch (err) { toast(err.message); }
  const c = e.target.closest('#clear');
  if (c) {
    if (c.dataset.confirm !== '1') { c.dataset.confirm = '1'; c.textContent = 'Click again to clear every answer'; return; }
    try { await store.clearAnswers(); } catch (err) { toast(err.message); }
    c.dataset.confirm = ''; c.textContent = 'Clear all answers';
  }
  if (e.target.closest('#leaveRoom')) location.reload();
}

function render(snap) {
  const i = snap.state.step ?? 0; const s = STEPS[i];
  app.querySelector('#nowLabel').textContent = `${i + 1}/${STEPS.length} · ${s.label}`;
  app.querySelector('#nextLabel').textContent = STEPS[i + 1] ? `Next: ${STEPS[i + 1].label}` : 'This is the last step.';
  app.querySelectorAll('#steps li').forEach((li, k) => li.classList.toggle('current', k === i));
  const note = hostNote(i);
  patch(app.querySelector('#notes'), note ? `<p><b>Host note:</b> ${esc(note)}</p>` : '');
  app.querySelector('#steps li.current')?.scrollIntoView({ block: 'nearest' });
  const er = entryRound(snap);
  const n = er === null ? 0 : snap.teams.filter((t) => snap.answers[t.id]?.[er] !== undefined).length;
  app.querySelector('#answeredCount').textContent = er === null ? '' : `${n} of ${snap.teams.length} teams answered${er === BOARD_ROUND ? ' the board round' : ` round ${er + 1}`}. Tap a letter to set or clear a team’s answer.`;
  patch(app.querySelector('#entry'), renderEntry(snap));
  patch(app.querySelector('#teams'), renderTeams(snap));
}

setInterval(() => {
  const el = app.querySelector('#nowTimer'); if (!el || !store) return;
  const st = store.snapshot().state;
  const r = remaining(st);
  el.textContent = r === null ? '' : r === 0 ? 'Locked' : fmt(r);
  const ck = app.querySelector('#classClock'); if (!ck) return;
  const e = elapsed(st);
  if (e === null) { ck.textContent = 'Class clock 0:00'; ck.className = 'class-clock'; return; }
  const plan = (STEPS[st.step ?? 0]?.planAt ?? 0) * 60;
  const diff = e - plan;
  ck.textContent = `Class clock ${fmt(e)} · plan ${fmt(Math.round(plan))} · ${diff > 0 ? `${fmt(diff)} behind` : `${fmt(-diff)} ahead`}`;
  ck.className = `class-clock ${diff > 180 ? 'behind' : ''}`;
}, 250);

document.addEventListener('keydown', (e) => {
  if (!store || e.target.matches('input, select, textarea')) return;
  if (e.key === 'ArrowRight') next(store).catch((err) => toast(err.message));
  if (e.key === 'ArrowLeft') back(store).catch((err) => toast(err.message));
});

(async () => {
  if (!isConfigured()) { app.innerHTML = `<div class="host-narrow">${win('Setup needed', '<p class="body">Add your Supabase URL and anon key to <code>js/config.js</code>. Until then you can use <a href="screen.html?offline=1">offline mode</a>.</p>')}</div>`; return; }
  sb = await client();
  const { data } = await sb.auth.getSession();
  user = data.session?.user || null;
  user ? roomsView() : signInView();
})();
