import { Quote } from "lucide-react"

const testimonials = [
  {
    quote:
      "donate made it effortless to support a cause I care about. The monthly impact reports show me exactly where my money goes.",
    name: "Amara Okafor",
    role: "Monthly Donor",
    initials: "AO",
  },
  {
    quote:
      "As a small NGO, getting verified and reaching donors used to be impossible. This platform changed everything for our water projects.",
    name: "Daniel Mwangi",
    role: "Founder, PureWater Initiative",
    initials: "DM",
  },
  {
    quote:
      "Transparent, trustworthy, and genuinely easy to use. I've recommended donate to my entire family and workplace.",
    name: "Sofia Hernández",
    role: "Corporate Partner",
    initials: "SH",
  },
]

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-pretty text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Trusted by donors and organizations
        </h2>
        <p className="mt-3 text-pretty text-base leading-relaxed text-muted-foreground">
          Hear from the community making change happen every day.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure
            key={t.name}
            className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <Quote className="h-8 w-8 text-accent" fill="currentColor" />
            <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground">
              {t.quote}
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {t.initials}
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
