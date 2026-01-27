import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import CreateAccountsClient from "./client"

export default async function CreateAccountsPage() {
  const session = await getServerSession(authOptions)

  // Only allow admin access
  if (!session || !["SUPER_ADMIN", "SCHOOL_ADMIN"].includes(session.user.role)) {
    redirect("/auth/login")
  }

  return <CreateAccountsClient session={session} />
}
