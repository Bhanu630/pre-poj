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

const mealsOverTime = [
  { month: "Feb", meals: 40 },
  { month: "Mar", meals: 65 },
  { month: "Apr", meals: 55 },
  { month: "May", meals: 90 },
  { month: "Jun", meals: 110 },
  { month: "Jul", meals: 95 },
]

const topCauses = [
  { name: "Food & Meals", value: 60, color: "#1D4ED8" },
  { name: "Education", value: 20, color: "#16A34A" },
  { name: "Healthcare", value: 10, color: "#D97706" },
  { name: "Others", value: 10, color: "#94A3B8" },
]

export function ImpactOverTimeChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={mealsOverTime} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="mealsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1D4ED8" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#94A3B8", fontSize: 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#94A3B8", fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #E2E8F0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            fontSize: 13,
          }}
          labelStyle={{ color: "#0F172A", fontWeight: 600 }}
          formatter={(value: number) => [`${value} meals`, "Donated"]}
        />
        <Area
          type="monotone"
          dataKey="meals"
          stroke="#1D4ED8"
          strokeWidth={2.5}
          fill="url(#mealsFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function TopCausesChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={topCauses}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={2}
          stroke="none"
        >
          {topCauses.map((c) => (
            <Cell key={c.name} fill={c.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #E2E8F0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            fontSize: 13,
          }}
          formatter={(value: number, name: string) => [`${value}%`, name]}
        />
        <Legend
          iconType="circle"
          formatter={(value) => (
            <span className="text-sm text-gray-600">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
