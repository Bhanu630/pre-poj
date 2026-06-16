import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PagePlaceholder({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </header>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center shadow-sm">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-primary">
          <Icon className="h-7 w-7" />
        </span>
        <h2 className="mt-5 text-lg font-bold text-foreground">This section is coming soon</h2>
        <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
          We&apos;re building out {title.toLowerCase()} for donate.org. In the meantime, explore verified NGOs and start sponsoring meals today.
        </p>
        <Button asChild className="mt-6 rounded-xl">
          <Link href="/donor/browse">
            Browse Organizations
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
