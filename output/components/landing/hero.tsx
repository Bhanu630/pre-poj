import { Heart, Compass, ShieldCheck, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Copy */}
          <div className="flex flex-col">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-primary">
              <ShieldCheck className="h-4 w-4" />
              Trusted by 2,400+ verified organizations
            </span>

            <h1 className="mt-6 text-pretty text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Together we can make a difference
            </h1>

            <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Support organizations and help create a better tomorrow. donate connects generous
              donors with verified NGOs working to change lives across the world.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="gap-2 rounded-xl bg-primary px-7 text-base font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Heart className="h-5 w-5" fill="currentColor" />
                Donate Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 rounded-xl border-2 border-primary px-7 text-base font-medium text-primary hover:bg-accent"
              >
                <Compass className="h-5 w-5" />
                Explore Organizations
              </Button>
            </div>

            {/* Mini trust row */}
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <div>
                <p className="text-2xl font-extrabold text-foreground">$48M+</p>
                <p className="text-sm text-muted-foreground">Funds raised</p>
              </div>
              <div className="hidden h-10 w-px bg-border sm:block" />
              <div>
                <p className="text-2xl font-extrabold text-foreground">320K</p>
                <p className="text-sm text-muted-foreground">Active donors</p>
              </div>
              <div className="hidden h-10 w-px bg-border sm:block" />
              <div>
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-warning" fill="currentColor" />
                  <p className="text-2xl font-extrabold text-foreground">4.9</p>
                </div>
                <p className="text-sm text-muted-foreground">Donor rating</p>
              </div>
            </div>
          </div>

          {/* Illustration */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
              <img
                src="/images/ngo-hero.png"
                alt="Volunteers in blue shirts handing supplies to a smiling family at a community outreach event"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Floating impact card */}
            <div className="absolute -bottom-6 -left-4 hidden rounded-2xl border border-border bg-card p-4 shadow-md sm:flex sm:items-center sm:gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10 text-success">
                <Heart className="h-5 w-5" fill="currentColor" />
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">12,840 lives</p>
                <p className="text-xs text-muted-foreground">impacted this month</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
