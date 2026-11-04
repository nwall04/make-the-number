// Projector. Online: screen.html?room=ABCD (read only, driven by the host's MacBook).
// Offline fallback: screen.html?offline=1 (this machine is screen and host; press H for controls).
import { STEPS } from './content.js';
import { OnlineStore, OfflineStore } from './store.js';
import { isConfigured } from './config.js';
import { renderScreen, esc } from './views.js';
import { next, back, addTime, lockNow, reopen, goTo, remaining, fmt } from './controls.js';
import { renderEntry, renderTeams, bindEntry, patch } from './entry.js';

const params = new URLSearchParams(location.search);
const offline = params.has('offline');
const code = (params.get('room') || '').toUpperCase();
const stage = document.getElementById('stage');
const panel = document.getElementById('panel');

function message(title, body) {
  stage.innerHTML = `<div class="win main"><div class="titlebar"><span class="tb-icon"></span><span class="tb-title">${esc(title)}</span><span class="tb-btns"><i></i><i></i><i></i></span></div><div class="win-body"><p class="body">${body}</p></div></div>`;
}

let store;
if (offline) store = new OfflineStore();
else if (!isConfigured()) { message('SETUP NEEDED', 'Add the Supabase URL and anon key to <code>js/config.js</code>, or open <code>screen.html?offline=1</code> for the offline version.'); }
else if (!code) { message('NO ROOM', 'Open this page from the host panel, or add <code>?room=ABCD</code> to the address.'); }
else store = new OnlineStore(code);

let lastKey = '';
function render(snap) {
  if (!snap.exists && !offline) { message('ROOM NOT FOUND', `Room ${esc(snap.code)} does not exist yet. Create it from the host panel.`); return; }
  const key = JSON.stringify([snap.state.step, snap.state.deadline, snap.teams, snap.answers]);
  if (key !== lastKey) { stage.innerHTML = renderScreen(snap); lastKey = key; }
  const s = STEPS[snap.state.step ?? 0];
  document.getElementById('tb-step').textContent = `${(snap.state.step ?? 0) + 1}/${STEPS.length} ${s?.label || ''}`;
  document.getElementById('tb-room').textContent = offline ? 'OFFLINE MODE' : `ROOM ${snap.code}`;
  const st = document.getElementById('tb-status');
  st.textContent = snap.status === 'live' ? '● LIVE' : snap.status === 'offline' ? '● LOCAL' : '○ ' + snap.status.toUpperCase();
  st.className = `tb-item status-${snap.status}`;
  if (offline) renderPanel(snap);
}

// Timer and clock tick without re-rendering the whole view.
setInterval(() => {
  const now = new Date();
  document.getElementById('tb-clock').textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (!store) return;
  const t = stage.querySelector('[data-timer]');
  if (!t) return;
  const r = remaining(store.snapshot().state);
  if (r === null) return;
  t.textContent = r === 0 ? 'Time' : fmt(r);
  t.classList.toggle('low', r <= 10);
  t.classList.toggle('out', r === 0);
}, 250);

// ---------- Offline control panel ----------
function renderPanel(snap) {
  if (!panel.dataset.built) {
    panel.innerHTML = `
      <div class="win small">
        <div class="titlebar"><span class="tb-icon"></span><span class="tb-title">HOST_CONTROLS.EXE (H to hide)</span></div>
        <div class="win-body panel-body">
          <div class="ctrl-row">
            <button type="button" class="btn" data-act="back">◀ Back</button>
            <button type="button" class="btn primary" data-act="next">Next ▶</button>
            <button type="button" class="btn" data-act="add30">+30 s</button>
            <button type="button" class="btn" data-act="lock">Lock</button>
            <button type="button" class="btn" data-act="reopen">Reopen</button>
          </div>
          <label class="field">Jump to <select id="jump"></select></label>
          <h4>Teams</h4>
          <form id="addTeam" class="ctrl-row"><input id="teamName" maxlength="24" placeholder="Team name" autocomplete="off"><button class="btn" type="submit">Add</button></form>
          <div id="teams"></div>
          <h4>Answers this step</h4>
          <div id="entry"></div>
          <p class="muted small-print">Saved on this computer. <button type="button" class="link danger" id="resetAll">Reset everything</button></p>
        </div>
      </div>`;
    panel.dataset.built = '1';
    panel.hidden = false;
    const jump = panel.querySelector('#jump');
    jump.innerHTML = STEPS.map((s, i) => `<option value="${i}">${i + 1}. ${esc(s.label)}</option>`).join('');
    jump.addEventListener('change', () => goTo(store, Number(jump.value)));
    panel.addEventListener('click', (e) => {
      const a = e.target.closest('[data-act]')?.dataset.act;
      if (a === 'next') next(store); else if (a === 'back') back(store);
      else if (a === 'add30') addTime(store, 30); else if (a === 'lock') lockNow(store); else if (a === 'reopen') reopen(store);
    });
    panel.querySelector('#addTeam').addEventListener('submit', (e) => {
      e.preventDefault(); const i = panel.querySelector('#teamName'); store.addTeam(i.value); i.value = ''; i.focus();
    });
    const reset = panel.querySelector('#resetAll');
    reset.addEventListener('click', () => {
      if (reset.dataset.confirm !== '1') { reset.dataset.confirm = '1'; reset.textContent = 'Click again to erase all teams and answers'; return; }
      store.resetAll(); reset.dataset.confirm = ''; reset.textContent = 'Reset everything';
    });
    bindEntry(panel, store, (err) => alertBar(err.message));
  }
  panel.querySelector('#jump').value = String(snap.state.step ?? 0);
  patch(panel.querySelector('#teams'), renderTeams(snap));
  patch(panel.querySelector('#entry'), renderEntry(snap));
}

function alertBar(msg) {
  let el = document.getElementById('toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; document.body.appendChild(el); }
  el.textContent = msg; el.hidden = false; clearTimeout(el._t); el._t = setTimeout(() => (el.hidden = true), 3000);
}

document.addEventListener('keydown', (e) => {
  if (e.target.matches('input, select, textarea')) return;
  if (e.key === 'f' || e.key === 'F') { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.().catch(() => {}); }
  if (!offline || !store) return;
  if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(store); }
  if (e.key === 'ArrowLeft') back(store);
  if (e.key === 'h' || e.key === 'H') panel.hidden = !panel.hidden;
});

if (store) store.start().then((s) => s.onChange(render)).catch((err) => message('CONNECTION ERROR', esc(err.message || String(err))));
