"use client"

import { useCallback, useEffect, useState } from "react"
import { User, ShieldCheck, Save, Lock, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { getOrganization, upsertOrganization, type OrganizationDoc } from "@/lib/firestore"
import { logoutUser } from "@/lib/auth"
import { Spinner } from "@/components/ui/spinner"

type Tab = "profile" | "security"

const tabs: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: ShieldCheck },
]

const inputClass =
  "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-gray-700">
      {children}
    </label>
  )
}

export function OrgSettings() {
  const [active, setActive] = useState<Tab>("profile")

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-600">Manage your organization account and preferences.</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-gray-100 bg-white p-1.5 shadow-sm">
        {tabs.map((t) => {
          const isActive = active === t.id
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive ? "bg-blue-700 text-white" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:p-8">
        {active === "profile" && <ProfileTab />}
        {active === "security" && <SecurityTab />}
      </div>

      <LogoutSection />
    </div>
  )
}

function ProfileTab() {
  const { user } = useAuth()
  const [draft, setDraft] = useState<Partial<OrganizationDoc>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user?.uid) return
    getOrganization(user.uid)
      .then((data) => setDraft(data || {}))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user?.uid])

  const update = (key: keyof OrganizationDoc, value: any) =>
    setDraft((d) => ({ ...d, [key]: value }))

  const handleSave = async () => {
    if (!user?.uid) return
    setSaving(true)
    try {
      await upsertOrganization(user.uid, draft)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error("Failed to save:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner className="size-6" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">Organization Details</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="orgName">Organization Name</FieldLabel>
          <input id="orgName" value={draft.name || ""} onChange={(e) => update("name", e.target.value)} className={inputClass} />
        </div>
        <div>
          <FieldLabel htmlFor="category">Category</FieldLabel>
          <input id="category" value={draft.category || ""} onChange={(e) => update("category", e.target.value)} className={inputClass} />
        </div>
        <div>
          <FieldLabel htmlFor="city">City</FieldLabel>
          <input id="city" value={draft.city || ""} onChange={(e) => update("city", e.target.value)} className={inputClass} />
        </div>
        <div>
          <FieldLabel htmlFor="state">State</FieldLabel>
          <input id="state" value={draft.state || ""} onChange={(e) => update("state", e.target.value)} className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <textarea id="description" rows={4} value={draft.description || ""} onChange={(e) => update("description", e.target.value)} className={`${inputClass} leading-relaxed`} />
        </div>
        <div>
          <FieldLabel htmlFor="founded">Founded Year</FieldLabel>
          <input id="founded" type="number" value={draft.founded || ""} onChange={(e) => update("founded", Number(e.target.value))} className={inputClass} />
        </div>
        <div>
          <FieldLabel htmlFor="beneficiaries">Beneficiaries</FieldLabel>
          <input id="beneficiaries" type="number" value={draft.beneficiaries || ""} onChange={(e) => update("beneficiaries", Number(e.target.value))} className={inputClass} />
        </div>
        <div>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <input id="email" type="email" value={draft.email || ""} onChange={(e) => update("email", e.target.value)} className={inputClass} />
        </div>
        <div>
          <FieldLabel htmlFor="phone">Phone</FieldLabel>
          <input id="phone" value={draft.phone || ""} onChange={(e) => update("phone", e.target.value)} className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel htmlFor="website">Website</FieldLabel>
          <input id="website" value={draft.website || ""} onChange={(e) => update("website", e.target.value)} className={inputClass} />
        </div>
      </div>
      <div className="flex justify-end border-t border-gray-100 pt-6">
        <button type="button" onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-800 disabled:opacity-60">
          <Save className="h-4 w-4" />
          {saved ? "Saved!" : saving ? "Saving…" : "Update Details"}
        </button>
      </div>
    </div>
  )
}

function SecurityTab() {
  return (
    <form className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
      <div className="max-w-md space-y-5">
        <div>
          <FieldLabel htmlFor="current">Current Password</FieldLabel>
          <input id="current" type="password" placeholder="Enter current password" className={inputClass} />
        </div>
        <div>
          <FieldLabel htmlFor="new">New Password</FieldLabel>
          <input id="new" type="password" placeholder="Enter new password" className={inputClass} />
        </div>
        <div>
          <FieldLabel htmlFor="confirm">Confirm New Password</FieldLabel>
          <input id="confirm" type="password" placeholder="Re-enter new password" className={inputClass} />
          <p className="mt-1 text-xs text-gray-400">Use at least 8 characters with a mix of letters and numbers.</p>
        </div>
      </div>
      <div className="flex justify-start border-t border-gray-100 pt-6">
        <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-800">
          <Lock className="h-4 w-4" />
          Update Password
        </button>
      </div>
    </form>
  )
}

function LogoutSection() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logoutUser()
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-red-100 bg-white p-6 shadow-sm lg:p-8">
      <h2 className="text-lg font-bold text-gray-900">Logout</h2>
      <p className="mt-1 text-sm text-gray-600">Sign out of your organization account.</p>
      <div className="mt-4">
        <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl border-2 border-red-200 px-6 py-2.5 font-medium text-red-600 transition-colors hover:bg-red-50">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  )
}
