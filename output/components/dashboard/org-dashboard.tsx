"use client"

import { useMemo } from "react"
import {
  Search,
  Bell,
  Menu,
  Plus,
  DollarSign,
  Users,
  HeartHandshake,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import type { Timestamp } from "firebase/firestore"
import { Sidebar } from "@/components/org/sidebar"
import { DonationTrendChart, CauseBreakdownChart } from "@/components/dashboard/dashboard-charts"
import type { DonationDoc, OrganizationDoc, RequirementDoc } from "@/lib/firestore"

const CAMPAIGN_COLORS = ["bg-blue-700", "bg-green-600", "bg-amber-600", "bg-slate-600"]
const CAUSE_CHART_COLORS = ["#1D4ED8", "#16A34A", "#D97706", "#64748B", "#9333EA", "#DC2626"]
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const STAT_STYLES = [
  { iconBg: "bg-blue-50", iconColor: "text-blue-700" },
  { iconBg: "bg-green-50", iconColor: "text-green-600" },
  { iconBg: "bg-amber-50", iconColor: "text-amber-600" },
  { iconBg: "bg-slate-100", iconColor: "text-slate-600" },
]

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function formatCurrencyWhole(value: number) {
  return `₹${value.toLocaleString("en-IN")}`
}

function formatDonationDate(ts?: Timestamp) {
  if (!ts) return "—"
  return ts.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function formatLastUpdated(date: Date | null) {
  if (!date) return "—"
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function isCountedDonation(status: DonationDoc["status"]) {
  return status === "Approved" || status === "Completed"
}

function computeDelta(current: number, previous: number) {
  if (previous === 0) {
    return { delta: current > 0 ? "+100%" : "0%", up: current >= 0 }
  }
  const pct = ((current - previous) / previous) * 100
  return {
    delta: `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`,
    up: pct >= 0,
  }
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`
}

function buildDonationTrend(donations: DonationDoc[]) {
  const now = new Date()
  const months: { month: string; amount: number; key: string }[] = []

  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      month: MONTH_LABELS[d.getMonth()],
      amount: 0,
      key: getMonthKey(d),
    })
  }

  for (const donation of donations) {
    if (!isCountedDonation(donation.status) || !donation.createdAt) continue
    const key = getMonthKey(donation.createdAt.toDate())
    const bucket = months.find((m) => m.key === key)
    if (bucket) bucket.amount += donation.amount
  }

  return months.map(({ month, amount }) => ({ month, amount }))
}

function buildCauseBreakdown(
  donations: DonationDoc[],
  requirements: RequirementDoc[],
  fallbackCategory?: string
) {
  const reqMap = new Map(requirements.filter((r) => r.id).map((r) => [r.id!, r]))
  const totals = new Map<string, number>()

  for (const donation of donations) {
    if (!isCountedDonation(donation.status)) continue
    const category =
      (donation.requirementId && reqMap.get(donation.requirementId)?.category) ||
      fallbackCategory ||
      "Other"
    totals.set(category, (totals.get(category) ?? 0) + donation.amount)
  }

  const grandTotal = [...totals.values()].reduce((sum, n) => sum + n, 0)
  if (grandTotal === 0) return []

  return [...totals.entries()].map(([name, amount], index) => ({
    name,
    value: Math.round((amount / grandTotal) * 100),
    color: CAUSE_CHART_COLORS[index % CAUSE_CHART_COLORS.length],
  }))
}

function statusClasses(status: string) {
  switch (status) {
    case "Approved":
    case "Completed":
      return "bg-green-100 text-green-700"
    case "Pending":
      return "bg-amber-100 text-amber-700"
    case "Rejected":
      return "bg-red-100 text-red-700"
    default:
      return "bg-blue-100 text-blue-700"
  }
}

export interface OrgDashboardProps {
  org: OrganizationDoc | null
  userName: string
  donations: DonationDoc[]
  requirements: RequirementDoc[]
  donorNames: Record<string, { name: string; email: string }>
  lastUpdated: Date | null
}

export function OrgDashboard({
  org,
  userName,
  donations,
  requirements,
  donorNames,
  lastUpdated,
}: OrgDashboardProps) {
  const countedDonations = useMemo(
    () => donations.filter((d) => isCountedDonation(d.status)),
    [donations]
  )

  const reqMap = useMemo(
    () => new Map(requirements.filter((r) => r.id).map((r) => [r.id!, r])),
    [requirements]
  )

  const stats = useMemo(() => {
    const now = new Date()
    const thisMonthKey = getMonthKey(now)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthKey = getMonthKey(lastMonth)

    const totalRaised = countedDonations.reduce((sum, d) => sum + d.amount, 0)
    const uniqueDonors = new Set(countedDonations.map((d) => d.donorId)).size
    const activeCampaigns = requirements.filter((r) => r.status !== "Fulfilled").length
    const avgDonation = countedDonations.length > 0 ? totalRaised / countedDonations.length : 0

    const thisMonthDonations = countedDonations.filter(
      (d) => d.createdAt && getMonthKey(d.createdAt.toDate()) === thisMonthKey
    )
    const lastMonthDonations = countedDonations.filter(
      (d) => d.createdAt && getMonthKey(d.createdAt.toDate()) === lastMonthKey
    )

    const thisMonthRaised = thisMonthDonations.reduce((sum, d) => sum + d.amount, 0)
    const lastMonthRaised = lastMonthDonations.reduce((sum, d) => sum + d.amount, 0)

    const thisMonthDonors = new Set(thisMonthDonations.map((d) => d.donorId)).size
    const lastMonthDonors = new Set(lastMonthDonations.map((d) => d.donorId)).size

    const raisedDelta = computeDelta(thisMonthRaised, lastMonthRaised)
    const donorsDelta = computeDelta(thisMonthDonors, lastMonthDonors)

    const fulfilledThisMonth = requirements.filter((r) => r.status === "Fulfilled").length
    const campaignsDelta = { delta: `+${fulfilledThisMonth}`, up: fulfilledThisMonth >= 0 }

    const thisMonthAvg =
      thisMonthDonations.length > 0
        ? thisMonthDonations.reduce((sum, d) => sum + d.amount, 0) / thisMonthDonations.length
        : 0
    const lastMonthAvg =
      lastMonthDonations.length > 0
        ? lastMonthDonations.reduce((sum, d) => sum + d.amount, 0) / lastMonthDonations.length
        : 0
    const avgDelta = computeDelta(thisMonthAvg, lastMonthAvg)

    return [
      {
        label: "Total Raised",
        value: formatCurrencyWhole(totalRaised),
        delta: raisedDelta.delta,
        up: raisedDelta.up,
        icon: DollarSign,
        ...STAT_STYLES[0],
      },
      {
        label: "Active Donors",
        value: uniqueDonors.toLocaleString(),
        delta: donorsDelta.delta,
        up: donorsDelta.up,
        icon: Users,
        ...STAT_STYLES[1],
      },
      {
        label: "Active Campaigns",
        value: String(activeCampaigns),
        delta: campaignsDelta.delta,
        up: campaignsDelta.up,
        icon: HeartHandshake,
        ...STAT_STYLES[2],
      },
      {
        label: "Avg. Donation",
        value: formatCurrency(avgDonation),
        delta: avgDelta.delta,
        up: avgDelta.up,
        icon: TrendingUp,
        ...STAT_STYLES[3],
      },
    ]
  }, [countedDonations, requirements])

  const recentDonations = useMemo(
    () =>
      donations.slice(0, 6).map((d) => {
        const donor = donorNames[d.donorId]
        const campaign =
          (d.requirementId && reqMap.get(d.requirementId)?.title) || "General Donation"
        return {
          name: donor?.name ?? "Unknown Donor",
          email: donor?.email ?? "",
          campaign,
          amount: formatCurrency(d.amount),
          date: formatDonationDate(d.createdAt),
          status: d.status,
        }
      }),
    [donations, donorNames, reqMap]
  )

  const campaigns = useMemo(
    () =>
      requirements
        .filter((r) => r.status !== "Fulfilled")
        .slice(0, 3)
        .map((r, index) => ({
          name: r.title,
          raised: r.fulfilledQuantity,
          goal: r.totalQuantity,
          color: CAMPAIGN_COLORS[index % CAMPAIGN_COLORS.length],
        })),
    [requirements]
  )

  const donationTrend = useMemo(() => buildDonationTrend(donations), [donations])

  const causeBreakdown = useMemo(
    () => buildCauseBreakdown(donations, requirements, org?.category),
    [donations, requirements, org?.category]
  )

  const welcomeName = userName.split(" ")[0]

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-10 flex items-center gap-4 h-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100">
          <button className="lg:hidden text-gray-500 hover:text-gray-900" aria-label="Open menu">
            <Menu size={22} />
          </button>

          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search donors, campaigns..."
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              className="relative w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </button>
            <button className="hidden sm:flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors">
              <Plus size={16} />
              New Campaign
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Heading */}
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {welcomeName}</h1>
              <p className="text-gray-600 leading-relaxed mt-1">
                Here&apos;s what&apos;s happening across your campaigns today.
              </p>
            </div>
            <span className="text-sm text-gray-400">Last updated: {formatLastUpdated(lastUpdated)}</span>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                      <Icon size={20} className={stat.iconColor} />
                    </div>
                    <span
                      className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                        stat.up ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {stat.delta}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
                </div>
              )
            })}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <DonationTrendChart data={donationTrend} />
            </div>
            <div className="lg:col-span-1">
              <CauseBreakdownChart data={causeBreakdown} />
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent donations table */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Recent Donations</h3>
                  <p className="text-sm text-gray-400 mt-0.5">Latest contributions across all campaigns</p>
                </div>
                <a href="#" className="text-sm font-medium text-blue-700 hover:text-blue-800">
                  View all
                </a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="px-6 py-3 font-medium">Donor</th>
                      <th className="px-6 py-3 font-medium hidden md:table-cell">Campaign</th>
                      <th className="px-6 py-3 font-medium">Amount</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentDonations.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400">
                          No donations yet.
                        </td>
                      </tr>
                    ) : (
                      recentDonations.map((d) => (
                        <tr key={d.email + d.date + d.amount} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-gray-900">{d.name}</p>
                            <p className="text-xs text-gray-400">{d.date}</p>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <span className="text-sm text-gray-600">{d.campaign}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-gray-900">{d.amount}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusClasses(d.status)}`}
                            >
                              {d.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Campaign goals */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
              <h3 className="text-base font-bold text-gray-900">Campaign Progress</h3>
              <p className="text-sm text-gray-400 mt-0.5 mb-6">Toward fundraising goals</p>
              <div className="space-y-6">
                {campaigns.length === 0 ? (
                  <p className="text-sm text-gray-400">No active campaigns.</p>
                ) : (
                  campaigns.map((c) => {
                    const pct = c.goal > 0 ? Math.round((c.raised / c.goal) * 100) : 0
                    return (
                      <div key={c.name}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">{c.name}</span>
                          <span className="text-xs font-medium text-gray-400">{pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div className={`h-full rounded-full ${c.color}`} style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">{c.raised.toLocaleString()} raised</span>
                          <span className="text-xs text-gray-400">Goal {c.goal.toLocaleString()}</span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              <button className="w-full mt-6 border-2 border-blue-700 text-blue-700 hover:bg-blue-50 px-6 py-2.5 rounded-xl font-medium text-sm transition-colors">
                Manage Campaigns
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
