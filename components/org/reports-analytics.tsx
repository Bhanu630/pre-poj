"use client"

import { useEffect, useState, useMemo } from "react"
import { CalendarDays, Download, Gift, Utensils, Users, Sprout, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getOrgDonations, getOrganization } from "@/lib/firestore"
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
import { Spinner } from "@/components/ui/spinner"

export function ReportsAnalytics() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [donations, setDonations] = useState<any[]>([])
  const [orgBeneficiaries, setOrgBeneficiaries] = useState(0)

  useEffect(() => {
    if (!user?.uid) return
    async function load() {
      const [docs, org] = await Promise.all([
        getOrgDonations(user!.uid),
        getOrganization(user!.uid)
      ])
      setDonations(docs)
      setOrgBeneficiaries(org?.beneficiaries || 0)
      setLoading(false)
    }
    load()
  }, [user?.uid])

  const summary = useMemo(() => {
    const totalMeals = donations.reduce((sum, d) => sum + (d.amount / 35), 0)
    const uniqueDonors = new Set(donations.map(d => d.donorId)).size
    return [
      { label: "Total Donations", value: String(donations.length), icon: Gift },
      { label: "Total Meals", value: Math.floor(totalMeals).toLocaleString(), icon: Utensils },
      { label: "Total Donors", value: String(uniqueDonors), icon: Users },
      { label: "Beneficiaries", value: orgBeneficiaries.toLocaleString(), icon: Sprout },
    ]
  }, [donations, orgBeneficiaries])

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports &amp; Analytics</h1>
          <p className="mt-1 text-gray-600">Track donations and meals served over time.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
            <CalendarDays className="h-4 w-4 text-blue-700" />
            20 May - 26 May 2025
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-800">
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
          <p className="mb-4 text-sm text-gray-500">Meals and items donated this week</p>
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
                  name="Items"
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
          <h2 className="text-lg font-bold text-gray-900">Top Donations</h2>
          <p className="mb-4 text-sm text-gray-500">Highest contributors this period</p>
          <div className="space-y-5">
            {topDonations.map((d, i) => (
              <div key={d.name}>
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
        </section>
      </div>
    </div>
  )
}
