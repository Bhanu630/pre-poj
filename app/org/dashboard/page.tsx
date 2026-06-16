"use client"

import { useEffect, useState } from "react"
import { OrgDashboard } from "@/components/dashboard/org-dashboard"
import { useAuth } from "@/lib/auth-context"
import {
  getOrganization,
  getOrgDonations,
  getMyRequirements,
  getUser,
  type OrganizationDoc,
  type DonationDoc,
  type RequirementDoc,
} from "@/lib/firestore"
import { Spinner } from "@/components/ui/spinner"

export default function OrgDashboardPage() {
  const { user, userDoc } = useAuth()
  const [org, setOrg] = useState<OrganizationDoc | null>(null)
  const [donations, setDonations] = useState<DonationDoc[]>([])
  const [requirements, setRequirements] = useState<RequirementDoc[]>([])
  const [donorNames, setDonorNames] = useState<Record<string, { name: string; email: string }>>({})
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      const uid = user!.uid

      try {
        const [orgData, donationsData, reqsData] = await Promise.all([
          getOrganization(uid),
          getOrgDonations(uid),
          getMyRequirements(uid),
        ])

        if (cancelled) return

        setOrg(orgData)
        setDonations(donationsData)
        setRequirements(reqsData)

        const uniqueDonorIds = [...new Set(donationsData.map((d) => d.donorId))]
        const donorEntries = await Promise.all(
          uniqueDonorIds.map(async (id) => {
            const donor = await getUser(id)
            return [id, { name: donor?.name ?? "Unknown Donor", email: donor?.email ?? "" }] as const
          })
        )

        if (cancelled) return

        setDonorNames(Object.fromEntries(donorEntries))
        setLastUpdated(new Date())
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user?.uid])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner className="size-8" />
      </div>
    )
  }

  return (
    <OrgDashboard
      org={org}
      userName={userDoc?.name ?? org?.name ?? "there"}
      donations={donations}
      requirements={requirements}
      donorNames={donorNames}
      lastUpdated={lastUpdated}
    />
  )
}
