"use client"

import { useState, useEffect } from "react"
import { Camera, Bell, Mail, Globe } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/lib/auth-context"
import { updateUser } from "@/lib/firestore"
import { Button } from "@/components/ui/button"

const fieldClass =
  "w-full rounded-xl border border-gray-200 px-4 py-2.5 focus-visible:ring-2 focus-visible:ring-blue-500"

function ProfileTab() {
  const { user, userDoc } = useAuth()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (userDoc) {
      setName(userDoc.name || "")
      setPhone(userDoc.phone || "")
    }
  }, [userDoc])

  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "D"

  const handleSave = async () => {
    if (!user?.uid) return
    setSaving(true)
    try {
      await updateUser(user.uid, { name: name.trim(), phone: phone.trim() })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error("Settings update failed:", err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-5 border-b border-gray-100 pb-6">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="bg-blue-700 text-2xl font-semibold text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <button className="inline-flex items-center gap-2 rounded-xl border-2 border-blue-700 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50">
            <Camera className="h-4 w-4" />
            Change Photo
          </button>
          <p className="mt-2 text-xs text-gray-400">JPG or PNG, recommended 400x400px.</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="fullName" className="mb-1 text-sm font-medium text-gray-700">Full Name</Label>
          <Input id="fullName" value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
        </div>
        <div>
          <Label htmlFor="email" className="mb-1 text-sm font-medium text-gray-700">Email</Label>
          <Input id="email" type="email" value={userDoc?.email || ""} disabled className={fieldClass + " opacity-60 cursor-not-allowed"} />
        </div>
        <div>
          <Label htmlFor="phone" className="mb-1 text-sm font-medium text-gray-700">Phone</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={fieldClass} />
        </div>
      </div>

      <div className="mt-6">
        <Button onClick={handleSave} disabled={saving} className="rounded-xl">
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}

function NotificationsTab() {
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [donationUpdates, setDonationUpdates] = useState(true)
  const [newsletter, setNewsletter] = useState(false)

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="font-semibold text-gray-900">Notification Preferences</h3>
      <div className="mt-5 flex flex-col gap-5">
        <ToggleRow
          icon={Bell}
          label="Email Alerts"
          description="Get email notifications for donation updates"
          checked={emailAlerts}
          onCheckedChange={setEmailAlerts}
        />
        <ToggleRow
          icon={Mail}
          label="Donation Updates"
          description="Receive updates when your donation is approved or completed"
          checked={donationUpdates}
          onCheckedChange={setDonationUpdates}
        />
        <ToggleRow
          icon={Globe}
          label="Newsletter"
          description="Receive monthly impact reports and stories"
          checked={newsletter}
          onCheckedChange={setNewsletter}
        />
      </div>
    </div>
  )
}

function ToggleRow({
  icon: Icon,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  icon: any
  label: string
  description: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">Settings</h1>
      <p className="mt-1 text-sm text-gray-500">Manage your account preferences and notification settings.</p>

      <Tabs defaultValue="profile" className="mt-6">
        <TabsList className="mb-6 flex h-auto w-full rounded-xl bg-gray-100 p-1">
          <TabsTrigger value="profile" className="flex-1 rounded-lg py-2 text-sm">Profile</TabsTrigger>
          <TabsTrigger value="notifications" className="flex-1 rounded-lg py-2 text-sm">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="profile"><ProfileTab /></TabsContent>
        <TabsContent value="notifications"><NotificationsTab /></TabsContent>
      </Tabs>
    </div>
  )
}
