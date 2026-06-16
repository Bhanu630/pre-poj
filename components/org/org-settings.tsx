"use client"

import { useEffect, useState } from "react"
import { User, ShieldCheck, Bell, SlidersHorizontal, Save, Lock } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getOrganization, upsertOrganization, type OrganizationDoc } from "@/lib/firestore"
import { Spinner } from "@/components/ui/spinner"
import { auth } from "@/lib/firebase"
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth"

const tabs = [
  { id: "profile", label: "Profile", icon: User }, 
  { id: "security", label: "Security", icon: ShieldCheck },
]

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
    </div>
  )
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-gray-700">
      {children}
    </label>
  )
}

const inputClass =
  "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"

function ProfileTab() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const [formData, setFormData] = useState({
    organizationName: "", // Changed from 'name' to 'organizationName'
    category: "",
    city: "",
    state: "",
    description: "",
    founded: "",
    beneficiaries: "",
    email: "",
    phone: "",
    website: "",
  })

  useEffect(() => {
    if (!user?.uid) return
    async function load() {
      try {
        const org = await getOrganization(user!.uid)
        if (org) {
          setFormData({
            organizationName: org.organizationName || "", // Changed from 'name' to 'organizationName'
            category: org.category || "",
            city: org.city || "",
            state: org.state || "",
            description: org.description || "",
            founded: org.founded ? String(org.founded) : "",
            beneficiaries: org.beneficiaries ? String(org.beneficiaries) : "",
            email: org.email || "",
            phone: org.phone || "",
            website: org.website || "",
          })
        }
      } catch (err) {
        console.error("Error loading settings profile:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.uid])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user?.uid) return
    setSaving(true)
    setSuccessMsg("")
    setErrorMsg("")

    try {
      await upsertOrganization(user.uid, {
        organizationName: formData.organizationName, // Changed from 'name' to 'organizationName'
        category: formData.category,
        city: formData.city,
        state: formData.state,
        description: formData.description,
        founded: formData.founded ? Number(formData.founded) : 0,
        beneficiaries: formData.beneficiaries ? Number(formData.beneficiaries) : 0,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
      })
      setSuccessMsg("Details updated successfully!")
    } catch (err) {
      console.error("Error updating settings profile:", err)
      setErrorMsg("Failed to update details. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const updateField = (key: keyof typeof formData, val: string) => {
    setFormData((prev) => ({ ...prev, [key]: val }))
  }

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner className="size-8 text-blue-700" />
      </div>
    )
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <h2 className="text-lg font-bold text-gray-900">Organization Profile</h2>

      {successMsg && (
        <div className="rounded-xl bg-green-50 p-4 text-sm font-medium text-green-800">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-800">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="orgName">Organization Name</Label>
          <input
            id="orgName"
            value={formData.organizationName}
            onChange={(e) => updateField("organizationName", e.target.value)}
            className={inputClass}
            required
            placeholder="Hope Foundation"
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <input
            id="category"
            value={formData.category}
            onChange={(e) => updateField("category", e.target.value)}
            className={inputClass}
            required
            placeholder="e.g. Food & Nutrition, Education"
          />
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <input
            id="city"
            value={formData.city}
            onChange={(e) => updateField("city", e.target.value)}
            className={inputClass}
            required
            placeholder="Mumbai"
          />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <input
            id="state"
            value={formData.state}
            onChange={(e) => updateField("state", e.target.value)}
            className={inputClass}
            required
            placeholder="Maharashtra"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            className={`${inputClass} leading-relaxed`}
            placeholder="Tell supporters about your organization's mission and programs..."
          />
        </div>
        <div>
          <Label htmlFor="founded">Founded Year</Label>
          <input
            id="founded"
            type="number"
            value={formData.founded}
            onChange={(e) => updateField("founded", e.target.value)}
            className={inputClass}
            placeholder="2012"
          />
        </div>
        <div>
          <Label htmlFor="beneficiaries">Beneficiaries Count</Label>
          <input
            id="beneficiaries"
            type="number"
            value={formData.beneficiaries}
            onChange={(e) => updateField("beneficiaries", e.target.value)}
            className={inputClass}
            placeholder="4500"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            className={inputClass}
            placeholder="contact@hopefoundation.org"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <input
            id="phone"
            value={formData.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            className={inputClass}
            placeholder="+91 98765 43210"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="website">Website</Label>
          <input
            id="website"
            value={formData.website}
            onChange={(e) => updateField("website", e.target.value)}
            className={inputClass}
            placeholder="www.hopefoundation.org"
          />
        </div>
      </div>
      <div className="flex justify-end border-t border-gray-100 pt-6">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-800 disabled:bg-blue-300"
        >
          <Save className="h-4 w-4" />
          {saving ? "Updating..." : "Update Details"}
        </button>
      </div>
    </form>
  )
}

function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSuccessMsg("")
    setErrorMsg("")

    if (newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match.")
      return
    }

    if (newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters.")
      return
    }

    setLoading(true)
    try {
      const user = auth.currentUser
      if (!user || !user.email) {
        setErrorMsg("User not found.")
        return
      }

      // Reauthenticate first
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)

      // Update password
      await updatePassword(user, newPassword)
      setSuccessMsg("Password updated successfully!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      console.error("Error updating password:", err)
      if (err.code === "auth/wrong-password") {
        setErrorMsg("Incorrect current password.")
      } else {
        setErrorMsg(err.message || "Failed to update password. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <h2 className="text-lg font-bold text-gray-900">Change Password</h2>

      {successMsg && (
        <div className="max-w-md rounded-xl bg-green-50 p-4 text-sm font-medium text-green-800">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="max-w-md rounded-xl bg-red-50 p-4 text-sm font-medium text-red-800">
          {errorMsg}
        </div>
      )}

      <div className="max-w-md space-y-5">
        <div>
          <Label htmlFor="current">Current Password</Label>
          <input
            id="current"
            type="password"
            placeholder="Enter current password"
            className={inputClass}
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="new">New Password</Label>
          <input
            id="new"
            type="password"
            placeholder="Enter new password"
            className={inputClass}
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="confirm">Confirm New Password</Label>
          <input
            id="confirm"
            type="password"
            placeholder="Re-enter new password"
            className={inputClass}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-400">Use at least 8 characters with a mix of letters and numbers.</p>
        </div>
      </div>
      <div className="flex justify-start border-t border-gray-100 pt-6">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-800 disabled:bg-blue-300"
        >
          <Lock className="h-4 w-4" />
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </form>
  )
}
