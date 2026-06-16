"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Building2, Calendar, IndianRupee } from "lucide-react"
import type { Timestamp } from "firebase/firestore"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/donor/status-badge"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/lib/auth-context"
import {
  getDonorDonations,
  getOrganization,
  type DonationDoc,
} from "@/lib/firestore"

type DonationStatus = DonationDoc["status"]

const tabs: { value: DonationStatus; label: string }[] = [
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Completed", label: "Completed" },
  { value: "Rejected", label: "Rejected" },
]

function formatDonationDate(ts?: Timestamp) {
  if (!ts) return "—"
  return ts.toDate().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatInr(value: number) {
  return value.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  })
}

type DonationView = DonationDoc & { orgName: string }

function DonationCard({ donation }: { donation: DonationView }) {
  return (
    <div className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{donation.orgName}</h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-gray-400" />
                {formatDonationDate(donation.createdAt)}
              </span>
              <span className="inline-flex items-center gap-0.5 font-medium text-gray-900">
                <IndianRupee className="h-4 w-4 text-gray-400" />
                {donation.amount.toLocaleString("en-IN")}
              </span>
              {donation.occasion && (
                <span className="text-gray-500">{donation.occasion}</span>
              )}
            </div>
            {donation.message && (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{donation.message}</p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <StatusBadge status={donation.status} />
        </div>
      </div>
    </div>
  )
}

export default function DonationsPage() {
  const { user } = useAuth()
  const [donations, setDonations] = useState<DonationView[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<DonationStatus>("Pending")

  const loadDonations = useCallback(async () => {
    if (!user?.uid) {
      setDonations([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const data = await getDonorDonations(user.uid)
      const uniqueOrgIds = [...new Set(data.map((d) => d.organizationId))]
      const orgEntries = await Promise.all(
        uniqueOrgIds.map(async (id) => {
          const org = await getOrganization(id)
          return [id, org?.name ?? "Unknown Organization"] as const
        }),
      )
      const orgNames = Object.fromEntries(orgEntries)

      setDonations(
        data.map((donation) => ({
          ...donation,
          orgName: orgNames[donation.organizationId] ?? "Unknown Organization",
        })),
      )
    } catch (error) {
      console.error("Failed to load donations:", error)
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  useEffect(() => {
    loadDonations()
  }, [loadDonations])

  const counts = useMemo(
    () =>
      tabs.reduce(
        (acc, t) => {
          acc[t.value] = donations.filter((d) => d.status === t.value).length
          return acc
        },
        {} as Record<DonationStatus, number>,
      ),
    [donations],
  )

  const totalContributed = useMemo(
    () =>
      donations
        .filter((d) => d.status === "Approved" || d.status === "Completed")
        .reduce((sum, d) => sum + d.amount, 0),
    [donations],
  )

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Donations</h1>
        <p className="mt-1 leading-relaxed text-gray-600">
          Review your complete sponsorship history and track the status of each contribution.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Donations</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{donations.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Contributed</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{formatInr(totalContributed)}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{counts.Pending}</p>
        </div>
      </div>

      {donations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="font-semibold text-gray-900">No donations yet</p>
          <p className="mt-1 text-sm text-gray-600">
            Browse organizations and sponsor a meal to see your donation history here.
          </p>
        </div>
      ) : (
        <Tabs value={tab} onValueChange={(v) => setTab(v as DonationStatus)}>
          <TabsList className="mb-6 flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
            {tabs.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 data-[state=active]:border-blue-700 data-[state=active]:bg-blue-700 data-[state=active]:text-white"
              >
                {t.label}
                <span
                  className={
                    "ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium " +
                    (tab === t.value
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-600")
                  }
                >
                  {counts[t.value]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((t) => (
            <TabsContent key={t.value} value={t.value} className="mt-0">
              <div className="flex flex-col gap-6">
                {donations
                  .filter((d) => d.status === t.value)
                  .map((donation) => (
                    <DonationCard key={donation.id} donation={donation} />
                  ))}
                {counts[t.value] === 0 && (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
                    No {t.label.toLowerCase()} donations.
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
