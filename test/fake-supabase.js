// In-browser stand-in for Supabase, used only by the local test script.
// Shares one database across tabs through localStorage and mimics the two RPC functions.
(function () {
  const KEY = 'fake-db';
  const load = () => JSON.parse(localStorage.getItem(KEY) || '{"rooms":[],"teams":[],"team_secrets":[],"answers":[]}');
  const save = (db) => { localStorage.setItem(KEY, JSON.stringify(db)); fire(); };
  const listeners = new Set();
  const fire = () => listeners.forEach((f) => setTimeout(f, 10));
  window.addEventListener('storage', (e) => { if (e.key === KEY) fire(); });
  const uid = () => crypto.randomUUID();

  function query(table) {
    const q = { table, filters: [], op: 'select', order: null, payload: null, single: false };
    const api = {
      select() { return api; },
      eq(c, v) { q.filters.push([c, v]); return api; },
      order(c, o) { q.order = [c, o?.ascending !== false]; return api; },
      maybeSingle() { q.single = true; return api; },
      update(p) { q.op = 'update'; q.payload = p; return api; },
      delete() { q.op = 'delete'; return api; },
      insert(p) { q.op = 'insert'; q.payload = p; return api; },
      upsert(p) { q.op = 'upsert'; q.payload = p; return api; },
      then(res, rej) { try { res(run(q)); } catch (e) { rej(e); } },
    };
    return api;
  }
  const match = (r, f) => f.every(([c, v]) => r[c] === v);
  function run(q) {
    const db = load(); const rows = db[q.table];
    if (q.op === 'select') {
      let out = rows.filter((r) => match(r, q.filters));
      if (q.order) out.sort((a, b) => (a[q.order[0]] > b[q.order[0]] ? 1 : -1) * (q.order[1] ? 1 : -1));
      return { data: q.single ? out[0] || null : out, error: null };
    }
    if (q.op === 'update') { rows.forEach((r) => { if (match(r, q.filters)) Object.assign(r, q.payload); }); save(db); return { error: null }; }
    if (q.op === 'delete') {
      const del = rows.filter((r) => match(r, q.filters));
      db[q.table] = rows.filter((r) => !match(r, q.filters));
      if (q.table === 'rooms') del.forEach((d) => { db.teams = db.teams.filter((t) => t.room_code !== d.code); db.answers = db.answers.filter((a) => a.room_code !== d.code); });
      if (q.table === 'teams') del.forEach((d) => { db.answers = db.answers.filter((a) => a.team_id !== d.id); });
      save(db); return { error: null };
    }
    if (q.op === 'insert') {
      const list = Array.isArray(q.payload) ? q.payload : [q.payload];
      for (const p of list) {
        if (q.table === 'rooms') { if (rows.some((r) => r.code === p.code)) return { error: { message: 'duplicate key' } }; rows.push({ host_id: 'host', created_at: new Date().toISOString(), ...p }); }
        else if (q.table === 'teams') { if (rows.some((r) => r.room_code === p.room_code && r.name === p.name)) return { error: { message: 'duplicate key' } }; rows.push({ id: uid(), created_at: new Date().toISOString(), ...p }); }
        else rows.push(p);
      }
      save(db); return { error: null };
    }
    if (q.op === 'upsert') {
      const p = q.payload; const i = rows.findIndex((r) => r.team_id === p.team_id && r.round === p.round);
      if (i >= 0) rows[i] = { ...rows[i], ...p }; else rows.push(p);
      save(db); return { error: null };
    }
  }

  function rpc(name, a) {
    const db = load();
    const err = (m) => Promise.resolve({ data: null, error: { message: m } });
    if (name === 'join_team') {
      const code = a.p_code.toUpperCase(); const n = a.p_name.trim();
      if (!db.rooms.some((r) => r.code === code)) return err('room_not_found');
      if (!n || n.length > 24) return err('bad_name');
      if (db.teams.some((t) => t.room_code === code && t.name === n)) return err('name_taken');
      const id = uid(); const secret = uid();
      db.teams.push({ id, room_code: code, name: n, created_at: new Date().toISOString() });
      db.team_secrets.push({ team_id: id, secret }); save(db);
      return Promise.resolve({ data: { team_id: id, secret, room_code: code, name: n }, error: null });
    }
    if (name === 'submit_answer') {
      const s = db.team_secrets.find((x) => x.team_id === a.p_team && x.secret === a.p_secret);
      const t = db.teams.find((x) => x.id === a.p_team);
      if (!s || !t) return err('not_your_team');
      const st = db.rooms.find((r) => r.code === t.room_code).state;
      if (!['question', 'board'].includes(st.kind) || st.round !== a.p_round) return err('round_closed');
      if (st.deadline && Date.now() > Date.parse(st.deadline) + 3000) return err('time_up');
      const i = db.answers.findIndex((r) => r.team_id === a.p_team && r.round === a.p_round);
      const row = { team_id: a.p_team, room_code: t.room_code, round: a.p_round, choice: a.p_choice };
      if (i >= 0) db.answers[i] = row; else db.answers.push(row);
      save(db); return Promise.resolve({ data: null, error: null });
    }
    return err('unknown rpc');
  }

  window.__MTN_FAKE_CLIENT__ = {
    from: query,
    rpc,
    channel() {
      const handlers = [];
      const ch = {
        on(_t, _f, cb) { handlers.push(cb); return ch; },
        subscribe(cb) { listeners.add(() => handlers.forEach((h) => h({}))); setTimeout(() => cb && cb('SUBSCRIBED'), 20); return ch; },
      };
      return ch;
    },
    auth: {
      getSession: async () => ({ data: { session: { user: { id: 'host' } } } }),
      signInWithPassword: async () => ({ data: { user: { id: 'host' } }, error: null }),
      signOut: async () => ({}),
    },
  };
})();
