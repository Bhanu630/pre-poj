"use client"

import { useEffect, useState } from "react"
import { Camera, HandCoins, HeartHandshake, Building2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { updateUser, getDonorDonations, getOrganizations } from "@/lib/firestore"
import { Spinner } from "@/components/ui/spinner"

export function DonorProfile() {
  const { user, userDoc } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [statsLoading, setStatsLoading] = useState(true)
  const [totalDonations, setTotalDonations] = useState(0)
  const [livesImpacted, setLivesImpacted] = useState(0)
  const [orgsSupported, setOrgsSupported] = useState(0)

  // Load profile fields from userDoc
  useEffect(() => {
    if (userDoc) {
      setName(userDoc.name || "")
      setEmail(userDoc.email || "")
      setPhone(userDoc.phone || "")
    }
  }, [userDoc])

  // Load real stats
  useEffect(() => {
    if (!user?.uid) return
    async function loadStats() {
      setStatsLoading(true)
      try {
        const donations = await getDonorDonations(user!.uid)
        const approvedDonations = donations.filter(d => d.status === "Approved" || d.status === "Completed")
        const total = approvedDonations.reduce((sum, d) => sum + d.amount, 0)
        const uniqueOrgs = new Set(donations.map(d => d.organizationId)).size
        setTotalDonations(total)
        setLivesImpacted(donations.length * 45)
        setOrgsSupported(uniqueOrgs)
      } catch (err) {
        console.error("Failed to load profile stats:", err)
      } finally {
        setStatsLoading(false)
      }
    }
    loadStats()
  }, [user?.uid])

  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "D"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.uid) return
    setSaving(true)
    try {
      await updateUser(user.uid, { name: name.trim(), phone: phone.trim() })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error("Profile update failed:", err)
    } finally {
      setSaving(false)
    }
  }

  const stats = [
    { label: "Total Donations", value: `₹${totalDonations.toLocaleString("en-IN")}`, icon: HandCoins, color: "text-primary", bg: "bg-blue-50" },
    { label: "Lives Impacted", value: `${livesImpacted}+`, icon: HeartHandshake, color: "text-green-600", bg: "bg-green-50" },
    { label: "Orgs Supported", value: String(orgsSupported), icon: Building2, color: "text-purple-600", bg: "bg-purple-50" },
  ]

  const memberSince = userDoc?.createdAt
    ? new Date(userDoc.createdAt.toDate()).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "—"

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">My Profile</h1>

      {/* Profile card */}
      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="group relative">
            <span className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-primary">
              {initials}
            </span>
            <button
              type="button"
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Change photo"
            >
              <Camera className="h-6 w-6" />
            </button>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-foreground">{name || "Donor"}</h2>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
            Active Donor
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statsLoading ? (
          <div className="sm:col-span-3 flex justify-center py-8"><Spinner /></div>
        ) : (
          stats.map((s) => {
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
          })
        )}
      </div>

      {/* Edit form */}
      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <h3 className="text-lg font-semibold text-foreground">Edit Profile</h3>
        <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="rounded-xl opacity-60 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>
          <div>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : saved ? "Saved!" : "Update Profile"}
            </Button>
          </div>
        </form>

        {/* Account info */}
        <div className="mt-6 rounded-xl bg-gray-50 p-4">
          <h4 className="text-sm font-semibold text-foreground">Account Information</h4>
          <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between sm:flex-col sm:items-start sm:gap-0.5">
              <dt className="text-sm text-muted-foreground">Member Since</dt>
              <dd className="text-sm font-medium text-foreground">{memberSince}</dd>
            </div>
            <div className="flex items-center justify-between sm:flex-col sm:items-start sm:gap-0.5">
              <dt className="text-sm text-muted-foreground">Donor ID</dt>
              <dd className="text-sm font-medium text-foreground">{user?.uid?.slice(0, 10).toUpperCase() || "—"}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
