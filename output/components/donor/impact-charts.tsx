"use client"

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { useMemo } from "react"
import type { DonationDoc, OrganizationDoc } from "@/lib/firestore"

const COLORS = ["#1D4ED8", "#16A34A", "#D97706", "#94A3B8", "#7C3AED", "#DB2777"]

interface ImpactOverTimeChartProps {
  donations: DonationDoc[]
}

export function ImpactOverTimeChart({ donations }: ImpactOverTimeChartProps) {
  const data = useMemo(() => {
    const monthMap: Record<string, number> = {}
    donations.forEach((d) => {
      if (!d.createdAt) return
      const date = d.createdAt.toDate()
      const key = date.toLocaleDateString("en-IN", { month: "short" })
      monthMap[key] = (monthMap[key] || 0) + Math.round(d.amount / 35)
    })
    // Return last 6 months in order
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    const now = new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
      const label = d.toLocaleDateString("en-IN", { month: "short" })
      return { month: label, meals: monthMap[label] || 0 }
    })
  }, [donations])

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="mealsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1D4ED8" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(0,0,0,0.06)", fontSize: 13 }}
          labelStyle={{ color: "#0F172A", fontWeight: 600 }}
          formatter={(value: number) => [`${value} meals`, "Donated"]}
        />
        <Area type="monotone" dataKey="meals" stroke="#1D4ED8" strokeWidth={2.5} fill="url(#mealsFill)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

interface TopCausesChartProps {
  donations: DonationDoc[]
  organizations: OrganizationDoc[]
}

export function TopCausesChart({ donations, organizations }: TopCausesChartProps) {
  const data = useMemo(() => {
    const causeMap: Record<string, number> = {}
    donations.forEach((d) => {
      const org = organizations.find((o) => o.orgId === d.organizationId)
      const cause = org?.category || "Other"
      causeMap[cause] = (causeMap[cause] || 0) + d.amount
    })
    const total = Object.values(causeMap).reduce((s, v) => s + v, 0) || 1
    return Object.entries(causeMap).map(([name, value]) => ({
      name,
      value: Math.round((value / total) * 100),
    }))
  }, [donations, organizations])

  if (data.length === 0) {
    return <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">No donation data yet.</div>
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={2}
          stroke="none"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(0,0,0,0.06)", fontSize: 13 }}
          formatter={(value: number, name: string) => [`${value}%`, name]}
        />
        <Legend iconType="circle" formatter={(value) => <span className="text-sm text-gray-600">{value}</span>} />
      </PieChart>
    </ResponsiveContainer>
  )
}
