"use client"

import { useEffect, useState } from "react"
import { IndianRupee, HandHeart, Users } from "lucide-react"
import {
  ImpactOverTimeChart,
  TopCausesChart,
} from "@/components/donor/impact-charts"
import { useAuth } from "@/lib/auth-context"
import { getDonorDonations, getOrganization } from "@/lib/firestore"
import { Spinner } from "@/components/ui/spinner"

export default function ImpactPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [mealsOverTime, setMealsOverTime] = useState<{ month: string; meals: number }[]>([])
  const [topCauses, setTopCauses] = useState<{ name: string; value: number; color: string }[]>([])
  const [stats, setStats] = useState({
    totalAmount: 0,
    count: 0,
    livesImpacted: 0,
  })

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }

    async function load() {
      try {
        const list = await getDonorDonations(user.uid)
        
        // Filter approved or completed donations for positive impact
        const completedList = list.filter(
          (d) => d.status === "Approved" || d.status === "Completed"
        )

        const totalAmount = completedList.reduce((acc, d) => acc + d.amount, 0)
        const count = completedList.length
        const livesImpacted = Math.round(totalAmount / 35)

        setStats({ totalAmount, count, livesImpacted })

        // 1. Process Meals Over Time Grouped by Month
        const monthlyMeals: Record<string, number> = {}
        const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        
        // Sort chronologically by creation date
        const sortedCompleted = [...completedList].sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date()
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date()
          return dateA.getTime() - dateB.getTime()
        })

        for (const donation of sortedCompleted) {
          const date = donation.createdAt?.toDate ? donation.createdAt.toDate() : new Date()
          const monthKey = `${monthNamesShort[date.getMonth()]} ${date.getFullYear() % 100}`
          const meals = Math.round(donation.amount / 35)
          monthlyMeals[monthKey] = (monthlyMeals[monthKey] || 0) + meals
        }

        const mealsData = Object.entries(monthlyMeals).map(([month, meals]) => ({
          month,
          meals,
        }))
        setMealsOverTime(mealsData)

        // 2. Process Top Causes by Organization Category
        const orgIds = [...new Set(completedList.map((d) => d.organizationId))]
        const orgMap: Record<string, string> = {}
        
        await Promise.all(
          orgIds.map(async (id) => {
            const orgObj = await getOrganization(id)
            orgMap[id] = orgObj?.category || "Other"
          })
        )

        const causeAmounts: Record<string, number> = {}
        for (const donation of completedList) {
          const cause = orgMap[donation.organizationId] || "Other"
          causeAmounts[cause] = (causeAmounts[cause] || 0) + donation.amount
        }

        const totalCauseAmount = Object.values(causeAmounts).reduce((acc, a) => acc + a, 0)
        const colors = ["#1D4ED8", "#16A34A", "#D97706", "#94A3B8", "#8B5CF6", "#EC4899"]
        
        const causesData = Object.entries(causeAmounts).map(([name, amount], idx) => ({
          name,
          value: totalCauseAmount > 0 ? Math.round((amount / totalCauseAmount) * 100) : 0,
          color: colors[idx % colors.length],
        }))
        setTopCauses(causesData)
      } catch (err) {
        console.error("Error loading donor impact page data:", err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user?.uid])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-slate-50">
        <Spinner className="size-8" />
      </div>
    )
  }

  const statItems = [
    {
      label: "Total Donations",
      value: `₹${stats.totalAmount.toLocaleString("en-IN")}`,
      sub: "Across all causes",
      icon: IndianRupee,
      bg: "bg-blue-50",
      color: "text-blue-700",
    },
    {
      label: "Donations Made",
      value: String(stats.count),
      sub: "Approved / Completed",
      icon: HandHeart,
      bg: "bg-green-50",
      color: "text-green-600",
    },
    {
      label: "Lives Impacted",
      value: `${stats.livesImpacted}+`,
      sub: "Meals delivered",
      icon: Users,
      bg: "bg-amber-50",
      color: "text-amber-600",
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Your Impact</h1>
        <p className="mt-1 text-gray-600 leading-relaxed">
          A snapshot of the difference your generosity has made through donate.org.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statItems.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">{s.label}</p>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg} ${s.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-bold text-gray-900">{s.value}</p>
              <p className="mt-1 text-xs text-gray-400">{s.sub}</p>
            </div>
          )
        })}
      </div>

      {stats.count === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <p className="text-gray-500">You haven&apos;t made any approved donations yet. Start sponsoring meal slots to see your impact chart grow!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900">Impact Over Time</h2>
            <p className="mb-4 text-sm text-gray-500">Meals donated per month</p>
            <ImpactOverTimeChart data={mealsOverTime} />
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900">Top Causes Supported</h2>
            <p className="mb-4 text-sm text-gray-500">
              Distribution of your contributions
            </p>
            <TopCausesChart data={topCauses} />
          </div>
        </div>
      )}
    </div>
  )
}
