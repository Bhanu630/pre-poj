"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { logoutUser } from "@/lib/auth"
import {
  LayoutDashboard, User, HandHeart, FileText, Heart,
  Bell, TrendingUp, Settings, LifeBuoy, LogOut, Menu, X, Search,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  { label: "Dashboard", href: "/donor/dashboard", icon: LayoutDashboard },
  { label: "My Profile", href: "/donor/profile", icon: User },
  { label: "My Donations", href: "/donor/donations", icon: HandHeart },
  { label: "Notifications", href: "/donor/notifications", icon: Bell },
  { label: "Impact", href: "/donor/impact", icon: TrendingUp },
  { label: "Settings", href: "/donor/settings", icon: Settings },
  { label: "Help & Support", href: "/donor/help", icon: LifeBuoy },
]

function Logo() {
  return (
    <Link href="/donor/dashboard" className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Heart className="h-5 w-5" fill="currentColor" />
      </span>
      <span className="text-lg font-extrabold tracking-tight text-foreground">
        donate<span className="text-primary">.org</span>
      </span>
    </Link>
  )
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const active = pathname === item.href || pathname.startsWith(item.href + "/")
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
            )}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logoutUser()
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <div className="flex h-full flex-col gap-6 p-5">
      <Logo />
      <NavLinks onNavigate={onNavigate} />
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
      >
        <LogOut className="h-[18px] w-[18px] shrink-0" />
        Logout
      </button>
    </div>
  )
}

export function DonorShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-sidebar lg:block">
        <SidebarBody />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[80%] bg-sidebar shadow-xl">
            <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
            <SidebarBody onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur md:px-6">
          <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative hidden flex-1 max-w-md md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="search" placeholder="Search organizations, causes..." className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <Link href="/donor/notifications" className="relative rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-secondary" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">D</span>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold leading-tight text-foreground">Donor</p>
                <p className="text-xs leading-tight text-muted-foreground">Donor</p>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

export { Button }
