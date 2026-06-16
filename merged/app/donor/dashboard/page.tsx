"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  HandHeart,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react"
import { StatusBadge } from "@/components/donor/status-badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { getDonorDonations, getOrganizations, type DonationDoc, type OrganizationDoc } from "@/lib/firestore"
import { Spinner } from "@/components/ui/spinner"

const statIcons: Record<string, any> = {
  donations: HandHeart,
  pending: Clock,
  approved: CheckCircle2,
  impact: TrendingUp,
}

export default function DashboardPage() {
  const { user, userDoc } = useAuth()
  const [donations, setDonations] = useState<DonationDoc[]>([])
  const [organizations, setOrganizations] = useState<OrganizationDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) return

    async function load() {
      setLoading(true)
      try {
        const [donationsData, orgsData] = await Promise.all([
          getDonorDonations(user!.uid),
          getOrganizations()
        ])
        setDonations(donationsData)
        setOrganizations(orgsData)
      } catch (error) {
        console.error("Dashboard load failed:", error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.uid])

  const stats = useMemo(() => {
    const totalAmount = donations
      .filter(d => d.status === "Approved" || d.status === "Completed")
      .reduce((sum, d) => sum + d.amount, 0)
    
    const pendingCount = donations.filter(d => d.status === "Pending").length
    const approvedCount = donations.filter(d => d.status === "Approved").length
    const livesImpacted = donations.length * 45 // Rough estimate for UI

    return [
      { label: "Total Donations", value: `₹${totalAmount.toLocaleString("en-IN")}`, sub: `Across ${donations.length} sponsorships`, key: "donations" },
      { label: "Pending Requests", value: String(pendingCount), sub: "Awaiting Response", key: "pending" },
      { label: "Approved Donations", value: String(approvedCount), sub: "This Year", key: "approved" },
      { label: "Lives Impacted", value: `${livesImpacted}+`, sub: "Meals & support delivered", key: "impact" },
    ]
  }, [donations])

  const recentActivities = useMemo(() => donations.slice(0, 3), [donations])
  const recommended = useMemo(() => organizations.slice(0, 2), [organizations])

  if (loading) {
    return (
      <div className="py-12 flex justify-center"><Spinner className="size-8" /></div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome */}
      <section className="overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground md:p-8">
        <h1 className="text-balance text-2xl font-bold md:text-3xl">
          Welcome back, {userDoc?.name?.split(" ")[0] || "there"}! Thank you for being a changemaker.
        </h1>
        <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-primary-foreground/80 md:text-base">
          Your generosity has helped serve thousands of meals this year. Here&apos;s a snapshot of your impact so far.
        </p>
        <Button asChild variant="secondary" className="mt-5 rounded-xl">
          <Link href="/donor/browse">
            Browse Organizations
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>

      {/* Stat cards */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = statIcons[stat.key] ?? HandHeart
          return (
            <div
              key={stat.key}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="mt-1 text-sm font-medium text-foreground">{stat.label}</p>
              <p className="text-xs text-muted-foreground">{stat.sub}</p>
            </div>
          )
        })}
      </section>

      {/* Activities + Recommended */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent activities */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Recent Activities</h2>
            <Link
              href="/donor/donations"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-secondary-foreground"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <ul className="flex flex-col divide-y divide-border">
            {recentActivities.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">You haven&apos;t made any donations yet.</p>
            ) : (
              recentActivities.map((activity) => (
                <li key={activity.id} className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
                    <HandHeart className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{activity.occasion || "Sponsorship"}</p>
                    <p className="text-sm text-muted-foreground">
                      {organizations.find(o => o.orgId === activity.organizationId)?.name || 'Organization'} &middot; {activity.createdAt?.toDate().toLocaleDateString() || "Today"}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    ₹{activity.amount.toLocaleString("en-IN")}
                  </span>
                  <StatusBadge status={activity.status} />
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Recommended */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Recommended For You</h2>
          </div>

          <div className="flex flex-col gap-4">
            {recommended.map((org) => (
              <div key={org.orgId} className="rounded-xl border border-border p-4 transition-colors hover:border-primary/40">
                <div className="flex items-center gap-3">
                  <img
                    src="/images/hope-foundation.png"
                    alt={org.name}
                    className="h-12 w-12 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{org.name}</p>
                    <p className="text-xs text-muted-foreground">{org.city}, {org.state}</p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {org.description}
                </p>
                <Button asChild size="sm" className="mt-3 w-full rounded-lg">
                  <Link href={`/donor/org/${org.orgId}`}>Sponsor Now</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
