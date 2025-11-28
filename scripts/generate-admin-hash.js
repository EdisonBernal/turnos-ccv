import bcrypt from "bcryptjs"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Error: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridas")
  process.exit(1)
}

const email = "admin2@clinic.com"
const password = "admin123"

async function seedAdmin() {
  try {
    console.log("🔐 Generando hash de contraseña...")
    const passwordHash = await bcrypt.hash(password, 10)
    console.log("✅ Hash generado:", passwordHash)

    console.log("📝 Conectando a Supabase...")
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log("💾 Insertando usuario admin...")
    const { data, error } = await supabase
      .from("admin_users")
      .insert([
        {
          email,
          password_hash: passwordHash,
          nombre: "Administrador Principal",
          nivel: 1,
          activo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error("❌ Error:", error.message)
      process.exit(1)
    }

    console.log("✅ Usuario admin creado exitosamente")
    console.log("📧 Email:", email)
    console.log("🔐 Contraseña:", password)
    console.log("📊 Nivel:", 1)
  } catch (error) {
    console.error("❌ Error fatal:", error)
    process.exit(1)
  }
}

seedAdmin()
