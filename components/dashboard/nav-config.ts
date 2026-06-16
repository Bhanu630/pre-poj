import {
  LayoutDashboard,
  User,
  ClipboardList,
  CalendarDays,
  HandCoins,
  Users,
  BarChart3,
  Settings,
  LifeBuoy,
  LogOut,
  Heart,
  Bell,
  Sparkles,
} from "lucide-react"
import type { NavItem } from "./dashboard-shell"

export const orgNav: NavItem[] = [
  { label: "Dashboard", href: "/org/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/org/profile", icon: User },
  { label: "Requirements", href: "/org/requirements", icon: ClipboardList },
  { label: "Sponsorship Slots", href: "/org/slots", icon: CalendarDays },
  { label: "Donations", href: "/org/donations", icon: HandCoins },
  { label: "Donors", href: "/org/donors", icon: Users },
  { label: "Reports", href: "/org/reports", icon: BarChart3 },
  { label: "Settings", href: "/org/settings", icon: Settings },
  { label: "Help", href: "/org/help", icon: LifeBuoy },
  { label: "Logout", href: "/login", icon: LogOut },
]

export const donorNav: NavItem[] = [
  { label: "Dashboard", href: "/donor/dashboard", icon: LayoutDashboard },
  { label: "My Profile", href: "/donor/profile", icon: User },
  { label: "My Donations", href: "/donor/donations", icon: HandCoins },
  { label: "My Requests", href: "/donor/requests", icon: ClipboardList },
  { label: "Favorites", href: "/donor/favorites", icon: Heart },
  { label: "Notifications", href: "/donor/notifications", icon: Bell },
  { label: "Impact", href: "/donor/impact", icon: Sparkles },
  { label: "Settings", href: "/donor/settings", icon: Settings },
  { label: "Help & Support", href: "/donor/help", icon: LifeBuoy },
  { label: "Logout", href: "/login", icon: LogOut },
]

export const orgUser = { name: "Hope Foundation", initials: "HF", role: "Organization" }
export const donorUser = { name: "Ramesh Kumar", initials: "RK", role: "Donor" }
