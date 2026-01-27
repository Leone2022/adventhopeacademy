import { Metadata } from "next"
import StatusCheckClient from "./client"

export const metadata: Metadata = {
  title: "Check Registration Status | Advent Hope Academy",
  description: "Check the status of your parent or student registration",
}

export default function StatusCheckPage() {
  return <StatusCheckClient />
}
