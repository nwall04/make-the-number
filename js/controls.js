// Host controls shared by the online host panel and the offline overlay.
import { STEPS, QUESTION_SECONDS, BOARD_SECONDS } from './content.js';
import { stateForStep } from './store.js';

export function secondsFor(step) {
  const k = STEPS[step]?.kind;
  return k === 'question' ? QUESTION_SECONDS : k === 'board' ? BOARD_SECONDS : 0;
}

export async function goTo(store, step) {
  const n = Math.max(0, Math.min(STEPS.length - 1, step));
  const prev = store.snapshot().state || {};
  const st = stateForStep(n, secondsFor(n));
  // The class clock starts the first time the host leaves the lobby and survives Back/Jump.
  if (prev.startedAt) st.startedAt = prev.startedAt;
  else if (n > 0) st.startedAt = new Date().toISOString();
  await store.setState(st);
}

// Seconds since the host left the lobby, or null before that.
export function elapsed(state) {
  if (!state?.startedAt) return null;
  return Math.max(0, Math.floor((Date.now() - Date.parse(state.startedAt)) / 1000));
}
export const next = (store) => goTo(store, (store.snapshot().state.step ?? 0) + 1);
export const back = (store) => goTo(store, (store.snapshot().state.step ?? 0) - 1);

export async function addTime(store, seconds) {
  const st = store.snapshot().state;
  if (!st.deadline) return;
  const base = Math.max(Date.now(), Date.parse(st.deadline));
  await store.setState({ ...st, deadline: new Date(base + seconds * 1000).toISOString() });
}
export async function lockNow(store) {
  const st = store.snapshot().state;
  if (!st.deadline) return;
  await store.setState({ ...st, deadline: new Date().toISOString() });
}
export async function reopen(store) {
  const st = store.snapshot().state;
  await store.setState({ ...st, deadline: new Date(Date.now() + secondsFor(st.step) * 1000).toISOString() });
}

export function remaining(state) {
  if (!state?.deadline) return null;
  return Math.max(0, Math.ceil((Date.parse(state.deadline) - Date.now()) / 1000));
}
export const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
