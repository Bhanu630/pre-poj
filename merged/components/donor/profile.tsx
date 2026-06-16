"use client"

import { Camera, HandCoins, HeartHandshake, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

const stats = [
  { label: "Total Donations", value: "₹24,500", icon: HandCoins, color: "text-primary", bg: "bg-blue-50" },
  { label: "Lives Impacted", value: "420+", icon: HeartHandshake, color: "text-green-600", bg: "bg-green-50" },
  { label: "Orgs Supported", value: "6", icon: Building2, color: "text-purple-600", bg: "bg-purple-50" },
]

export function DonorProfile() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">My Profile</h1>

      {/* Profile card */}
      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="group relative">
            <span className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-primary">
              RK
            </span>
            <button
              type="button"
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Change photo"
            >
              <Camera className="h-6 w-6" />
            </button>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-foreground">Ramesh Kumar</h2>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
            Active Donor
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg} ${s.color}`}>
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Edit form */}
      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <h3 className="text-lg font-semibold text-foreground">Edit Profile</h3>
        <form className="mt-5 flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" defaultValue="Ramesh Kumar" className="rounded-xl" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="ramesh.kumar@email.com" className="rounded-xl" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" defaultValue="+91 98765 43210" className="rounded-xl" />
            </div>
          </div>
          <div>
            <Button
              type="submit"
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Update Profile
            </Button>
          </div>
        </form>

        {/* Account info */}
        <div className="mt-6 rounded-xl bg-gray-50 p-4">
          <h4 className="text-sm font-semibold text-foreground">Account Information</h4>
          <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between sm:flex-col sm:items-start sm:gap-0.5">
              <dt className="text-sm text-muted-foreground">Member Since</dt>
              <dd className="text-sm font-medium text-foreground">January 2024</dd>
            </div>
            <div className="flex items-center justify-between sm:flex-col sm:items-start sm:gap-0.5">
              <dt className="text-sm text-muted-foreground">Donor ID</dt>
              <dd className="text-sm font-medium text-foreground">DNR-2024-001</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
