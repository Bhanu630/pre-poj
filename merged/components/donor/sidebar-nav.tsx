"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { logoutUser } from "@/lib/auth"
import {
  LayoutDashboard,
  User,
  HandHeart,
  ClipboardList,
  Heart,
  Bell,
  TrendingUp,
  Settings,
  LifeBuoy,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Dashboard", href: "/donor", icon: LayoutDashboard },
  { label: "My Profile", href: "/donor/profile", icon: User },
  { label: "My Donations", href: "/donor/donations", icon: HandHeart },
  { label: "My Requests", href: "/donor/requests", icon: ClipboardList },
  { label: "Favorites", href: "/donor/favorites", icon: Heart },
  { label: "Notifications", href: "/donor/notifications", icon: Bell },
  { label: "Impact", href: "/donor/impact", icon: TrendingUp },
  { label: "Settings", href: "/donor/settings", icon: Settings },
  { label: "Help & Support", href: "/help", icon: LifeBuoy },
]

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
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
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-100">
      <div className="flex h-16 items-center px-6 border-b border-gray-100">
        <Link
          href="/donor"
          onClick={onNavigate}
          className="text-xl font-bold text-blue-700 tracking-tight"
        >
          donate.org
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active =
              item.href === "/donor"
                ? pathname === "/donor"
                : pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 mx-2 rounded-xl px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-500 hover:bg-gray-50",
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-gray-100 p-2">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-5 w-5 shrink-0" strokeWidth={2} />
          Logout
        </button>
      </div>
    </div>
  )
}
