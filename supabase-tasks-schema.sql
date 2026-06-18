-- TM-HR-Pulse tasks schema and repair migration
-- Run this in the Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  task_name text not null,
  description text,
  assigned_to text,
  start_date date,
  due_date date,
  priority text not null default 'Medium',
  status text not null default 'Pending',
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_priority_check check (priority in ('Low', 'Medium', 'High')),
  constraint tasks_status_check check (status in ('Pending', 'In Progress', 'Completed'))
);

-- Repair an existing tasks table without data loss.
alter table public.tasks
  add column if not exists id uuid default gen_random_uuid();

alter table public.tasks
  add column if not exists task_name text;

alter table public.tasks
  add column if not exists description text;

alter table public.tasks
  add column if not exists assigned_to text;

alter table public.tasks
  add column if not exists start_date date;

alter table public.tasks
  add column if not exists due_date date;

alter table public.tasks
  add column if not exists priority text default 'Medium';

alter table public.tasks
  add column if not exists status text default 'Pending';

alter table public.tasks
  add column if not exists created_by uuid references auth.users(id) on delete set null default auth.uid();

alter table public.tasks
  add column if not exists created_at timestamptz default now();

alter table public.tasks
  add column if not exists updated_at timestamptz default now();

update public.tasks set task_name = 'Untitled task' where task_name is null;
update public.tasks set priority = 'Medium' where priority is null;
update public.tasks set status = 'Pending' where status is null;
update public.tasks set created_at = now() where created_at is null;
update public.tasks set updated_at = now() where updated_at is null;

alter table public.tasks
  alter column task_name set not null,
  alter column priority set not null,
  alter column status set not null,
  alter column created_at set default now(),
  alter column created_at set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'tasks_priority_check'
      and conrelid = 'public.tasks'::regclass
  ) then
    alter table public.tasks
      add constraint tasks_priority_check check (priority in ('Low', 'Medium', 'High'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'tasks_status_check'
      and conrelid = 'public.tasks'::regclass
  ) then
    alter table public.tasks
      add constraint tasks_status_check check (status in ('Pending', 'In Progress', 'Completed'));
  end if;
end $$;

create or replace function public.set_tasks_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_tasks_updated_at on public.tasks;

create trigger set_tasks_updated_at
before update on public.tasks
for each row
execute function public.set_tasks_updated_at();

alter table public.tasks enable row level security;

drop policy if exists "Authenticated users can read tasks" on public.tasks;
drop policy if exists "Authenticated users can insert tasks" on public.tasks;
drop policy if exists "Authenticated users can update tasks" on public.tasks;
drop policy if exists "Authenticated users can delete tasks" on public.tasks;

create policy "Authenticated users can read tasks"
on public.tasks
for select
to authenticated
using (true);

create policy "Authenticated users can insert tasks"
on public.tasks
for insert
to authenticated
with check (true);

create policy "Authenticated users can update tasks"
on public.tasks
for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can delete tasks"
on public.tasks
for delete
to authenticated
using (true);

create index if not exists tasks_due_date_idx on public.tasks (due_date);
create index if not exists tasks_status_idx on public.tasks (status);
create index if not exists tasks_priority_idx on public.tasks (priority);
create index if not exists tasks_assigned_to_idx on public.tasks (assigned_to);
create index if not exists tasks_created_at_idx on public.tasks (created_at desc);
