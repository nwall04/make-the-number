// Data layer. OnlineStore talks to Supabase; OfflineStore keeps everything on one machine
// (the classroom fallback). Both expose the same shape so the projector renders either.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { STEPS } from './content.js';

let _client = null;
export async function client() {
  if (_client) return _client;
  if (window.__MTN_FAKE_CLIENT__) return (_client = window.__MTN_FAKE_CLIENT__); // local tests only
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.3/+esm');
  _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true } });
  return _client;
}

function toAnswerMap(rows) {
  const a = {};
  for (const r of rows) {
    (a[r.team_id] ||= {})[r.round] = r.choice;
  }
  return a;
}

export function stateForStep(step, seconds) {
  const s = STEPS[step];
  return {
    step,
    kind: s.kind,
    round: s.round ?? null,
    deadline: seconds ? new Date(Date.now() + seconds * 1000).toISOString() : null,
  };
}

class Emitter {
  constructor() { this._subs = new Set(); }
  onChange(fn) { this._subs.add(fn); fn(this.snapshot()); return () => this._subs.delete(fn); }
  emit() { const s = this.snapshot(); this._subs.forEach((f) => f(s)); }
}

export class OnlineStore extends Emitter {
  constructor(code) {
    super();
    this.code = code.toUpperCase();
    this.room = null; this.teams = []; this.answers = {}; this.status = 'connecting';
  }
  snapshot() {
    return { code: this.code, state: this.room?.state || { step: 0, kind: 'lobby' }, teams: this.teams, answers: this.answers, status: this.status, exists: !!this.room };
  }
  async start() {
    const sb = await client();
    await this.refresh();
    this.channel = sb.channel(`room-${this.code}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `code=eq.${this.code}` }, (p) => {
        if (p.new && p.new.code) { this.room = p.new; this.emit(); } else this.refresh();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams', filter: `room_code=eq.${this.code}` }, () => this.refreshTeams())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'answers', filter: `room_code=eq.${this.code}` }, () => this.refreshAnswers())
      .subscribe((st) => {
        this.status = st === 'SUBSCRIBED' ? 'live' : st === 'CLOSED' || st === 'CHANNEL_ERROR' || st === 'TIMED_OUT' ? 'reconnecting' : this.status;
        if (st === 'SUBSCRIBED') this.refresh();
        this.emit();
      });
    // Safety net: poll every 5 s in case a realtime event is missed.
    this.poll = setInterval(() => this.refresh(), 5000);
    return this;
  }
  async refresh() {
    const sb = await client();
    const { data } = await sb.from('rooms').select('*').eq('code', this.code).maybeSingle();
    this.room = data || null;
    await Promise.all([this.refreshTeams(false), this.refreshAnswers(false)]);
    this.emit();
  }
  async refreshTeams(emit = true) {
    const sb = await client();
    const { data } = await sb.from('teams').select('id,name,created_at').eq('room_code', this.code).order('created_at');
    if (data) this.teams = data;
    if (emit) this.emit();
  }
  async refreshAnswers(emit = true) {
    const sb = await client();
    const { data } = await sb.from('answers').select('team_id,round,choice').eq('room_code', this.code);
    if (data) this.answers = toAnswerMap(data);
    if (emit) this.emit();
  }
  // ----- host actions (need a signed-in host) -----
  async setState(state) {
    const sb = await client();
    const { error } = await sb.from('rooms').update({ state }).eq('code', this.code);
    if (error) throw error;
    this.room = { ...(this.room || {}), state }; this.emit();
  }
  async overrideAnswer(teamId, round, choice) {
    const sb = await client();
    const { error } = choice === null
      ? await sb.from('answers').delete().eq('team_id', teamId).eq('round', round)
      : await sb.from('answers').upsert({ team_id: teamId, room_code: this.code, round, choice, updated_at: new Date().toISOString() });
    if (error) throw error;
    await this.refreshAnswers();
  }
  async addTeam(name) {
    const sb = await client();
    const { error } = await sb.from('teams').insert({ room_code: this.code, name });
    if (error) throw error;
    await this.refreshTeams();
  }
  async removeTeam(id) {
    const sb = await client();
    const { error } = await sb.from('teams').delete().eq('id', id);
    if (error) throw error;
    await this.refresh();
  }
  async clearAnswers() {
    const sb = await client();
    const { error } = await sb.from('answers').delete().eq('room_code', this.code);
    if (error) throw error;
    await this.refreshAnswers();
  }
}

// ---------- Offline fallback: one machine, host enters team choices by hand ----------
const LS_KEY = 'mtn-offline-v1';
export class OfflineStore extends Emitter {
  constructor() {
    super();
    this.code = 'OFFLINE';
    const saved = (() => { try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch { return null; } })();
    this.state = saved?.state || stateForStep(0, 0);
    this.teams = saved?.teams || [];
    this.answers = saved?.answers || {};
  }
  snapshot() { return { code: this.code, state: this.state, teams: this.teams, answers: this.answers, status: 'offline', exists: true }; }
  save() { try { localStorage.setItem(LS_KEY, JSON.stringify({ state: this.state, teams: this.teams, answers: this.answers })); } catch {} this.emit(); }
  async start() { return this; }
  async setState(state) { this.state = state; this.save(); }
  async overrideAnswer(teamId, round, choice) {
    const t = (this.answers[teamId] ||= {});
    if (choice === null) delete t[round]; else t[round] = choice;
    this.save();
  }
  async addTeam(name) {
    const n = name.trim().slice(0, 24);
    if (!n || this.teams.some((t) => t.name.toLowerCase() === n.toLowerCase())) return;
    this.teams.push({ id: 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), name: n });
    this.save();
  }
  async removeTeam(id) { this.teams = this.teams.filter((t) => t.id !== id); delete this.answers[id]; this.save(); }
  async clearAnswers() { this.answers = {}; this.save(); }
  async resetAll() { this.teams = []; this.answers = {}; this.state = stateForStep(0, 0); this.save(); }
}
