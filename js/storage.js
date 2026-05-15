const _sb = (() => {
  const c = window.CLOUD_CONFIG || {};
  if (!c.supabaseUrl || String(c.supabaseUrl).startsWith('PASTE')) return null;
  return window.supabase.createClient(c.supabaseUrl, c.supabaseKey);
})();

const Store = {
  load() {
    return structuredClone(window.SEED_DATA);
  },

  async pull() {
    if (!_sb) throw new Error('not configured');
    const [m, p, t, a] = await Promise.all([
      _sb.from('members').select('*'),
      _sb.from('projects').select('*'),
      _sb.from('tasks').select('*'),
      _sb.from('activities').select('*').order('time', { ascending: false }).limit(120),
    ]);
    if (m.error) throw m.error;
    if (p.error) throw p.error;
    if (t.error) throw t.error;
    if (a.error) throw a.error;
    return { members: m.data, projects: p.data, tasks: t.data, activities: a.data };
  },

  async push(data) {
    if (!_sb) return;
    const results = await Promise.all([
      _sb.from('members').upsert(data.members, { onConflict: 'id' }),
      _sb.from('projects').upsert(data.projects, { onConflict: 'id' }),
      _sb.from('tasks').upsert(data.tasks, { onConflict: 'id' }),
      _sb.from('activities').upsert(data.activities, { onConflict: 'id' }),
    ]);
    const err = results.find(r => r.error);
    if (err) throw err.error;
  },

  save(data) {
    // Browser persistence disabled. Data pushed online by debouncedPush().
  },

  export(data) {
    const b = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const u = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = u;
    a.download = 'bao-cao-tien-do-hoang-dieu-linh.json';
    a.click();
    URL.revokeObjectURL(u);
  },
};
