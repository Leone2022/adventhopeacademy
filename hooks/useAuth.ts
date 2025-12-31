import { useSession } from "next-auth/react"
import { UserRole } from "@/lib/roles"

export function useAuth() {
  const { data: session, status } = useSession()

  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    role: session?.user?.role as UserRole | undefined,
    schoolId: session?.user?.schoolId,
    school: session?.user?.school,
  }
}

