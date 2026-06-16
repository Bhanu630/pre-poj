"use client"

import { useState } from "react"
import Link from "next/link"
import { MapPin, Users, CalendarDays, Heart, BadgeCheck, ArrowRight } from "lucide-react"
import type { OrganizationDoc } from "@/lib/firestore"
import { Button } from "@/components/ui/button"

export function OrgCard({ org }: { org: OrganizationDoc }) {
  const [favorite, setFavorite] = useState(false)

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="relative h-44 w-full overflow-hidden">
        <img
          src="/images/hope-foundation.png"
          alt={`${org.name} at work in ${org.city}`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {org.verified && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground shadow-sm">
            <BadgeCheck className="h-3.5 w-3.5" />
            Registered
          </span>
        )}
        <button
          onClick={() => setFavorite((v) => !v)}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={favorite}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-card/90 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-destructive"
        >
          <Heart className="h-4 w-4" fill={favorite ? "currentColor" : "none"} color={favorite ? "var(--destructive)" : "currentColor"} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">{org.category}</span>
          <h3 className="mt-1 text-lg font-bold text-foreground">{org.name}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {org.city}, {org.state}
          </p>
        </div>

        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{org.description}</p>

        <div className="mt-auto flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-primary" />
            <strong className="font-semibold text-foreground">{(org.beneficiaries || 0).toLocaleString("en-IN")}</strong>
            beneficiaries
          </span>
          {org.founded && (
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-primary" />
              Founded {org.founded}
            </span>
          )}
        </div>

        <Button asChild className="mt-2 w-full rounded-xl">
          <Link href={`/donor/org/${org.uid}`}>
            View Organization
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </article>
  )
}
