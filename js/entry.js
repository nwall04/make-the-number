// Manual answer entry and team management, used by the host panel and the offline overlay.
import { STEPS, ROUNDS, BOARD, BOARD_ROUND, BOARD_BUDGET, validBoard } from './content.js';
import { esc } from './views.js';

export function entryRound(snap) {
  const s = STEPS[snap.state.step ?? 0];
  if (!s) return null;
  if (s.kind === 'board' || s.kind === 'boardfail') return BOARD_ROUND;
  if (s.round !== undefined && s.round !== null) return s.round;
  return null;
}

export function renderEntry(snap) {
  const round = entryRound(snap);
  if (round === null) return '<p class="muted">No answers are collected on this step.</p>';
  if (!snap.teams.length) return '<p class="muted">No teams yet.</p>';
  if (round === BOARD_ROUND) {
    return `<div class="entry-board">${snap.teams.map((t) => {
      const picks = validBoard(snap.answers[t.id]?.[BOARD_ROUND]);
      const spent = picks.reduce((a, id) => a + BOARD.fixes.find((f) => f.id === id).cost, 0);
      return `<details class="eb" data-team="${t.id}"><summary><b>${esc(t.name)}</b> <span class="muted">${picks.length} fixes · ${spent}/${BOARD_BUDGET}</span></summary>
        <div class="eb-fixes">${BOARD.fixes.map((f) => `<label><input type="checkbox" data-board="${t.id}" value="${f.id}" ${picks.includes(f.id) ? 'checked' : ''}> ${esc(f.label)} <span class="muted">(${f.cost})</span></label>`).join('')}</div></details>`;
    }).join('')}</div>`;
  }
  const R = ROUNDS[round];
  return `<table class="entry"><tbody>${snap.teams.map((t) => {
    const cur = snap.answers[t.id]?.[round];
    return `<tr><td>${esc(t.name)}</td><td>${R.choices.map((c) => `<button type="button" class="pick ${cur === c.id ? 'on' : ''}" data-team="${t.id}" data-round="${round}" data-choice="${c.id}">${c.id}</button>`).join('')}</td></tr>`;
  }).join('')}</tbody></table>`;
}

export function renderTeams(snap) {
  return `<ul class="team-list">${snap.teams.map((t) => `<li><span>${esc(t.name)}</span><button type="button" class="link danger" data-remove="${t.id}">Remove</button></li>`).join('') || '<li class="muted">No teams yet.</li>'}</ul>`;
}

// Replace innerHTML but keep any open <details> open.
export function patch(el, html) {
  if (el._last === html) return;
  const open = new Set([...el.querySelectorAll('details[open]')].map((d) => d.dataset.team));
  el.innerHTML = html; el._last = html;
  el.querySelectorAll('details[data-team]').forEach((d) => { if (open.has(d.dataset.team)) d.open = true; });
}

export function bindEntry(root, store, onError = console.error) {
  root.addEventListener('click', async (e) => {
    const b = e.target.closest('button.pick');
    if (b) {
      const snap = store.snapshot();
      const round = Number(b.dataset.round);
      const cur = snap.answers[b.dataset.team]?.[round];
      try { await store.overrideAnswer(b.dataset.team, round, cur === b.dataset.choice ? null : b.dataset.choice); } catch (err) { onError(err); }
      return;
    }
    const rm = e.target.closest('[data-remove]');
    if (rm) {
      if (rm.dataset.confirm !== '1') { rm.dataset.confirm = '1'; rm.textContent = 'Confirm remove'; setTimeout(() => { rm.dataset.confirm = ''; rm.textContent = 'Remove'; }, 3000); return; }
      try { await store.removeTeam(rm.dataset.remove); } catch (err) { onError(err); }
    }
  });
  root.addEventListener('change', async (e) => {
    const cb = e.target.closest('input[data-board]');
    if (!cb) return;
    const team = cb.dataset.board;
    const boxes = [...root.querySelectorAll(`input[data-board="${team}"]`)];
    let picks = boxes.filter((x) => x.checked).map((x) => x.value);
    const valid = validBoard(picks);
    if (valid.length !== picks.length) { cb.checked = false; picks = valid; onError(new Error('That fix goes over the 100-point budget.')); }
    try { await store.overrideAnswer(team, BOARD_ROUND, picks); } catch (err) { onError(err); }
  });
}
