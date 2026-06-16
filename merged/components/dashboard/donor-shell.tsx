"use client"

import type { ReactNode } from "react"
import { DashboardShell } from "./dashboard-shell"
import { donorNav, donorUser } from "./nav-config"

export function DonorShell({ children }: { children: ReactNode }) {
  return (
    <DashboardShell nav={donorNav} user={donorUser} notifications={3}>
      {children}
    </DashboardShell>
  )
}
