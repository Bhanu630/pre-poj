"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Check, X, Building2, IndianRupee, Calendar, Loader2 } from "lucide-react"
import type { Timestamp } from "firebase/firestore"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/lib/auth-context"
import {
  getOrgDonations,
  getUser,
  updateDonationStatus,
  type DonationDoc,
} from "@/lib/firestore"

type Status = DonationDoc["status"]

const tabs: { value: Status | "All"; label: string }[] = [
  { value: "All", label: "All" },
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Completed", label: "Completed" },
  { value: "Rejected", label: "Rejected" },
]

function statusClasses(status: Status) {
  switch (status) {
    case "Approved":
      return "bg-green-100 text-green-700"
    case "Completed":
      return "bg-blue-100 text-blue-700"
    case "Pending":
      return "bg-amber-100 text-amber-700"
    case "Rejected":
      return "bg-red-100 text-red-700"
    default:
      return "bg-gray-100 text-gray-600"
  }
}

function formatDate(ts?: Timestamp) {
  if (!ts) return "—"
  return ts.toDate().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

type DonationView = DonationDoc & { donorName: string; donorEmail: string }

function RequestCard({
  donation,
  onApprove,
  onReject,
  acting,
}: {
  donation: DonationView
  onApprove: (id: string) => void
  onReject: (id: string) => void
  acting: string | null
}) {
  const isActing = acting === donation.id

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{donation.donorName}</h3>
            <p className="text-xs text-gray-400">{donation.donorEmail}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-gray-400" />
                {formatDate(donation.createdAt)}
              </span>
              <span className="inline-flex items-center gap-0.5 font-semibold text-gray-900">
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

        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusClasses(donation.status)}`}
          >
            {donation.status}
          </span>

          {donation.status === "Pending" && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => donation.id && onApprove(donation.id)}
                disabled={isActing || !donation.id}
                className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-60"
              >
                {isActing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Approve
              </button>
              <button
                onClick={() => donation.id && onReject(donation.id)}
                disabled={isActing || !donation.id}
                className="inline-flex items-center gap-1.5 rounded-xl border-2 border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
              >
                {isActing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function SponsorshipRequests() {
  const { user } = useAuth()
  const [donations, setDonations] = useState<DonationView[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)
  const [tab, setTab] = useState<Status | "All">("All")

  const loadDonations = useCallback(async () => {
    if (!user?.uid) {
      setDonations([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const data = await getOrgDonations(user.uid)
      const uniqueDonorIds = [...new Set(data.map((d) => d.donorId))]
      const donorEntries = await Promise.all(
        uniqueDonorIds.map(async (id) => {
          const donor = await getUser(id)
          return [id, { name: donor?.name ?? "Unknown Donor", email: donor?.email ?? "" }] as const
        })
      )
      const donorMap = Object.fromEntries(donorEntries)

      setDonations(
        data.map((d) => ({
          ...d,
          donorName: donorMap[d.donorId]?.name ?? "Unknown Donor",
          donorEmail: donorMap[d.donorId]?.email ?? "",
        }))
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

  const handleApprove = async (id: string) => {
    setActing(id)
    try {
      await updateDonationStatus(id, "Approved")
      setDonations((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: "Approved" as Status } : d))
      )
    } catch (error) {
      console.error("Failed to approve:", error)
    } finally {
      setActing(null)
    }
  }

  const handleReject = async (id: string) => {
    setActing(id)
    try {
      await updateDonationStatus(id, "Rejected")
      setDonations((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: "Rejected" as Status } : d))
      )
    } catch (error) {
      console.error("Failed to reject:", error)
    } finally {
      setActing(null)
    }
  }

  const counts = useMemo(() => {
    const result: Record<string, number> = { All: donations.length }
    for (const t of tabs.slice(1)) {
      result[t.value] = donations.filter((d) => d.status === t.value).length
    }
    return result
  }, [donations])

  const filtered = useMemo(
    () => (tab === "All" ? donations : donations.filter((d) => d.status === tab)),
    [donations, tab]
  )

  const totalAmount = useMemo(
    () =>
      donations
        .filter((d) => d.status === "Approved" || d.status === "Completed")
        .reduce((sum, d) => sum + d.amount, 0),
    [donations]
  )

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Sponsorship Requests</h1>
        <p className="mt-1 leading-relaxed text-gray-600">
          Review and manage donation requests from donors.
        </p>
      </div>

      {/* Summary */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs text-gray-400">Total Requests</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{donations.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs text-gray-400">Pending</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{counts["Pending"] ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs text-gray-400">Approved</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{counts["Approved"] ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs text-gray-400">Total Raised</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            ₹{totalAmount.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {donations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <p className="font-semibold text-gray-900">No sponsorship requests yet</p>
          <p className="mt-1 text-sm text-gray-600">
            Requests from donors will appear here once they submit sponsorships.
          </p>
        </div>
      ) : (
        <Tabs value={tab} onValueChange={(v) => setTab(v as Status | "All")}>
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
                  {counts[t.value] ?? 0}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((t) => (
            <TabsContent key={t.value} value={t.value} className="mt-0">
              <div className="flex flex-col gap-4">
                {filtered.map((donation) => (
                  <RequestCard
                    key={donation.id}
                    donation={donation}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    acting={acting}
                  />
                ))}
                {filtered.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
                    No {t.value === "All" ? "" : t.label.toLowerCase()} requests.
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
