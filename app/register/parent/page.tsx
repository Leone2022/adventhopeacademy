import { Metadata } from "next"
import ParentRegistrationClient from "./client"

export const metadata: Metadata = {
  title: "Parent Registration | Advent Hope Academy",
  description: "Register as a parent to enroll your child",
}

export default function ParentRegistrationPage() {
  return <ParentRegistrationClient />
}
