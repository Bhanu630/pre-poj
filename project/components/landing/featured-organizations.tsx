"use client"

import { useEffect, useState } from "react"
import { MapPin, BadgeCheck, ArrowRight, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { getActiveOrganizations, type OrganizationDoc } from "@/lib/firestore"

export function FeaturedOrganizations() {
  const [organizations, setOrganizations] = useState<OrganizationDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getActiveOrganizations()
      .then(setOrganizations)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="organizations" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-pretty text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Featured organizations
          </h2>
          <p className="mt-3 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
            Hand-picked, fully verified causes that need your support today. Every donation is
            tracked and reported.
          </p>
        </div>
        <Button variant="outline" className="gap-2 rounded-xl border-2 border-primary font-medium text-primary hover:bg-accent">
          View all
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          // Skeleton placeholders — preserves grid layout while loading
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm animate-pulse"
            >
              <div className="h-44 w-full bg-muted" />
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-5/6 rounded bg-muted" />
                <div className="mt-auto h-2 w-full rounded bg-muted" />
                <div className="h-9 w-full rounded-xl bg-muted" />
              </div>
            </div>
          ))
        ) : organizations.length === 0 ? (
          // Empty state
          <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-4 text-base font-semibold text-foreground">
              No organizations yet
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Be the first to register your organization and start making an impact.
            </p>
            <Button className="mt-6 rounded-xl bg-primary font-medium text-primary-foreground hover:bg-primary/90">
              Register your organization
            </Button>
          </div>
        ) : (
          organizations.map((org) => (
            <OrgCard key={org.uid ?? org.orgId} org={org} />
          ))
        )}
      </div>
    </section>
  )
}

function OrgCard({ org }: { org: OrganizationDoc }) {
  // Use organizationName (new schema) with fallback to name (legacy)
  const displayName = org.organizationName ?? org.name ?? "Unnamed Organization"
  const location = [org.city, org.state].filter(Boolean).join(", ") || org.address || ""

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="relative h-44 w-full overflow-hidden bg-muted">
        <div className="flex h-full items-center justify-center">
          <Building2 className="h-12 w-12 text-muted-foreground/30" />
        </div>
        <span className="absolute left-3 top-3 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold text-primary backdrop-blur">
          {org.category || "General"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold leading-snug text-foreground">{displayName}</h3>
          <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
            <BadgeCheck className="h-3.5 w-3.5" />
            Active
          </span>
        </div>

        {location ? (
          <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {location}
          </p>
        ) : null}

        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {org.description || "Supporting communities through meaningful impact."}
        </p>

        <Button className="mt-4 w-full rounded-xl bg-primary font-medium text-primary-foreground hover:bg-primary/90">
          Donate
        </Button>
      </div>
    </article>
  )
}
