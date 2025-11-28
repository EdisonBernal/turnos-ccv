-- Create personal (staff) table
create table if not exists public.personal (
  id uuid primary key default gen_random_uuid(),
  nombre_completo text not null,
  area text not null,
  foto_url text,
  telefono text,
  en_turno boolean default false,
  orden integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.personal enable row level security;

-- Policy: Allow anyone to view personal (public data)
create policy "personal_select_all"
  on public.personal for select
  using (true);
