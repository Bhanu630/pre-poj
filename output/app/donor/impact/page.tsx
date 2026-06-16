"use client"

import { useEffect, useState, useMemo } from "react"
import { IndianRupee, HandHeart, Users } from "lucide-react"
import {
  ImpactOverTimeChart,
  TopCausesChart,
} from "@/components/donor/impact-charts"
import { useAuth } from "@/lib/auth-context"
import { getDonorDonations, getOrganizations, type DonationDoc, type OrganizationDoc } from "@/lib/firestore"
import { Spinner } from "@/components/ui/spinner"

export default function ImpactPage() {
  const { user } = useAuth()
  const [donations, setDonations] = useState<DonationDoc[]>([])
  const [organizations, setOrganizations] = useState<OrganizationDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) return
    async function load() {
      try {
        const [donationsData, orgsData] = await Promise.all([
          getDonorDonations(user!.uid),
          getOrganizations(),
        ])
        setDonations(donationsData)
        setOrganizations(orgsData)
      } catch (err) {
        console.error("Failed to load impact data:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.uid])

  const totalAmount = useMemo(() =>
    donations
      .filter(d => d.status === "Approved" || d.status === "Completed")
      .reduce((sum, d) => sum + d.amount, 0),
    [donations]
  )

  const livesImpacted = donations.length * 45

  const stats = [
    {
      label: "Total Donations",
      value: `₹${totalAmount.toLocaleString("en-IN")}`,
      sub: "Across all causes",
      icon: IndianRupee,
      bg: "bg-blue-50",
      color: "text-blue-700",
    },
    {
      label: "Donations Made",
      value: String(donations.length),
      sub: "All Time",
      icon: HandHeart,
      bg: "bg-green-50",
      color: "text-green-600",
    },
    {
      label: "Lives Impacted",
      value: `${livesImpacted}+`,
      sub: "People reached",
      icon: Users,
      bg: "bg-amber-50",
      color: "text-amber-600",
    },
  ]

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><Spinner className="size-8" /></div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Your Impact</h1>
        <p className="mt-1 text-gray-600 leading-relaxed">
          A snapshot of the difference your generosity has made through donate.org.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">{s.label}</p>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg} ${s.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-bold text-gray-900">{s.value}</p>
              <p className="mt-1 text-xs text-gray-400">{s.sub}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900">Impact Over Time</h2>
          <p className="mb-4 text-sm text-gray-500">Meals donated per month</p>
          <ImpactOverTimeChart donations={donations} />
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900">Top Causes Supported</h2>
          <p className="mb-4 text-sm text-gray-500">Distribution of your contributions</p>
          <TopCausesChart donations={donations} organizations={organizations} />
        </div>
      </div>
    </div>
  )
}
