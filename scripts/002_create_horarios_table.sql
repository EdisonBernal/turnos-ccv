-- Create horarios (schedules) table
create table if not exists public.horarios (
  id uuid primary key default gen_random_uuid(),
  personal_id uuid not null references public.personal(id) on delete cascade,
  dia text not null,
  jornada_manana text,
  jornada_tarde text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.horarios enable row level security;

-- Policy: Allow anyone to view horarios (public data)
create policy "horarios_select_all"
  on public.horarios for select
  using (true);
