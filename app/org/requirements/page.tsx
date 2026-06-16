import type { Metadata } from "next"
import { OrgShell } from "@/components/dashboard/org-shell"
import { Requirements } from "@/components/org/requirements"

export const metadata: Metadata = {
  title: "Requirements — donate",
  description: "Manage your organization's supply requirements and track fulfillment.",
}

export default function OrgRequirementsPage() {
  return (
    <OrgShell>
      <Requirements />
    </OrgShell>
  )
}
