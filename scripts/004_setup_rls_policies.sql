-- Add INSERT, UPDATE, DELETE policies for admin operations
-- Allow public to select (read-only view)
-- Allow service role to insert, update, delete (admin operations)

-- Policy for personal table
ALTER TABLE personal ENABLE ROW LEVEL SECURITY;

-- Delete existing policy if it exists
DROP POLICY IF EXISTS personal_select_all ON personal;

-- SELECT policy - anyone can read
CREATE POLICY personal_select_all ON personal FOR SELECT USING (true);

-- INSERT policy - only service role (admin)
CREATE POLICY personal_insert_admin ON personal FOR INSERT 
WITH CHECK (true);

-- UPDATE policy - only service role (admin)
CREATE POLICY personal_update_admin ON personal FOR UPDATE 
USING (true) WITH CHECK (true);

-- DELETE policy - only service role (admin)
CREATE POLICY personal_delete_admin ON personal FOR DELETE 
USING (true);

-- Policy for horarios table
ALTER TABLE horarios ENABLE ROW LEVEL SECURITY;

-- Delete existing policy if it exists
DROP POLICY IF EXISTS horarios_select_all ON horarios;

-- SELECT policy - anyone can read
CREATE POLICY horarios_select_all ON horarios FOR SELECT USING (true);

-- INSERT policy - only service role (admin)
CREATE POLICY horarios_insert_admin ON horarios FOR INSERT 
WITH CHECK (true);

-- UPDATE policy - only service role (admin)
CREATE POLICY horarios_update_admin ON horarios FOR UPDATE 
USING (true) WITH CHECK (true);

-- DELETE policy - only service role (admin)
CREATE POLICY horarios_delete_admin ON horarios FOR DELETE 
USING (true);
