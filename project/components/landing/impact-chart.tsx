"use client"

import { TrendingUp, BarChart3 } from "lucide-react"

// The impact chart previously rendered hardcoded fake data.
// It now shows a placeholder until real aggregated analytics are available
// from Firestore (impactAnalytics collection via getImpactAnalytics()).
//
// To wire up real data:
//   1. Import getImpactAnalytics from "@/lib/firestore"
//   2. Fetch in useEffect and map to { month, donations, lives } shape
//   3. Replace <EmptyChart /> with the <AreaChart data={data} ... /> block

export function ImpactChart() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid items-center gap-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-sm font-medium text-success">
            <TrendingUp className="h-4 w-4" />
            Growing every month
          </span>
          <h2 className="mt-4 text-pretty text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Real impact, measured transparently
          </h2>
          <p className="mt-3 text-pretty text-base leading-relaxed text-muted-foreground">
            Every dollar is tracked from donation to delivery, so you always know your gift is
            creating change. Impact data will appear here as donations are completed.
          </p>
        </div>

        <div className="lg:col-span-3">
          <div className="flex h-72 w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30">
            <BarChart3 className="h-12 w-12 text-muted-foreground/30" />
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              Impact data will appear here
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Charts populate as donations are recorded
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
