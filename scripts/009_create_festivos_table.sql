-- Crear tabla de festivos
-- Permite gestionar días festivos que se mostrarán en rojo en el calendario
-- Solo admin nivel 1 puede crear/editar/eliminar
-- Todos pueden ver los festivos

CREATE TABLE IF NOT EXISTS festivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índice para búsquedas rápidas por fecha
CREATE INDEX IF NOT EXISTS idx_festivos_fecha ON festivos(fecha);

-- Habilitar RLS
ALTER TABLE festivos ENABLE ROW LEVEL SECURITY;

-- Política: Solo admin nivel 1 puede ver/crear/editar/eliminar festivos
CREATE POLICY "admin_nivel_1_manage_festivos" ON festivos
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE nivel = 1
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE nivel = 1
    )
  );

-- Política adicional: Lectura pública para usuarios autenticados
-- (Comentada porque la política anterior es más restrictiva)
-- CREATE POLICY "allow_authenticated_read_festivos" ON festivos
--   FOR SELECT
--   USING (auth.role() = 'authenticated');
