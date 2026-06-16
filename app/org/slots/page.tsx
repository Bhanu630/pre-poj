import type { Metadata } from "next"
import { OrgShell } from "@/components/dashboard/org-shell"
import { SlotsCalendar } from "@/components/org/slots-calendar"

export const metadata: Metadata = {
  title: "Sponsorship Slots — donate",
  description: "Manage meal sponsorship slots and review donor requests.",
}

export default function OrgSlotsPage() {
  return (
    <OrgShell>
      <SlotsCalendar />
    </OrgShell>
  )
}
