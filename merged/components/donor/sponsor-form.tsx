"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, UploadCloud, Info, CheckCircle2, Utensils, Building2, CalendarDays, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { createDonation } from "@/lib/firestore"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getOrganization, occasions } from "@/lib/donor-data"

export function SponsorForm() {
  const { user } = useAuth()
  const params = useSearchParams()
  const orgId = params.get("org") ?? ""
  const slotId = params.get("slot") ?? undefined
  const meal = params.get("meal") ?? "Lunch"
  const date = params.get("date") ?? "20 May"
  const org = getOrganization(orgId) ?? getOrganization("hope-foundation")!

  const [occasion, setOccasion] = useState("")
  const [meals, setMeals] = useState("100")
  const [message, setMessage] = useState("")
  const [fileName, setFileName] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)
    try {
      await createDonation({
        donorId: user.uid,
        organizationId: orgId || "hope-foundation",
        slotId: slotId,
        amount: Number(meals) * 35,
        occasion: occasion || "Other",
        message: message.trim(),
        status: "Pending",
      })
      setSubmitted(true)
    } catch (error) {
      console.error("Failed to create donation:", error)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h2 className="mt-5 text-xl font-bold text-foreground">Request Sent Successfully</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Your request to sponsor {meal.toLowerCase()} for {org.name} on {date} 2025 has been sent for approval.
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

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/donor/org/${org.id}`}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <h1 className="text-xl font-bold text-foreground md:text-2xl">
            Sponsor {meal} &ndash; {date} 2025
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4 text-primary" />
            {org.name}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="occasion">Occasion</Label>
              <Select value={occasion} onValueChange={setOccasion}>
                <SelectTrigger id="occasion" className="h-11 rounded-xl">
                  <SelectValue placeholder="Select an occasion" />
                </SelectTrigger>
                <SelectContent>
                  {occasions.map((o) => (
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
              />
              <p className="text-xs text-muted-foreground">Approx. ₹35 per meal &middot; Estimated ₹{(Number(meals) * 35 || 0).toLocaleString("en-IN")}</p>
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
                placeholder="I would like to sponsor lunch on the occasion of my birthday."
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="images">Add Images</Label>
              <label
                htmlFor="images"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background px-4 py-8 text-center transition-colors hover:border-primary/50"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary">
                  <UploadCloud className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium text-foreground">
                  {fileName ?? "Click to upload images"}
                </span>
                <span className="text-xs text-muted-foreground">PNG, JPG up to 5MB</span>
                <input
                  id="images"
                  type="file"
                  accept="image/png,image/jpeg"
                  className="sr-only"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
                />
              </label>
            </div>

            <Button type="submit" className="h-12 w-full rounded-xl text-base" disabled={submitting || !user}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Request"
              )}
            </Button>

            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5" />
              Your request will be sent to the organization for approval.
            </p>
          </form>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-bold text-foreground">Sponsorship Summary</h2>
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-border p-3">
            <img src={org.image || "/placeholder.svg"} alt={org.name} className="h-12 w-12 rounded-lg object-cover" />
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">{org.name}</p>
              <p className="text-xs text-muted-foreground">{org.location}</p>
            </div>
          </div>

          <ul className="mt-4 flex flex-col gap-3 text-sm">
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground"><Utensils className="h-4 w-4 text-primary" />Meal</span>
              <span className="font-semibold text-foreground">{meal}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="h-4 w-4 text-primary" />Date</span>
              <span className="font-semibold text-foreground">{date} 2025</span>
            </li>
            <li className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-muted-foreground">Estimated Total</span>
              <span className="text-lg font-bold text-primary">₹{(Number(meals) * 35 || 0).toLocaleString("en-IN")}</span>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  )
}
