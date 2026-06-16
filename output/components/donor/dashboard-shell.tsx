"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Bell } from "lucide-react"
import { SidebarNav } from "./sidebar-nav"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const { userDoc } = useAuth()
  const displayName = userDoc?.name || "Donor"
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        <SidebarNav />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-gray-900/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0">
            <SidebarNav onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-gray-100 bg-white/90 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="rounded-xl p-2 text-gray-500 hover:bg-gray-50 lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="/donor" className="text-lg font-bold text-blue-700 lg:hidden">
              donate.org
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/donor/notifications"
              className="relative rounded-xl p-2 text-gray-500 hover:bg-gray-50"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-700" />
            </Link>
            <div className="flex items-center gap-3 rounded-xl py-1 pl-1 pr-3 hover:bg-gray-50">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-blue-700 text-white text-sm font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium text-gray-900 leading-tight">
                  {displayName}
                </p>
                <p className="text-xs text-gray-400 leading-tight">Donor</p>
              </div>
            </div>
          </div>
        </header>

        <main className={cn("mx-auto max-w-7xl p-6 md:p-8")}>{children}</main>
      </div>
    </div>
  )
}
