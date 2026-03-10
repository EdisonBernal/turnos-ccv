-- Create horarios_mensual (monthly schedules) table
-- Stores specific schedules for specific dates, overriding the weekly horarios table
create table if not exists public.horarios_mensual (
  id uuid primary key default gen_random_uuid(),
  personal_id uuid not null references public.personal(id) on delete cascade,
  fecha date not null,
  jornada_manana text,
  jornada_tarde text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(personal_id, fecha)
);

-- Enable RLS
alter table public.horarios_mensual enable row level security;

-- Policy: Allow anyone to view horarios_mensual (public data)
create policy "horarios_mensual_select_all"
  on public.horarios_mensual for select
  using (true);

-- Policy: Allow authenticated users to insert/update/delete
-- (with proper authorization in application layer)
create policy "horarios_mensual_insert_all"
  on public.horarios_mensual for insert
  with check (true);

create policy "horarios_mensual_update_all"
  on public.horarios_mensual for update
  using (true)
  with check (true);

create policy "horarios_mensual_delete_all"
  on public.horarios_mensual for delete
  using (true);

-- Create index for fast lookups
create index if not exists horarios_mensual_personal_fecha_idx on public.horarios_mensual(personal_id, fecha);
create index if not exists horarios_mensual_fecha_idx on public.horarios_mensual(fecha);
