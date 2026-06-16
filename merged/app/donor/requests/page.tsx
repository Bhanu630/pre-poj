"use client"

import { useState } from "react"
import {
  Building2,
  Calendar,
  Utensils,
  IndianRupee,
  ArrowRight,
} from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/donor/status-badge"

type RequestStatus = "Pending" | "Approved" | "Completed" | "Cancelled"

type DonationRequest = {
  id: string
  org: string
  slot: string
  date: string
  meals: number
  status: RequestStatus
  amount?: number
}

const requests: DonationRequest[] = [
  { id: "r1", org: "Hope Foundation", slot: "Lunch", date: "20 May 2025", meals: 50, status: "Pending" },
  { id: "r2", org: "Bright Future NGO", slot: "Dinner", date: "25 May 2025", meals: 30, status: "Pending" },
  { id: "r3", org: "Helping Hands", slot: "Breakfast", date: "26 May 2025", meals: 40, status: "Pending" },
  { id: "r4", org: "Annapurna Trust", slot: "Lunch", date: "28 May 2025", meals: 60, status: "Pending" },
  { id: "r5", org: "Seva Kitchen", slot: "Dinner", date: "30 May 2025", meals: 25, status: "Pending" },

  { id: "a1", org: "Hope Foundation", slot: "Lunch", date: "15 May 2025", meals: 50, status: "Approved", amount: 2500 },
  { id: "a2", org: "Bright Future NGO", slot: "Breakfast", date: "16 May 2025", meals: 35, status: "Approved", amount: 1400 },
  { id: "a3", org: "Helping Hands", slot: "Dinner", date: "18 May 2025", meals: 45, status: "Approved", amount: 2250 },
  { id: "a4", org: "Annapurna Trust", slot: "Lunch", date: "12 May 2025", meals: 70, status: "Approved", amount: 3500 },
  { id: "a5", org: "Smile Foundation", slot: "Dinner", date: "10 May 2025", meals: 20, status: "Approved", amount: 1000 },
  { id: "a6", org: "Seva Kitchen", slot: "Breakfast", date: "08 May 2025", meals: 30, status: "Approved", amount: 1200 },
  { id: "a7", org: "Aasra NGO", slot: "Lunch", date: "06 May 2025", meals: 55, status: "Approved", amount: 2750 },

  { id: "c1", org: "Hope Foundation", slot: "Dinner", date: "28 Apr 2025", meals: 40, status: "Completed", amount: 2000 },
  { id: "c2", org: "Helping Hands", slot: "Lunch", date: "25 Apr 2025", meals: 50, status: "Completed", amount: 2500 },
  { id: "c3", org: "Bright Future NGO", slot: "Breakfast", date: "22 Apr 2025", meals: 30, status: "Completed", amount: 1200 },
  { id: "c4", org: "Annapurna Trust", slot: "Lunch", date: "20 Apr 2025", meals: 65, status: "Completed", amount: 3250 },
  { id: "c5", org: "Smile Foundation", slot: "Dinner", date: "18 Apr 2025", meals: 25, status: "Completed", amount: 1250 },

  { id: "x1", org: "Seva Kitchen", slot: "Lunch", date: "14 Apr 2025", meals: 40, status: "Cancelled" },
  { id: "x2", org: "Aasra NGO", slot: "Dinner", date: "11 Apr 2025", meals: 20, status: "Cancelled" },
]

const tabs: { value: RequestStatus; label: string }[] = [
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
]

function RequestCard({ req }: { req: DonationRequest }) {
  return (
    <div className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{req.org}</h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-gray-400" />
                {req.slot} &middot; {req.date}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Utensils className="h-4 w-4 text-gray-400" />
                {req.meals} Meals
              </span>
              {typeof req.amount === "number" && (
                <span className="inline-flex items-center gap-0.5 font-medium text-gray-900">
                  <IndianRupee className="h-4 w-4 text-gray-400" />
                  {req.amount.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <StatusBadge status={req.status} />
        </div>
      </div>
    </div>
  )
}

export default function MyRequestsPage() {
  const [tab, setTab] = useState<RequestStatus>("Pending")

  const counts = tabs.reduce(
    (acc, t) => {
      acc[t.value] = requests.filter((r) => r.status === t.value).length
      return acc
    },
    {} as Record<RequestStatus, number>,
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
        <p className="mt-1 text-gray-600 leading-relaxed">
          Track the meal donation requests you have raised with partner NGOs.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as RequestStatus)}>
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
              {requests
                .filter((r) => r.status === t.value)
                .map((req) => (
                  <RequestCard key={req.id} req={req} />
                ))}
            </div>

            <div className="mt-8 flex justify-center">
              <button className="inline-flex items-center gap-2 rounded-xl border-2 border-blue-700 px-6 py-2.5 font-medium text-blue-700 transition-colors hover:bg-blue-50">
                View All Requests
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
