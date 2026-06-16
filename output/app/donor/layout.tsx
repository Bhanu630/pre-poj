import type React from "react"
import { DonorShell } from "@/components/donor/donor-shell"

export default function DonorLayout({ children }: { children: React.ReactNode }) {
  return <DonorShell>{children}</DonorShell>
}
