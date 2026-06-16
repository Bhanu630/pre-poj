"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Info, CheckCircle2, Utensils, Building2, CalendarDays, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import {
  createSponsorshipRequest,
  getOrganization,
  type OrganizationDoc,
} from "@/lib/firestore"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"

export function SponsorForm() {
  const { user, userDoc } = useAuth()
  const router = useRouter()
  const params = useSearchParams()
  const orgId = params.get("org") ?? ""
  const slotId = params.get("slot") ?? undefined
  const meal = params.get("meal") ?? "Lunch"
  const date = params.get("date") ?? ""

  const [org, setOrg] = useState<OrganizationDoc | null>(null)
  const [loadingOrg, setLoadingOrg] = useState(true)
  const [occasion, setOccasion] = useState("")
  const [meals, setMeals] = useState("100")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!orgId) {
      setLoadingOrg(false)
      return
    }
    getOrganization(orgId)
      .then((data) => setOrg(data))
      .catch((err) => console.error("Error loading organization:", err))
      .finally(() => setLoadingOrg(false))
  }, [orgId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !org || !userDoc) return

    setSubmitting(true)
    setError("")
    try {
      const mealsCount = Number(meals) || 0
      const amount = mealsCount * 35

      await createSponsorshipRequest({
        donorId: user.uid,
        donorName: userDoc.name,
        organizationId: org.uid,
        organizationName: org.organizationName,
        slotId: slotId,
        slotTitle: meal || undefined,
        amount,
        meals: mealsCount,
        occasion: occasion || "Other",
        message: message.trim() || undefined,
        status: "pending",
      })
      setSubmitted(true)
    } catch (err) {
      console.error("Failed to submit sponsorship request:", err)
      setError("Failed to submit request. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingOrg) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-8 text-primary" />
      </div>
    )
  }

  if (!org) {
    return (
      <div className="mx-auto max-w-xl text-center rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h2 className="text-xl font-bold text-foreground">Organization Not Found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The organization you are trying to sponsor could not be found.
        </p>
        <Button asChild className="mt-6 rounded-xl">
          <Link href="/donor/browse">Browse NGOs</Link>
        </Button>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h2 className="mt-5 text-xl font-bold text-foreground">Request Sent Successfully!</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Your sponsorship request for <strong>{org.organizationName}</strong> has been sent for approval.
          You&apos;ll be notified once the organization responds.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild className="rounded-xl">
            <Link href="/donor/dashboard">Back to Dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/donor/browse">Browse More NGOs</Link>
          </Button>
        </div>
      </div>
    )
  }

  const mealsCount = Number(meals) || 0
  const estimatedAmount = mealsCount * 35

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/donor/org/${org.uid}`}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {org.organizationName}
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <h1 className="text-xl font-bold text-foreground md:text-2xl">
            Sponsor {meal ? `${meal} ` : ""}Meals
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4 text-primary" />
            {org.organizationName}
          </p>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="occasion">Occasion</Label>
              <Select value={occasion} onValueChange={setOccasion}>
                <SelectTrigger id="occasion" className="h-11 rounded-xl">
                  <SelectValue placeholder="Select an occasion (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {["Birthday", "Anniversary", "Corporate CSR", "Memorial", "Festival", "Other"].map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="meals">Number of Meals</Label>
              <Input
                id="meals"
                type="number"
                min={1}
                value={meals}
                onChange={(e) => setMeals(e.target.value)}
                className="h-11 rounded-xl"
                placeholder="e.g. 100"
                required
              />
              <p className="text-xs text-muted-foreground">
                ₹35 per meal &middot; Estimated total: <strong>₹{estimatedAmount.toLocaleString("en-IN")}</strong>
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="message">
                Message <span className="font-normal text-muted-foreground">(Optional)</span>
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="rounded-xl"
                placeholder="I would like to sponsor meals on the occasion of my birthday."
              />
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-xl text-base"
              disabled={submitting || !user || mealsCount < 1}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Request...
                </>
              ) : (
                "Send Sponsorship Request"
              )}
            </Button>

            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5" />
              Your request will be sent to the organization for approval before payment is processed.
            </p>
          </form>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-bold text-foreground">Sponsorship Summary</h2>
          <div className="mt-4 rounded-xl border border-border p-4">
            <p className="font-semibold text-foreground">{org.organizationName}</p>
            <p className="text-xs text-muted-foreground">{org.city}{org.city && org.state ? ", " : ""}{org.state}</p>
            <p className="mt-1 text-xs text-muted-foreground">{org.category}</p>
          </div>

          <ul className="mt-4 flex flex-col gap-3 text-sm">
            {meal && (
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Utensils className="h-4 w-4 text-primary" />Meal Type
                </span>
                <span className="font-semibold text-foreground">{meal}</span>
              </li>
            )}
            {date && (
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4 text-primary" />Date
                </span>
                <span className="font-semibold text-foreground">{date}</span>
              </li>
            )}
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Meals</span>
              <span className="font-semibold text-foreground">{mealsCount}</span>
            </li>
            <li className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-muted-foreground">Estimated Total</span>
              <span className="text-lg font-bold text-primary">
                ₹{estimatedAmount.toLocaleString("en-IN")}
              </span>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  )
}
