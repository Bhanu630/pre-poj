"use client"

import { useState } from "react"
import { User, ShieldCheck, Bell, SlidersHorizontal, Save, Lock } from "lucide-react"

type Tab = "profile" | "security" | "notifications" | "preferences"

const tabs: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
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
        {active === "notifications" && <NotificationsTab />}
        {active === "preferences" && <PreferencesTab />}
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
  return (
    <form className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">Organization Profile</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="orgName">Organization Name</Label>
          <input id="orgName" defaultValue="Hope Foundation" className={inputClass} />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <input id="location" defaultValue="Dharavi, Mumbai, Maharashtra, India" className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            rows={4}
            defaultValue="Hope Foundation is a grassroots non-profit working to end hunger and improve access to education for underprivileged children across Mumbai."
            className={`${inputClass} leading-relaxed`}
          />
        </div>
        <div>
          <Label htmlFor="founded">Founded Year</Label>
          <input id="founded" defaultValue="2012" className={inputClass} />
        </div>
        <div>
          <Label htmlFor="beneficiaries">Beneficiaries</Label>
          <input id="beneficiaries" defaultValue="4,500" className={inputClass} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <input id="email" type="email" defaultValue="contact@hopefoundation.org" className={inputClass} />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <input id="phone" defaultValue="+91 98765 43210" className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="website">Website</Label>
          <input id="website" defaultValue="www.hopefoundation.org" className={inputClass} />
        </div>
      </div>
      <div className="flex justify-end border-t border-gray-100 pt-6">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-800"
        >
          <Save className="h-4 w-4" />
          Update Details
        </button>
      </div>
    </form>
  )
}

function SecurityTab() {
  return (
    <form className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
      <div className="max-w-md space-y-5">
        <div>
          <Label htmlFor="current">Current Password</Label>
          <input id="current" type="password" placeholder="Enter current password" className={inputClass} />
        </div>
        <div>
          <Label htmlFor="new">New Password</Label>
          <input id="new" type="password" placeholder="Enter new password" className={inputClass} />
        </div>
        <div>
          <Label htmlFor="confirm">Confirm New Password</Label>
          <input id="confirm" type="password" placeholder="Re-enter new password" className={inputClass} />
          <p className="mt-1 text-xs text-gray-400">Use at least 8 characters with a mix of letters and numbers.</p>
        </div>
      </div>
      <div className="flex justify-start border-t border-gray-100 pt-6">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-800"
        >
          <Lock className="h-4 w-4" />
          Update Password
        </button>
      </div>
    </form>
  )
}

const notificationOptions = [
  { title: "New donations", desc: "Get notified when a donor contributes meals or items.", on: true },
  { title: "Weekly summary", desc: "Receive a weekly report of donations and impact.", on: true },
  { title: "New donor sign-ups", desc: "Know when a new supporter joins your cause.", on: false },
  { title: "Fundraising milestones", desc: "Alerts when a campaign reaches a goal.", on: true },
]

function NotificationsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
      <div className="divide-y divide-gray-100">
        {notificationOptions.map((opt) => (
          <Toggle key={opt.title} title={opt.title} desc={opt.desc} defaultOn={opt.on} />
        ))}
      </div>
    </div>
  )
}

function PreferencesTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">Preferences</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="language">Language</Label>
          <select id="language" className={inputClass} defaultValue="en">
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="mr">Marathi</option>
          </select>
        </div>
        <div>
          <Label htmlFor="currency">Currency</Label>
          <select id="currency" className={inputClass} defaultValue="inr">
            <option value="inr">INR (₹)</option>
            <option value="usd">USD ($)</option>
            <option value="eur">EUR (€)</option>
          </select>
        </div>
        <div>
          <Label htmlFor="timezone">Time Zone</Label>
          <select id="timezone" className={inputClass} defaultValue="ist">
            <option value="ist">IST (GMT+5:30)</option>
            <option value="utc">UTC</option>
          </select>
        </div>
        <div>
          <Label htmlFor="dateFormat">Date Format</Label>
          <select id="dateFormat" className={inputClass} defaultValue="dmy">
            <option value="dmy">DD MMM YYYY</option>
            <option value="mdy">MMM DD, YYYY</option>
          </select>
        </div>
      </div>
      <div className="divide-y divide-gray-100 border-t border-gray-100 pt-2">
        <Toggle title="Public profile" desc="Allow your organization profile to be discoverable." defaultOn />
        <Toggle title="Show impact stats" desc="Display beneficiary and meal counts publicly." defaultOn />
      </div>
      <div className="flex justify-end border-t border-gray-100 pt-6">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-800"
        >
          <Save className="h-4 w-4" />
          Save Preferences
        </button>
      </div>
    </div>
  )
}

function Toggle({ title, desc, defaultOn = false }: { title: string; desc: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={title}
        onClick={() => setOn((v) => !v)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-blue-700" : "bg-gray-200"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            on ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  )
}
