"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Search, Eye, Users, Utensils, Gift } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getOrgDonations, getUser, type DonationDoc, type UserDoc } from "@/lib/firestore"
import { Spinner } from "@/components/ui/spinner"

interface DonorStats {
  id: string
  name: string
  donations: number
  meals: number
  lastDonation: string
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function DonorsList() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [donorsData, setDonorsData] = useState<DonorStats[]>([])
  const [query, setQuery] = useState("")

  const loadDonors = useCallback(async () => {
    if (!user?.uid) return

    setLoading(true)
    try {
      const donations = await getOrgDonations(user.uid)
      
      // Group by donorId
      const groups: Record<string, { count: number; totalAmount: number; lastDate: any }> = {}
      donations.forEach((d) => {
        if (!groups[d.donorId]) {
          groups[d.donorId] = { count: 0, totalAmount: 0, lastDate: d.createdAt }
        }
        groups[d.donorId].count += 1
        groups[d.donorId].totalAmount += d.amount
        if (d.createdAt && (!groups[d.donorId].lastDate || d.createdAt.seconds > groups[d.donorId].lastDate.seconds)) {
          groups[d.donorId].lastDate = d.createdAt
        }
      })

      // Fetch donor names
      const donorIds = Object.keys(groups)
      const donorProfiles = await Promise.all(
        donorIds.map(async (id) => {
          const profile = await getUser(id)
          return { id, profile }
        })
      )

      const stats: DonorStats[] = donorProfiles.map(({ id, profile }) => {
        const group = groups[id]
        const lastDate = group.lastDate?.toDate ? group.lastDate.toDate() : new Date()
        return {
          id,
          name: profile?.name || "Unknown Donor",
          donations: group.count,
          meals: Math.floor(group.totalAmount / 35),
          lastDonation: lastDate.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
        }
      })

      setDonorsData(stats)
    } catch (error) {
      console.error("Failed to load donors:", error)
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  useEffect(() => {
    loadDonors()
  }, [loadDonors])

  const filtered = useMemo(
    () => donorsData.filter((d) => d.name.toLowerCase().includes(query.trim().toLowerCase())),
    [donorsData, query],
  )

  const totals = useMemo(
    () => ({
      donors: donorsData.length,
      donations: donorsData.reduce((s, d) => s + d.donations, 0),
      meals: donorsData.reduce((s, d) => s + d.meals, 0),
    }),
    [donorsData],
  )

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Donors</h1>
        <p className="mt-1 text-gray-600">Manage and review everyone supporting your organization.</p>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <SummaryCard icon={Users} label="Total Donors" value={totals.donors.toString()} />
        <SummaryCard icon={Gift} label="Total Donations" value={totals.donations.toString()} />
        <SummaryCard icon={Utensils} label="Total Meals" value={totals.meals.toLocaleString()} />
      </div>

      {/* Table card */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* Search */}
        <div className="border-b border-gray-100 p-4 sm:p-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search donors..."
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Search donors"
            />
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3 font-medium">Donor</th>
                <th className="px-6 py-3 font-medium">Donations</th>
                <th className="px-6 py-3 font-medium">Total Meals</th>
                <th className="px-6 py-3 font-medium">Last Donation</th>
                <th className="px-6 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((d) => (
                <tr key={d.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                        {initials(d.name)}
                      </span>
                      <span className="font-medium text-gray-900">{d.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{d.donations}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                      {d.meals} Meals
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{d.lastDonation}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center gap-1.5 rounded-xl border-2 border-blue-700 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50">
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="divide-y divide-gray-100 md:hidden">
          {filtered.map((d) => (
            <div key={d.id} className="p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                  {initials(d.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">{d.name}</p>
                  <p className="text-xs text-gray-400">Last donation {d.lastDonation}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{d.donations} donations</span>
                  <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                    {d.meals} Meals
                  </span>
                </div>
                <button className="inline-flex items-center gap-1.5 rounded-xl border-2 border-blue-700 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50">
                  <Eye className="h-4 w-4" />
                  View
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center text-sm text-gray-500">
            {donorsData.length === 0 ? "You don't have any donors yet." : `No donors match "${query}".`}
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  )
}
