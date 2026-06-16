"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  MapPin,
  Users,
  CalendarDays,
  Mail,
  Phone,
  Globe,
  BadgeCheck,
  Heart,
  Share2,
  AlertCircle,
} from "lucide-react"
import { getSlots, getMyRequirements, type OrganizationDoc, type SlotDoc, type RequirementDoc } from "@/lib/firestore"
import { StatusBadge } from "@/components/donor/status-badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

const priorityStyles: Record<string, string> = {
  High: "bg-danger-soft text-destructive",
  Medium: "bg-warning-soft text-warning",
  Low: "bg-info-soft text-info",
}

export function OrgDetails({ org }: { org: OrganizationDoc }) {
  const [favorite, setFavorite] = useState(false)
  const [slots, setSlots] = useState<SlotDoc[]>([])
  const [requirements, setRequirements] = useState<RequirementDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [slotsData, reqsData] = await Promise.all([
          getSlots({ organizationId: org.orgId }),
          getMyRequirements(org.orgId)
        ])
        setSlots(slotsData)
        setRequirements(reqsData)
      } catch (error) {
        console.error("Failed to load org secondary data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [org.orgId])

  // Group slots by date for the calendar view
  const groupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = []
    acc[slot.date].push(slot)
    return acc
  }, {} as Record<string, SlotDoc[]>)

  const sortedDates = Object.keys(groupedSlots).sort()

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/donor/browse"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Organizations
      </Link>

      {/* Cover */}
      <div className="relative h-56 w-full overflow-hidden rounded-2xl md:h-72">
        <img
          src="/images/hope-foundation.png"
          alt={`${org.name} cover`}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
        {org.verified && (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-success px-3 py-1.5 text-xs font-semibold text-success-foreground shadow-sm">
            <BadgeCheck className="h-4 w-4" />
            Registered Organization
          </span>
        )}
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3">
          <div className="text-card">
            <h1 className="text-2xl font-bold text-white md:text-3xl">{org.name}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-white/85">
              <MapPin className="h-4 w-4" />
              {org.city}, {org.state}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFavorite((v) => !v)}
              aria-pressed={favorite}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-card/90 text-muted-foreground backdrop-blur transition-colors hover:text-destructive"
            >
              <Heart className="h-5 w-5" fill={favorite ? "var(--destructive)" : "none"} color={favorite ? "var(--destructive)" : "currentColor"} />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-card/90 text-muted-foreground backdrop-blur transition-colors hover:text-primary">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={Users} label="Beneficiaries" value={(org.beneficiaries || 0).toLocaleString("en-IN")} />
        <StatTile icon={CalendarDays} label="Founded" value={String(org.founded || "—")} />
        <StatTile icon={BadgeCheck} label="Type" value={org.category} />
        <StatTile icon={Heart} label="Location" value={org.city} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="slots" className="w-full">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-xl bg-secondary p-1">
          <TabsTrigger value="about" className="rounded-lg">About Us</TabsTrigger>
          <TabsTrigger value="slots" className="rounded-lg">Sponsorship Slots</TabsTrigger>
          <TabsTrigger value="requirements" className="rounded-lg">Requirements</TabsTrigger>
          <TabsTrigger value="gallery" className="rounded-lg">Gallery</TabsTrigger>
        </TabsList>

        {/* About */}
        <TabsContent value="about" className="mt-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
              <h2 className="text-lg font-bold text-foreground">About {org.name}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{org.description}</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-sm font-bold text-foreground">Contact Information</h3>
              <ul className="mt-4 flex flex-col gap-4 text-sm">
                <ContactRow icon={Mail} label="Email" value={org.email || ""} href={`mailto:${org.email}`} />
                <ContactRow icon={Phone} label="Phone" value={org.phone || ""} href={`tel:${org.phone}`} />
                <ContactRow icon={Globe} label="Website" value={org.website || ""} href={`https://${org.website}`} />
              </ul>
            </div>
          </div>
        </TabsContent>

        {/* Slots */}
        <TabsContent value="slots" className="mt-6">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-foreground">Sponsorship Slots</h2>
              <p className="text-sm text-muted-foreground">Select a date to provide meals for our beneficiaries.</p>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center"><Spinner /></div>
            ) : sortedDates.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No slots currently available for sponsorship.</div>
            ) : (
              <div className="flex flex-col gap-4">
                {sortedDates.map((date) => (
                  <div key={date} className="rounded-xl border border-border">
                    <div className="flex items-center gap-2 border-b border-border bg-secondary/60 px-4 py-2.5">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      <span className="text-sm font-bold text-foreground">{date}</span>
                    </div>

                    <ul className="divide-y divide-border">
                      {groupedSlots[date].map((slot) => {
                        const pct = Math.round(((slot.sponsored || 0) / (slot.totalNeeded || 1)) * 100)
                        const full = (slot.sponsored || 0) >= (slot.totalNeeded || 1)
                        return (
                          <li key={slot.id} className="grid grid-cols-2 items-center gap-3 px-4 py-3 md:grid-cols-12">
                            <span className="col-span-1 font-semibold text-foreground md:col-span-3">{slot.mealType}</span>
                            <span className="col-span-1 md:col-span-3">
                              <StatusBadge status={full ? "Full" : pct > 0 ? "Partially Filled" : "Available"} />
                            </span>
                            <div className="col-span-1 md:col-span-4">
                              <div className="flex items-center gap-2">
                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                                  <div
                                    className={cn("h-full rounded-full", full ? "bg-muted-foreground" : pct > 0 ? "bg-warning" : "bg-success")}
                                    style={{ width: `${Math.max(pct, 4)}%` }}
                                  />
                                </div>
                                <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">
                                  {slot.sponsored || 0}/{slot.totalNeeded}
                                </span>
                              </div>
                            </div>
                            <div className="col-span-1 flex justify-end md:col-span-2">
                              {full ? (
                                <Button size="sm" variant="outline" disabled className="rounded-lg">Full</Button>
                              ) : (
                                <Button asChild size="sm" className="rounded-lg">
                                  <Link href={`/donor/sponsor?org=${org.orgId}&slot=${slot.id}`}>Sponsor Now</Link>
                                </Button>
                              )}
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Requirements */}
        <TabsContent value="requirements" className="mt-6">
          {loading ? (
             <div className="py-12 flex justify-center"><Spinner /></div>
          ) : requirements.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No urgent requirements listed at the moment.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {requirements.map((req) => (
                <div key={req.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
                      <AlertCircle className="h-5 w-5" />
                    </span>
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", priorityStyles[req.priority])}>
                      {req.priority} Priority
                    </span>
                  </div>
                  <h3 className="mt-4 font-bold text-foreground">{req.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{req.description}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4">
                     <span>Need: {req.totalQuantity} {req.unit}</span>
                     <span>Received: {req.fulfilledQuantity}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Gallery */}
        <TabsContent value="gallery" className="mt-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted flex items-center justify-center">
                 <Heart className="h-8 w-8 text-muted-foreground/30" />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatTile({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-3 truncate text-base font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function ContactRow({ icon: Icon, label, value, href }: { icon: any; label: string; value: string; href: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <a href={href} className="truncate text-sm font-medium text-foreground hover:text-primary">
          {value || "Not provided"}
        </a>
      </div>
    </li>
  )
}
