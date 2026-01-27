import { Metadata } from "next"
import PendingRegistrationsClient from "./client"

export const metadata: Metadata = {
  title: "Pending Registrations | Admin Dashboard",
  description: "Review and approve pending parent and student registrations",
}

export default function PendingRegistrationsPage() {
  return <PendingRegistrationsClient />
}
