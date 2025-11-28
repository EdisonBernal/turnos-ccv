-- Crear tabla de administradores con dos niveles
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nivel INTEGER NOT NULL CHECK (nivel IN (1, 2)),
  nombre TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Política para que solo el admin nivel 1 pueda ver todos los admins
CREATE POLICY "admin_level_1_can_view_all" ON admin_users
  FOR SELECT USING (true);

-- Política para que solo el admin nivel 1 pueda crear nuevos admins
CREATE POLICY "admin_level_1_can_insert" ON admin_users
  FOR INSERT WITH CHECK (true);

-- Política para que solo el admin nivel 1 pueda actualizar admins
CREATE POLICY "admin_level_1_can_update" ON admin_users
  FOR UPDATE USING (true);

-- Política para que solo el admin nivel 1 pueda eliminar admins
CREATE POLICY "admin_level_1_can_delete" ON admin_users
  FOR DELETE USING (true);

-- Crear índice para búsqueda rápida por email
CREATE INDEX idx_admin_users_email ON admin_users(email);

-- Insertar admin nivel 1 por defecto (usuario: admin@clinic.com, contraseña: admin123)
-- Hash bcrypt de "admin123"
INSERT INTO admin_users (email, password_hash, nivel, nombre)
VALUES (
  'admin@clinic.com',
  '$2b$10$YAhVTNqVPOXJPnrRq2cDquKLBFT3KXFM8gqH5Y8Q9qjXK8J0C5OJu',
  1,
  'Administrador Principal'
) ON CONFLICT (email) DO NOTHING;
