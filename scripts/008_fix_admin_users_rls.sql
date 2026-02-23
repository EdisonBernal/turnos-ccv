DROP POLICY IF EXISTS "admin_select" ON admin_users;
DROP POLICY IF EXISTS "admin_insert" ON admin_users;
DROP POLICY IF EXISTS "admin_update" ON admin_users;
DROP POLICY IF EXISTS "admin_delete" ON admin_users;

CREATE POLICY "admin_users_select" ON admin_users
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "admin_users_insert" ON admin_users
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "admin_users_update" ON admin_users
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "admin_users_delete" ON admin_users
  FOR DELETE
  USING (auth.role() = 'authenticated');
