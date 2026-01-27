import { Metadata } from "next"
import StudentRegistrationClient from "./client"

export const metadata: Metadata = {
  title: "Student Registration | Advent Hope Academy",
  description: "Register as a student at Advent Hope Academy",
}

export default function StudentRegistrationPage() {
  return <StudentRegistrationClient />
}
