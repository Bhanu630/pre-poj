"use client"

import type { ReactNode } from "react"
import { DashboardShell } from "./dashboard-shell"
import { orgNav, orgUser } from "./nav-config"

export function OrgShell({ children }: { children: ReactNode }) {
  return (
    <DashboardShell nav={orgNav} user={orgUser} notifications={2}>
      {children}
    </DashboardShell>
  )
}
