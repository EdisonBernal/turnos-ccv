-- Fix: permitir que TODOS los admin (nivel 1 y 2) puedan VER festivos
-- Actualmente solo admin nivel 1 puede leer la tabla festivos
-- Esto causaba que los días festivos no se mostraran en el calendario mensual para admin nivel 2

-- Eliminar la política existente que restringe todo a nivel 1
DROP POLICY IF EXISTS "admin_nivel_1_manage_festivos" ON festivos;

-- Política: Todos los admin autenticados pueden VER festivos
CREATE POLICY "all_admins_read_festivos" ON festivos
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM admin_users
    )
  );

-- Política: Solo admin nivel 1 puede INSERT/UPDATE/DELETE festivos
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
