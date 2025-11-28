-- Insert default admin user (Level 1)
-- Email: admin@clinic.com
-- Password: admin123
-- Password hash generated with bcrypt (rounds: 10)
INSERT INTO admin_users (email, password_hash, nombre, nivel, activo, created_at, updated_at)
VALUES (
  'admin@clinic.com',
  -- Hash for password 'admin123' with bcrypt
  '$2b$10$K9Hi2omMVHgvVydZQwLKAeN9sIoFGc/DmrmCmyOJ2cD7VqZwq4tL6',
  'Administrador Principal',
  1,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- If you need to generate the correct hash, run this Node.js code:
-- import bcrypt from 'bcryptjs'
-- const hash = await bcrypt.hash('admin123', 10)
-- console.log(hash)
-- Then replace the hash above with the generated one
