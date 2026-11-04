// Projector views. Each returns an HTML string for one step.
import {
  STEPS, ROUNDS, METERS, INTRO, UNRAVEL, BOARD, BOARD_ROUND, BOARD_BUDGET, CLOSING_QUOTE, MAX,
  standings, tally, boardCatches, validBoard,
} from './content.js';
import { remaining, fmt } from './controls.js';
import { playUrl } from './config.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function qrSvg(text) {
  if (!window.qrcode) return '';
  const q = window.qrcode(0, 'M'); q.addData(text); q.make();
  return q.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
}

function delta(v) {
  if (!v) return '<span class="d zero">0</span>';
  return `<span class="d ${v > 0 ? 'up' : 'down'}">${v > 0 ? '+' : '−'}${Math.abs(v)}</span>`;
}

function meterBar(key, value) {
  const pct = Math.round((value / MAX) * 100);
  return `<div class="mbar m-${key}" title="${value}/${MAX}"><i style="width:${pct}%"></i></div>`;
}

function roundTag(r) {
  const R = ROUNDS[r];
  return `<div class="tag"><span>${esc(R.company)}</span><span>${esc(R.year)}</span><span>Round ${r + 1} of ${ROUNDS.length + 1}</span></div>`;
}

function answeredStrip(snap, round) {
  const chips = snap.teams.map((t) => {
    const done = snap.answers[t.id] && snap.answers[t.id][round] !== undefined;
    return `<span class="chip ${done ? 'done' : ''}">${esc(t.name)}</span>`;
  }).join('');
  const n = snap.teams.filter((t) => snap.answers[t.id] && snap.answers[t.id][round] !== undefined).length;
  return `<div class="answered"><b>${n}/${snap.teams.length} locked in</b>${chips}</div>`;
}

function timer(state) {
  const r = remaining(state);
  if (r === null) return '';
  return `<div class="timer ${r <= 10 ? 'low' : ''} ${r === 0 ? 'out' : ''}" data-timer>${r === 0 ? 'Time' : fmt(r)}</div>`;
}

