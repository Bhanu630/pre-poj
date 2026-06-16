"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, Info, Package, CalendarPlus, Bell } from "lucide-react"
import type { Timestamp } from "firebase/firestore"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import {
  subscribeToNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type NotificationDoc,
} from "@/lib/firestore"

/* ── helpers ──────────────────────────────────────────────── */

type NotifTab = "All" | "donation" | "message" | "requirement" | "system"

const typeIcon: Record<
  NotificationDoc["type"],
  { Icon: typeof CheckCircle2; bg: string; color: string }
> = {
  donation: { Icon: CheckCircle2, bg: "bg-green-100", color: "text-green-600" },
  message: { Icon: Info, bg: "bg-blue-100", color: "text-blue-700" },
  requirement: { Icon: Package, bg: "bg-amber-100", color: "text-amber-700" },
  system: { Icon: CalendarPlus, bg: "bg-purple-100", color: "text-purple-700" },
}

function formatTime(ts?: Timestamp) {
  if (!ts) return ""
  const date = ts.toDate()
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

const tabs: { value: NotifTab; label: string }[] = [
  { value: "All", label: "All" },
  { value: "donation", label: "Donations" },
  { value: "requirement", label: "Requirements" },
  { value: "message", label: "Messages" },
  { value: "system", label: "System" },
]

/* ── notification item ────────────────────────────────────── */

function NotificationItem({
  n,
  onMarkRead,
}: {
  n: NotificationDoc
  onMarkRead: (id: string) => void
}) {
  const config = typeIcon[n.type] ?? typeIcon.system
  const { Icon, bg, color } = config

  return (
    <button
      type="button"
      onClick={() => {
        if (!n.read && n.id) onMarkRead(n.id)
      }}
      className={cn(
        "flex w-full items-start gap-4 px-6 py-4 text-left transition-colors",
        !n.read ? "bg-blue-50/60 hover:bg-blue-50" : "bg-white hover:bg-gray-50",
      )}
    >
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", bg)}>
        <Icon className={cn("h-5 w-5", color)} />
      </div>
      <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <p className="text-sm font-medium text-gray-900">{n.title}</p>
          <p className="mt-0.5 text-sm leading-relaxed text-gray-600">{n.body}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!n.read && <span className="h-2 w-2 rounded-full bg-blue-700" />}
          <span className="whitespace-nowrap text-xs text-gray-400">{formatTime(n.createdAt)}</span>
        </div>
      </div>
    </button>
  )
}

/* ── page ─────────────────────────────────────────────────── */

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<NotificationDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<NotifTab>("All")

  useEffect(() => {
    if (!user?.uid) {
      setNotifications([])
      setLoading(false)
      return
    }

    setLoading(true)
    const unsub = subscribeToNotifications(user.uid, (notifs) => {
      setNotifications(notifs)
      setLoading(false)
    })

    return () => unsub()
  }, [user?.uid])

  const filtered = useMemo(
    () => (tab === "All" ? notifications : notifications.filter((n) => n.type === tab)),
    [notifications, tab],
  )

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  async function handleMarkRead(id: string) {
    try {
      await markNotificationRead(id)
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  async function handleMarkAllRead() {
    if (!user?.uid) return
    try {
      await markAllNotificationsRead(user.uid)
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 leading-relaxed text-gray-600">
            Stay updated on your requests, approvals, and new opportunities.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm font-medium text-blue-700 hover:text-blue-800"
          >
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as NotifTab)}>
        <TabsList className="mb-6 flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
          {tabs.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 data-[state=active]:border-blue-700 data-[state=active]:bg-blue-700 data-[state=active]:text-white"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((t) => (
          <TabsContent key={t.value} value={t.value} className="mt-0">
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="divide-y divide-gray-100">
                {filtered.length > 0 ? (
                  filtered.map((n) => (
                    <NotificationItem key={n.id} n={n} onMarkRead={handleMarkRead} />
                  ))
                ) : (
                  <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
                    <Bell className="h-8 w-8 text-gray-300" />
                    <p className="text-sm text-gray-400">No notifications here yet.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
