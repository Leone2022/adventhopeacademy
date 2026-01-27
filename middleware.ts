import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Force password change if required (except on change-password page itself and public routes)
    if (
      token?.mustChangePassword &&
      !path.startsWith("/portal/change-password") &&
      !path.startsWith("/api/auth/change-password") &&
      !path.startsWith("/api/auth") &&
      !path.startsWith("/_next") &&
      !path.startsWith("/auth/signout") &&
      !path.startsWith("/") // Allow home page and public routes
    ) {
      return NextResponse.redirect(new URL("/portal/change-password", req.url))
    }

    // Super Admin routes
    if (path.startsWith("/super-admin")) {
      if (token?.role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // School Admin routes
    if (path.startsWith("/admin")) {
      const allowedRoles = ["SUPER_ADMIN", "SCHOOL_ADMIN"]
      if (!token?.role || !allowedRoles.includes(token.role)) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // Accountant routes
    if (path.startsWith("/accountant")) {
      const allowedRoles = ["SUPER_ADMIN", "SCHOOL_ADMIN", "ACCOUNTANT"]
      if (!token?.role || !allowedRoles.includes(token.role)) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // Registrar routes
    if (path.startsWith("/registrar")) {
      const allowedRoles = ["SUPER_ADMIN", "SCHOOL_ADMIN", "REGISTRAR"]
      if (!token?.role || !allowedRoles.includes(token.role)) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // Teacher routes
    if (path.startsWith("/teacher")) {
      const allowedRoles = ["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]
      if (!token?.role || !allowedRoles.includes(token.role)) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // Hostel Manager routes
    if (path.startsWith("/hostel")) {
      const allowedRoles = ["SUPER_ADMIN", "SCHOOL_ADMIN", "HOSTEL_MANAGER"]
      if (!token?.role || !allowedRoles.includes(token.role)) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // Parent routes
    if (path.startsWith("/parent")) {
      if (token?.role !== "PARENT") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // Student routes
    if (path.startsWith("/student")) {
      if (token?.role !== "STUDENT") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // Multi-tenant: Ensure user has schoolId for school-specific routes
    if (path.startsWith("/dashboard") && !path.startsWith("/super-admin")) {
      if (!token?.schoolId && token?.role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/auth/setup", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        const publicPaths = [
          "/",
          "/auth/login",
          "/auth/register",
          "/apply",
          "/portal/login",
          "/portal/forgot-password",
          "/portal/reset-password"
        ]
        const isPublicPath = publicPaths.some((path) =>
          req.nextUrl.pathname.startsWith(path)
        )

        if (isPublicPath) {
          return true
        }

        // Require authentication for protected routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

