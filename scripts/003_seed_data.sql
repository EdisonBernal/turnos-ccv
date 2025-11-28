-- Insert sample staff
insert into public.personal (nombre_completo, area, foto_url, telefono, en_turno, orden) values
  ('María García López', 'Sistemas', '/placeholder.svg?height=200&width=200', '+34 612 345 678', true, 1),
  ('Juan Rodríguez Martín', 'Servicios Generales', '/placeholder.svg?height=200&width=200', '+34 623 456 789', true, 2),
  ('Ana Fernández Silva', 'Marketing', '/placeholder.svg?height=200&width=200', '+34 634 567 890', false, 3),
  ('Carlos López Ruiz', 'Mantenimiento', '/placeholder.svg?height=200&width=200', '+34 645 678 901', true, 4),
  ('Laura Sánchez García', 'Sistemas', '/placeholder.svg?height=200&width=200', '+34 656 789 012', false, 5),
  ('David Martínez González', 'Servicios Generales', '/placeholder.svg?height=200&width=200', '+34 667 890 123', true, 6);

-- Insert schedules
insert into public.horarios (personal_id, dia, jornada_manana, jornada_tarde) values
  ((select id from public.personal where nombre_completo = 'María García López'), 'Lunes', '08:00–12:00', '14:00–18:00'),
  ((select id from public.personal where nombre_completo = 'María García López'), 'Martes', '08:00–12:00', '14:00–18:00'),
  ((select id from public.personal where nombre_completo = 'María García López'), 'Miércoles', '08:00–12:00', '14:00–18:00'),
  ((select id from public.personal where nombre_completo = 'María García López'), 'Jueves', '08:00–12:00', '14:00–18:00'),
  ((select id from public.personal where nombre_completo = 'María García López'), 'Viernes', '08:00–12:00', '14:00–18:00'),
  
  ((select id from public.personal where nombre_completo = 'Juan Rodríguez Martín'), 'Lunes', '06:00–10:00', '16:00–20:00'),
  ((select id from public.personal where nombre_completo = 'Juan Rodríguez Martín'), 'Martes', '06:00–10:00', '16:00–20:00'),
  ((select id from public.personal where nombre_completo = 'Juan Rodríguez Martín'), 'Miércoles', '06:00–10:00', '16:00–20:00'),
  ((select id from public.personal where nombre_completo = 'Juan Rodríguez Martín'), 'Jueves', '06:00–10:00', '16:00–20:00'),
  ((select id from public.personal where nombre_completo = 'Juan Rodríguez Martín'), 'Viernes', '06:00–10:00', '16:00–20:00'),
  
  ((select id from public.personal where nombre_completo = 'Ana Fernández Silva'), 'Lunes', '09:00–13:00', '15:00–19:00'),
  ((select id from public.personal where nombre_completo = 'Ana Fernández Silva'), 'Martes', '09:00–13:00', '15:00–19:00'),
  ((select id from public.personal where nombre_completo = 'Ana Fernández Silva'), 'Miércoles', '09:00–13:00', '15:00–19:00'),
  ((select id from public.personal where nombre_completo = 'Ana Fernández Silva'), 'Jueves', '09:00–13:00', '15:00–19:00'),
  ((select id from public.personal where nombre_completo = 'Ana Fernández Silva'), 'Viernes', '09:00–13:00', '15:00–19:00'),
  
  ((select id from public.personal where nombre_completo = 'Carlos López Ruiz'), 'Lunes', '07:00–11:00', '13:00–17:00'),
  ((select id from public.personal where nombre_completo = 'Carlos López Ruiz'), 'Martes', '07:00–11:00', '13:00–17:00'),
  ((select id from public.personal where nombre_completo = 'Carlos López Ruiz'), 'Miércoles', '07:00–11:00', '13:00–17:00'),
  ((select id from public.personal where nombre_completo = 'Carlos López Ruiz'), 'Jueves', '07:00–11:00', '13:00–17:00'),
  ((select id from public.personal where nombre_completo = 'Carlos López Ruiz'), 'Viernes', '07:00–11:00', '13:00–17:00'),
  
  ((select id from public.personal where nombre_completo = 'Laura Sánchez García'), 'Lunes', '08:00–12:00', '14:00–18:00'),
  ((select id from public.personal where nombre_completo = 'Laura Sánchez García'), 'Martes', '08:00–12:00', '14:00–18:00'),
  ((select id from public.personal where nombre_completo = 'Laura Sánchez García'), 'Miércoles', '08:00–12:00', '14:00–18:00'),
  ((select id from public.personal where nombre_completo = 'Laura Sánchez García'), 'Jueves', '08:00–12:00', '14:00–18:00'),
  ((select id from public.personal where nombre_completo = 'Laura Sánchez García'), 'Viernes', '08:00–12:00', '14:00–18:00'),
  
  ((select id from public.personal where nombre_completo = 'David Martínez González'), 'Lunes', '06:00–10:00', '16:00–20:00'),
  ((select id from public.personal where nombre_completo = 'David Martínez González'), 'Martes', '06:00–10:00', '16:00–20:00'),
  ((select id from public.personal where nombre_completo = 'David Martínez González'), 'Miércoles', '06:00–10:00', '16:00–20:00'),
  ((select id from public.personal where nombre_completo = 'David Martínez González'), 'Jueves', '06:00–10:00', '16:00–20:00'),
  ((select id from public.personal where nombre_completo = 'David Martínez González'), 'Viernes', '06:00–10:00', '16:00–20:00');
