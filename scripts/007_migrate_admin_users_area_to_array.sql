ALTER TABLE admin_users ADD COLUMN area_temp text[];

UPDATE admin_users 
SET area_temp = CASE 
  WHEN area IS NOT NULL AND area != '' THEN ARRAY[area]
  ELSE NULL
END;

ALTER TABLE admin_users DROP COLUMN area;

ALTER TABLE admin_users RENAME COLUMN area_temp TO area;

ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_level_1_select" ON admin_users;
DROP POLICY IF EXISTS "admin_level_2_self_select" ON admin_users;
DROP POLICY IF EXISTS "admin_insert" ON admin_users;
DROP POLICY IF EXISTS "admin_update" ON admin_users;
DROP POLICY IF EXISTS "admin_delete" ON admin_users;

CREATE POLICY "admin_select" ON admin_users
  FOR SELECT
  USING (true);

CREATE POLICY "admin_insert" ON admin_users
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "admin_update" ON admin_users
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "admin_delete" ON admin_users
  FOR DELETE
  USING (true);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
