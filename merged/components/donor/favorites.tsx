"use client"

import { useState } from "react"
import { Heart, MapPin, Users, Calendar, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Org = {
  id: number
  name: string
  location: string
  description: string
  beneficiaries: string
  established: string
}

const savedOrgs: Org[] = [
  {
    id: 1,
    name: "Hope Foundation",
    location: "Dharavi, Mumbai",
    description:
      "Providing nutritious daily meals and education support to underprivileged children across Mumbai slums.",
    beneficiaries: "4,500",
    established: "2012",
  },
  {
    id: 2,
    name: "Bright Future NGO",
    location: "Pune, Maharashtra",
    description:
      "Empowering rural youth through vocational training, scholarships, and skill-development programs.",
    beneficiaries: "2,800",
    established: "2015",
  },
  {
    id: 3,
    name: "Helping Hands",
    location: "Thane, Maharashtra",
    description:
      "Running community kitchens and medical camps for families affected by poverty and displacement.",
    beneficiaries: "3,800",
    established: "2018",
  },
]

export function DonorFavorites() {
  const [query, setQuery] = useState("")
  const [orgs, setOrgs] = useState(savedOrgs)

  const filtered = orgs.filter(
    (o) =>
      o.name.toLowerCase().includes(query.toLowerCase()) ||
      o.location.toLowerCase().includes(query.toLowerCase()),
  )

  function unfavorite(id: number) {
    setOrgs((prev) => prev.filter((o) => o.id !== id))
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Saved Organizations</h1>

      <div className="relative mt-5 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search saved organizations..."
          className="rounded-xl pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <Heart className="h-16 w-16 text-gray-300" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            {orgs.length === 0 ? "No saved organizations yet" : "No organizations match your search"}
          </p>
          <Button asChild className="mt-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
            <a href="/#organizations">Browse Organizations</a>
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((org) => (
            <article
              key={org.id}
              className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md"
            >
              <div className="relative h-32 bg-gradient-to-br from-primary to-blue-500">
                <button
                  type="button"
                  onClick={() => unfavorite(org.id)}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-danger shadow-sm transition-transform hover:scale-105"
                  aria-label={`Remove ${org.name} from favorites`}
                >
                  <Heart className="h-4 w-4" fill="currentColor" />
                </button>
              </div>
              <div className="p-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                  Registered Organization
                </span>
                <h2 className="mt-2.5 text-lg font-bold text-foreground">{org.name}</h2>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {org.location}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{org.description}</p>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {org.beneficiaries} Beneficiaries
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Est. {org.established}
                  </span>
                </div>
                <Button className="mt-4 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                  Sponsor Now
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
