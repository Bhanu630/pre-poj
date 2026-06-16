import type { Metadata } from "next"
import { DonorShell } from "@/components/dashboard/donor-shell"
import { DonorProfile } from "@/components/donor/profile"

export const metadata: Metadata = {
  title: "My Profile — donate",
  description: "Manage your donor profile, view your impact, and update your details.",
}

export default function DonorProfilePage() {
  return (
    <DonorShell>
      <DonorProfile />
    </DonorShell>
  )
}
