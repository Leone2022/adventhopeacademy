import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      schoolId: string | null
      school: {
        id: string
        name: string
        subdomain: string
      } | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: string
    schoolId: string | null
    school: {
      id: string
      name: string
      subdomain: string
    } | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    schoolId: string | null
    school: {
      id: string
      name: string
      subdomain: string
    } | null
  }
}

