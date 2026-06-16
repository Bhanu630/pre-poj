import { MapPin, BadgeCheck, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

const organizations = [
  {
    name: "BrightFutures Education Fund",
    category: "Education",
    location: "Nairobi, Kenya",
    image: "/images/org-education.png",
    description:
      "Providing books, classrooms, and scholarships to children in underserved communities.",
    raised: 184500,
    goal: 250000,
    badge: "Approved",
  },
  {
    name: "PureWater Initiative",
    category: "Clean Water",
    location: "Rajasthan, India",
    image: "/images/org-water.png",
    description:
      "Building wells and water systems to deliver safe drinking water to rural villages.",
    raised: 96200,
    goal: 120000,
    badge: "Approved",
  },
  {
    name: "CareReach Health Mission",
    category: "Healthcare",
    location: "Lagos, Nigeria",
    image: "/images/org-health.png",
    description:
      "Mobile clinics bringing vaccinations and maternal care to families without access.",
    raised: 142800,
    goal: 200000,
    badge: "Approved",
  },
]

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n)
}

export function FeaturedOrganizations() {
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
        {organizations.map((org) => {
          const pct = Math.round((org.raised / org.goal) * 100)
          return (
            <article
              key={org.name}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <div className="relative h-44 w-full overflow-hidden">
                <img
                  src={org.image || "/placeholder.svg"}
                  alt={org.name}
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-3 top-3 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold text-primary backdrop-blur">
                  {org.category}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold leading-snug text-foreground">{org.name}</h3>
                  <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    {org.badge}
                  </span>
                </div>

                <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {org.location}
                </p>

                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {org.description}
                </p>

                <div className="mt-4">
                  <Progress value={pct} className="h-2" />
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="font-bold text-foreground">{formatCurrency(org.raised)}</span>
                    <span className="text-muted-foreground">{pct}% of {formatCurrency(org.goal)}</span>
                  </div>
                </div>

                <Button className="mt-4 w-full rounded-xl bg-primary font-medium text-primary-foreground hover:bg-primary/90">
                  Donate
                </Button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
