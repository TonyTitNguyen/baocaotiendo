-- Supabase schema for baocaotiendo
-- Run in: Supabase Dashboard → SQL Editor → New query

-- 1. Tables

create table if not exists members (
  id         text primary key,
  name       text not null,
  role       text default 'Thành viên',
  created_at timestamptz default now()
);

create table if not exists projects (
  id          text primary key,
  code        text not null,
  name        text not null,
  description text default '',
  status      text default 'planning',
  priority    text default 'medium',
  budget      numeric default 0,
  start       date,
  "end"       date,
  leader_id   text references members(id) on delete set null,
  progress    int default 0,
  created_at  timestamptz default now()
);

create table if not exists tasks (
  id          text primary key,
  code        text not null,
  title       text not null,
  description text default '',
  project_id  text references projects(id) on delete cascade,
  assignee_id text references members(id) on delete set null,
  status      text default 'todo',
  priority    text default 'medium',
  start       date,
  due         date,
  tags        text[] default '{}',
  created_at  timestamptz default now()
);

create table if not exists activities (
  id   text primary key,
  text text not null,
  time timestamptz not null
);

-- 2. Row Level Security

alter table members    enable row level security;
alter table projects   enable row level security;
alter table tasks      enable row level security;
alter table activities enable row level security;

-- anon = read + write (same trust model as previous Google Sheets token)
create policy "anon all" on members    for all using (true) with check (true);
create policy "anon all" on projects   for all using (true) with check (true);
create policy "anon all" on tasks      for all using (true) with check (true);
create policy "anon all" on activities for all using (true) with check (true);

-- 3. Seed existing data (run AFTER exporting JSON from old app)
-- Paste exported JSON into browser console then run:
--
-- const sb = supabase.createClient('YOUR_URL', 'YOUR_ANON_KEY');
-- const d  = /* paste exported JSON object */;
-- await Promise.all([
--   sb.from('members').upsert(d.members),
--   sb.from('projects').upsert(d.projects),
--   sb.from('tasks').upsert(d.tasks),
--   sb.from('activities').upsert(d.activities),
-- ]);
