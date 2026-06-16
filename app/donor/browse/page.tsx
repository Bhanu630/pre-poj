"use client"

import { useEffect, useState } from "react"
import {
  Building2,
  Calendar,
  Utensils,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/donor/status-badge"
import { useAuth } from "@/lib/auth-context"
import {
  getOrgSponsorshipRequests,
  approveSponsorshipRequest,
  rejectSponsorshipRequest,
  type SponsorshipRequestDoc,
} from "@/lib/firestore"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type RequestStatusFilter = "pending" | "approved" | "rejected" | "all"

const tabs: { value: RequestStatusFilter; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All Requests" },
]

function RequestCard({ req, onUpdate }: { req: SponsorshipRequestDoc; onUpdate: () => void }) {
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    setLoading(true)
    try {
      await approveSponsorshipRequest(req.id!, req)
      toast.success("Sponsorship request approved!")
      onUpdate()
    } catch (error) {
      console.error("Error approving request:", error)
      toast.error("Failed to approve request.")
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    setLoading(true)
    try {
      await rejectSponsorshipRequest(req.id!)
      toast.info("Sponsorship request rejected.")
      onUpdate()
    } catch (error) {
      console.error("Error rejecting request:", error)
      toast.error("Failed to reject request.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{req.donorName}</h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-gray-400" />
                {req.createdAt?.toDate().toLocaleDateString() || "N/A"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Utensils className="h-4 w-4 text-gray-400" />
                {req.meals || 0} Meals {req.slotTitle && `(${req.slotTitle})`}
              </span>
              <span className="inline-flex items-center gap-0.5 font-medium text-gray-900">
                <IndianRupee className="h-4 w-4 text-gray-400" />
                {req.amount.toLocaleString("en-IN")}
              </span>
            </div>
            {req.message && (
              <p className="mt-2 text-sm text-gray-500 italic">"{req.message}"</p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <StatusBadge status={req.status} />
          {req.status === "pending" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl"
                onClick={handleReject}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                <span className="ml-2 hidden sm:inline">Reject</span>
              </Button>
              <Button size="sm" className="rounded-xl" onClick={handleApprove} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                <span className="ml-2 hidden sm:inline">Approve</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function OrgRequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<SponsorshipRequestDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<RequestStatusFilter>("pending")

  const fetchRequests = async () => {
    if (!user?.uid) return
    setLoading(true)
    try {
      const fetchedRequests = await getOrgSponsorshipRequests(user.uid)
      setRequests(fetchedRequests)
    } catch (error) {
      console.error("Failed to fetch sponsorship requests:", error)
      toast.error("Failed to load requests.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [user?.uid])

  const filteredRequests = requests.filter((req) => {
    if (activeTab === "all") return true
    return req.status === activeTab
  })

  const counts = tabs.reduce(
    (acc, t) => {
      if (t.value === "all") {
        acc[t.value] = requests.length
      } else {
        acc[t.value] = requests.filter((r) => r.status === t.value).length
      }
      return acc
    },
    {} as Record<RequestStatusFilter, number>,
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
        <h1 className="text-2xl font-bold text-gray-900">Sponsorship Requests</h1>
        <p className="mt-1 text-gray-600 leading-relaxed">
          Manage incoming sponsorship requests from donors.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as RequestStatusFilter)}>
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
                  (activeTab === t.value
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
              {filteredRequests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                  <p className="font-semibold text-foreground">No {t.label.toLowerCase()} requests found.</p>
                  <p className="mt-1 text-sm text-muted-foreground">Check other tabs or wait for new requests.</p>
                </div>
              ) : (
                filteredRequests.map((req) => (
                  <RequestCard key={req.id} req={req} onUpdate={fetchRequests} />
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}