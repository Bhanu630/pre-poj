import type { ReactNode } from "react"
import { Sidebar } from "@/components/org/sidebar"

export default function OrgLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="lg:pl-64">{children}</main>
    </div>
  )
}
