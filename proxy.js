import { NextResponse } from "next/server"

export default async function proxy(request) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const adminSession = request.cookies.get("admin_session")

    if (!adminSession || !adminSession.value) {
      // Redirigir a home si no hay sesión
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Validar que la cookie tiene un valor válido (no está vacía)
    try {
      JSON.parse(adminSession.value)
    } catch {
      // Si la cookie no es JSON válido, redirigir a home
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
