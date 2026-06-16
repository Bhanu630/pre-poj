import { Suspense } from "react"
import { SponsorForm } from "@/components/donor/sponsor-form"

export default function SponsorPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted" />}>
      <SponsorForm />
    </Suspense>
  )
}
