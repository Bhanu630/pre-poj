"use client"

import { use, useEffect, useState } from "react"
import { notFound } from "next/navigation"
import { getOrganization, type OrganizationDoc } from "@/lib/firestore"
import { OrgDetails } from "@/components/donor/org-details"
import { Spinner } from "@/components/ui/spinner"

export default function OrgPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [org, setOrg] = useState<OrganizationDoc | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrganization(id)
      .then(setOrg)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!org) notFound()

  return <OrgDetails org={org} />
}