const V = {
  lobby(snap) {
    const url = playUrl(snap.code);
    const offline = snap.status === 'offline';
    return `
    <section class="lobby">
      <div class="lobby-left">
        <p class="kicker">ADM 4345 · Corporate governance</p>
        <h1 class="mega">Make the<br>Number</h1>
        <p class="lede">A live case on earnings management, controllers and boards, based on Don Russell: Experiences of a Controller/CFO.</p>
        <p class="rule">One phone per team. Pick a team name your classmates will recognize.</p>
      </div>
      <div class="lobby-right">
        ${offline ? `<div class="offline-card"><b>Offline mode</b><p>Teams call out their choices and the host enters them.</p></div>` : `
        <div class="qr">${qrSvg(url)}</div>
        <p class="url">${esc(url.replace(/^https?:\/\//, ''))}</p>
        <p class="code">Room <b>${esc(snap.code)}</b></p>`}
      </div>
    </section>
    <div class="teams-joined"><b>${snap.teams.length} team${snap.teams.length === 1 ? '' : 's'} in</b>${snap.teams.map((t) => `<span class="chip done">${esc(t.name)}</span>`).join('')}</div>`;
  },

  intro() {
    return `
    <section class="intro">
      <p class="kicker">${esc(INTRO.kicker)}</p>
      <h1 class="big">${esc(INTRO.title)}</h1>
      ${INTRO.body.map((p) => `<p class="body">${esc(p)}</p>`).join('')}
      <div class="legend">${METERS.map((m) => `<div class="legend-item m-${m.key}"><i></i><b>${esc(m.label)}</b><small>${m.good === 'low' ? 'lower is better' : 'higher is better'}</small></div>`).join('')}</div>
      <p class="rewarded">${esc(INTRO.rewarded)}</p>
    </section>`;
  },

  question(snap) {
    const r = snap.state.round; const R = ROUNDS[r];
    return `
    <section class="question">
      <header class="qhead">${roundTag(r)}${timer(snap.state)}</header>
      <h1 class="big">${esc(R.title)}</h1>
      <p class="setup">${esc(R.setup)}</p>
      <div class="facts">${R.facts.map((f) => `<span>${esc(f)}</span>`).join('')}</div>
      ${R.quote ? `<blockquote>${esc(R.quote)}</blockquote>` : ''}
      <h2 class="prompt">${esc(R.prompt)}</h2>
      <div class="choices n${R.choices.length}">${R.choices.map((c) => `
        <div class="choice"><span class="letter">${c.id}</span><div><b>${esc(c.label)}</b><p>${esc(c.detail)}</p></div></div>`).join('')}
      </div>
      ${answeredStrip(snap, r)}
    </section>`;
  },

  tally(snap) {
    const r = snap.state.round; const R = ROUNDS[r];
    const t = tally(snap.teams, snap.answers, r);
    const max = Math.max(1, ...Object.values(t).map((a) => a.length));
    return `
    <section class="tally">
      <header class="qhead">${roundTag(r)}</header>
      <h1 class="big">How the room voted</h1>
      <div class="bars">${R.choices.map((c) => `
        <div class="bar-row">
          <span class="letter">${c.id}</span>
          <div class="bar-label"><b>${esc(c.label)}</b><small>${t[c.id].map(esc).join(', ') || '—'}</small></div>
          <div class="bar"><i style="width:${(t[c.id].length / max) * 100}%"></i><span>${t[c.id].length}</span></div>
        </div>`).join('')}
      </div>
    </section>`;
  },

  effects(snap) {
    const r = snap.state.round; const R = ROUNDS[r];
    const t = tally(snap.teams, snap.answers, r);
    return `
    <section class="effects">
      <header class="qhead">${roundTag(r)}</header>
      <h1 class="big">Consequences</h1>
      <div class="fx-wrap"><table class="fx">
        <thead><tr><th></th><th>Choice</th>${METERS.map((m) => `<th class="m-${m.key}">${esc(m.short)}</th>`).join('')}<th>Teams</th></tr></thead>
        <tbody>${R.choices.map((c) => `
          <tr><td><span class="letter">${c.id}</span></td><td><b>${esc(c.label)}</b></td>${METERS.map((m) => `<td>${delta(c.effects[m.key])}</td>`).join('')}<td class="n">${t[c.id].length}</td></tr>`).join('')}
        </tbody></table></div>
      <p class="note">Legal exposure: a plus sign means more risk for you.</p>
    </section>`;
  },

  don(snap) {
    const r = snap.state.round; const R = ROUNDS[r];
    const ch = R.choices.find((c) => c.id === R.don.choice);
    return `
    <section class="don">
      <header class="qhead">${roundTag(r)}</header>
      <p class="kicker">What Don actually did</p>
      <h1 class="big"><span class="letter inline">${ch.id}</span> ${esc(ch.label)}</h1>
      <p class="body">${esc(R.don.text)}</p>
      <blockquote class="pull">“${esc(R.don.quote)}”<cite>Don Russell</cite></blockquote>
    </section>`;
  },

  standings(snap) {
    const r = snap.state.round;
    const rows = standings(snap.teams, snap.answers, r, 'short');
    return `
    <section class="standings">
      <p class="kicker">After round ${r + 1}</p>
      <h1 class="big">What the company rewards</h1>
      <p class="sub">Ranked on reported earnings plus your bonus.</p>
      ${board(rows, 'short')}
    </section>`;
  },

  unravel(snap) {
    const rows = standings(snap.teams, snap.answers, ROUNDS.length - 1, 'short');
    return `
    <section class="unravel">
      <p class="kicker">${esc(UNRAVEL.kicker)}</p>
      <h1 class="big">The scheme unravels</h1>
      <ol class="timeline">${UNRAVEL.events.map((e) => `<li><b>${esc(e.when)}</b><span>${esc(e.text)}</span></li>`).join('')}</ol>
      <p class="line">${esc(UNRAVEL.line)}</p>
      ${rows.length ? `<p class="sub">Current leader on short-term results: <b>${esc(rows[0].name)}</b></p>` : ''}
    </section>`;
  },

  board(snap) {
    const n = snap.teams.filter((t) => snap.answers[t.id] && snap.answers[t.id][BOARD_ROUND] !== undefined).length;
    return `
    <section class="boardround">
      <header class="qhead"><div class="tag"><span>ETI</span><span>The new board</span><span>Round 6 of 6</span></div>${timer(snap.state)}</header>
      <h1 class="big">${esc(BOARD.title)}</h1>
      <p class="setup">${esc(BOARD.setup)}</p>
      <div class="fixes">${BOARD.fixes.map((f) => `<div class="fix"><b>${esc(f.label)}</b><span class="cost">${f.cost}</span></div>`).join('')}</div>
      <p class="sub">Budget: ${BOARD_BUDGET} points. Choose on your phone.</p>
      ${answeredStrip(snap, BOARD_ROUND)}
    </section>`;
  },

  boardfail(snap) {
    const i = snap.state.step - STEPS.findIndex((s) => s.kind === 'boardfail');
    const f = BOARD.failures[i];
    const fixNames = f.caughtBy.map((id) => BOARD.fixes.find((x) => x.id === id).label);
    const caught = []; const missed = [];
    snap.teams.forEach((t) => {
      const picks = validBoard(snap.answers[t.id] && snap.answers[t.id][BOARD_ROUND]);
      (f.caughtBy.some((id) => picks.includes(id)) ? caught : missed).push(t.name);
    });
    return `
    <section class="boardfail">
      <p class="kicker">ETI failure ${i + 1} of ${BOARD.failures.length} · ${esc(f.concept)}</p>
      <h1 class="big">${esc(f.text)}</h1>
      <p class="sub">Caught by: ${fixNames.map((n) => `<b>${esc(n)}</b>`).join(' or ')}</p>
      <div class="caught">
        <div><h3>Your board caught it</h3>${caught.map((n) => `<span class="chip done">${esc(n)}</span>`).join('') || '<span class="muted">No team</span>'}</div>
        <div><h3>Missed it</h3>${missed.map((n) => `<span class="chip miss">${esc(n)}</span>`).join('') || '<span class="muted">No team</span>'}</div>
      </div>
    </section>`;
  },

  final(snap) {
    const shortRows = standings(snap.teams, snap.answers, ROUNDS.length - 1, 'short');
    const rank = Object.fromEntries(shortRows.map((r, i) => [r.id, i + 1]));
    const rows = standings(snap.teams, snap.answers, ROUNDS.length - 1, 'final');
    return `
    <section class="final">
      <p class="kicker">Final standings</p>
      <h1 class="big">What actually mattered</h1>
      <p class="sub">Information quality, plus low legal exposure, plus 2 points for every ETI failure your board would have caught.</p>
      ${board(rows, 'final', rank)}
    </section>`;
  },

  quote() {
    return `
    <section class="quote">
      <blockquote class="pull huge">“${esc(CLOSING_QUOTE.text)}”<cite>${esc(CLOSING_QUOTE.who)}</cite></blockquote>
    </section>`;
  },
};

function board(rows, mode, prevRank) {
  if (!rows.length) return '<p class="muted">No teams yet.</p>';
  return `<div class="lb-wrap"><table class="lb">
    <thead><tr><th>#</th><th>Team</th>${METERS.map((m) => `<th class="m-${m.key}">${esc(m.short)}</th>`).join('')}${mode === 'final' ? '<th>Board</th>' : ''}<th>Score</th>${prevRank ? '<th>Move</th>' : ''}</tr></thead>
    <tbody>${rows.map((r, i) => {
      const move = prevRank ? prevRank[r.id] - (i + 1) : 0;
      return `<tr class="${i === 0 ? 'top' : ''}"><td class="n">${i + 1}</td><td><b>${esc(r.name)}</b></td>
        ${METERS.map((m) => `<td>${meterBar(m.key, r.meters[m.key])}<small>${r.meters[m.key]}</small></td>`).join('')}
        ${mode === 'final' ? `<td class="n">${r.catches}/6</td>` : ''}
        <td class="n score">${r.score}</td>
        ${prevRank ? `<td class="n move ${move > 0 ? 'up' : move < 0 ? 'down' : ''}">${move > 0 ? '▲' + move : move < 0 ? '▼' + -move : '–'}</td>` : ''}</tr>`;
    }).join('')}</tbody></table></div>`;
}

const TITLES = {
  lobby: () => 'Make the Number · Lobby',
  intro: () => 'Briefing',
  question: (s) => `Round ${s.round + 1} · Decision`,
  tally: (s) => `Round ${s.round + 1} · The vote`,
  effects: (s) => `Round ${s.round + 1} · Consequences`,
  don: (s) => `Round ${s.round + 1} · What Don did`,
  standings: () => 'Standings',
  unravel: () => 'Trading halted',
  board: () => 'Round 6 · The boardroom',
  boardfail: () => 'Audit log',
  final: () => 'Final standings',
  quote: () => 'End of simulation',
};

export function renderScreen(snap) {
  const kind = STEPS[snap.state.step ?? 0]?.kind || 'lobby';
  const html = (V[kind] || V.lobby)(snap);
  const title = (TITLES[kind] || TITLES.lobby)(snap.state);
  return `<div class="win main ${kind === 'unravel' ? 'alert' : ''} k-${kind}">
    <div class="titlebar"><span class="tb-icon"></span><span class="tb-title">${esc(title)}</span><span class="tb-btns"><i></i><i></i><i></i></span></div>
    <div class="win-body">${html}</div>
  </div>`;
}

export { boardCatches };
