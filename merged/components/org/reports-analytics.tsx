"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { CalendarDays, Download, Gift, Utensils, Users, Sprout } from "lucide-react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { useAuth } from "@/lib/auth-context"
import { getOrgDonations, type DonationDoc } from "@/lib/firestore"
import { Spinner } from "@/components/ui/spinner"

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}`
}

function getMonthLabel(date: Date) {
  return `${MONTH_LABELS[date.getMonth()]} ${String(date.getDate()).padStart(2, "0")}`
}

export function ReportsAnalytics() {
  const { user } = useAuth()
  const [donations, setDonations] = useState<DonationDoc[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await getOrgDonations(user.uid)
      setDonations(data)
    } catch (error) {
      console.error("Failed to load reports data:", error)
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  useEffect(() => {
    loadData()
  }, [loadData])

  const stats = useMemo(() => {
    const totalDonations = donations.length
    const approvedDonations = donations.filter(
      (d) => d.status === "Approved" || d.status === "Completed"
    )
    const totalAmount = approvedDonations.reduce((sum, d) => sum + d.amount, 0)
    const totalMeals = Math.floor(totalAmount / 35)
    const uniqueDonors = new Set(donations.map((d) => d.donorId)).size
    const pendingCount = donations.filter((d) => d.status === "Pending").length
    const approvedCount = donations.filter((d) => d.status === "Approved").length

    return [
      { label: "Total Donations", value: String(totalDonations), icon: Gift },
      { label: "Total Meals", value: totalMeals.toLocaleString("en-IN"), icon: Utensils },
      { label: "Total Donors", value: String(uniqueDonors), icon: Users },
      { label: "Pending Requests", value: String(pendingCount), icon: Sprout },
    ]
  }, [donations])

  // Build last-7-days chart data
  const chartData = useMemo(() => {
    const now = new Date()
    const days: { day: string; meals: number; items: number; date: Date }[] = []

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
      days.push({
        day: `${MONTH_LABELS[d.getMonth()]} ${d.getDate()}`,
        meals: 0,
        items: 0,
        date: d,
      })
    }

    for (const donation of donations) {
      if (!donation.createdAt) continue
      const donDate = donation.createdAt.toDate()
      const bucket = days.find(
        (b) =>
          b.date.getFullYear() === donDate.getFullYear() &&
          b.date.getMonth() === donDate.getMonth() &&
          b.date.getDate() === donDate.getDate()
      )
      if (bucket) {
        const mealCount = Math.floor(donation.amount / 35)
        bucket.meals += mealCount
        bucket.items += 1
      }
    }

    return days.map(({ day, meals, items }) => ({ day, meals, items }))
  }, [donations])

  // Top donors by amount
  const topDonations = useMemo(() => {
    const byDonor = new Map<string, number>()
    for (const d of donations) {
      if (d.status === "Approved" || d.status === "Completed") {
        byDonor.set(d.donorId, (byDonor.get(d.donorId) ?? 0) + d.amount)
      }
    }
    return [...byDonor.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([donorId, amount]) => ({
        name: donorId.slice(0, 8) + "…", // will be replaced with names if available
        meals: Math.floor(amount / 35),
      }))
  }, [donations])

  const maxMeals = Math.max(...topDonations.map((d) => d.meals), 1)

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports &amp; Analytics</h1>
          <p className="mt-1 text-gray-600">Track donations and meals served over time.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700">
            <CalendarDays className="h-4 w-4 text-blue-700" />
            Last 7 days
          </div>
          <button
            onClick={() => {}}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-800"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-6 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <s.icon className="h-5 w-5" />
            </span>
            <p className="mt-4 text-3xl font-bold text-gray-900">{s.value}</p>
            <p className="mt-1 text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Line chart */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900">Donations Over Time</h2>
          <p className="mb-4 text-sm text-gray-500">Meals and items donated — last 7 days</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    fontSize: 13,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 13, paddingTop: 8 }} />
                <Line
                  type="monotone"
                  dataKey="meals"
                  name="Meals"
                  stroke="#1D4ED8"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#1D4ED8" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="items"
                  name="Donations"
                  stroke="#16A34A"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#16A34A" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Top donations */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Top Donors</h2>
          <p className="mb-4 text-sm text-gray-500">Highest contributors (approved/completed)</p>
          {topDonations.length === 0 ? (
            <p className="text-sm text-gray-400">No approved donations yet.</p>
          ) : (
            <div className="space-y-5">
              {topDonations.map((d, i) => (
                <div key={d.name + i}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{d.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">{d.meals.toLocaleString()} meals</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-700"
                      style={{ width: `${(d.meals / maxMeals) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
