import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Check if admin mode is enabled
  const isAdminMode = process.env.SNOWSCAN_API_KEY === "test"

  // Add admin mode to headers for client-side access
  const response = NextResponse.next()
  response.headers.set("x-admin-mode", isAdminMode ? "true" : "false")

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!isAdminMode) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return response
}

export const config = {
  matcher: ["/admin/:path*"],
}
