"use client"

import { TrendingUp } from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const data = [
  { month: "Jan", donations: 2.1, lives: 8 },
  { month: "Feb", donations: 2.8, lives: 11 },
  { month: "Mar", donations: 3.4, lives: 14 },
  { month: "Apr", donations: 3.1, lives: 13 },
  { month: "May", donations: 4.2, lives: 18 },
  { month: "Jun", donations: 4.9, lives: 21 },
  { month: "Jul", donations: 5.6, lives: 24 },
  { month: "Aug", donations: 6.3, lives: 28 },
]

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-md">
      <p className="mb-1 text-xs font-semibold text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">
        Donations: <span className="font-semibold text-primary">${payload[0].value}M</span>
      </p>
      <p className="text-xs text-muted-foreground">
        Lives impacted: <span className="font-semibold text-success">{payload[1]?.value}K</span>
      </p>
    </div>
  )
}

export function ImpactChart() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid items-center gap-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-sm font-medium text-success">
            <TrendingUp className="h-4 w-4" />
            Growing every month
          </span>
          <h2 className="mt-4 text-pretty text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Real impact, measured transparently
          </h2>
          <p className="mt-3 text-pretty text-base leading-relaxed text-muted-foreground">
            Watch how community generosity compounds. Every dollar is tracked from donation to
            delivery, so you always know your gift is creating change.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-secondary p-4">
              <p className="text-2xl font-extrabold text-foreground">$6.3M</p>
              <p className="text-sm text-muted-foreground">Raised in August</p>
            </div>
            <div className="rounded-xl bg-secondary p-4">
              <p className="text-2xl font-extrabold text-foreground">+200%</p>
              <p className="text-sm text-muted-foreground">Growth this year</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="donationsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="livesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-3)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-chart-3)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border)" }} />
                <Area
                  type="monotone"
                  dataKey="donations"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2.5}
                  fill="url(#donationsGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="lives"
                  stroke="var(--color-chart-3)"
                  strokeWidth={2.5}
                  fill="url(#livesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center justify-center gap-6">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full bg-chart-1" />
              Donations ($M)
            </span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full bg-chart-3" />
              Lives impacted (K)
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
