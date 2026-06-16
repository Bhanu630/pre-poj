"use client"

import { useState } from "react"
import { Camera, Bell, Mail, Globe } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"

const fieldClass =
  "w-full rounded-xl border border-gray-200 px-4 py-2.5 focus-visible:ring-2 focus-visible:ring-blue-500"

function ProfileTab() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-5 border-b border-gray-100 pb-6">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="bg-blue-700 text-2xl font-semibold text-white">
            RK
          </AvatarFallback>
        </Avatar>
        <div>
          <button className="inline-flex items-center gap-2 rounded-xl border-2 border-blue-700 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50">
            <Camera className="h-4 w-4" />
            Change Photo
          </button>
          <p className="mt-2 text-xs text-gray-400">
            JPG or PNG, recommended 400x400px.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="fullName" className="mb-1 text-sm font-medium text-gray-700">
            Full Name
          </Label>
          <Input id="fullName" defaultValue="Ramesh Kumar" className={fieldClass} />
        </div>
        <div>
          <Label htmlFor="email" className="mb-1 text-sm font-medium text-gray-700">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            defaultValue="ramesh.kumar@email.com"
            className={fieldClass}
          />
        </div>
        <div>
          <Label htmlFor="phone" className="mb-1 text-sm font-medium text-gray-700">
            Phone
          </Label>
          <Input id="phone" defaultValue="+91 98765 43210" className={fieldClass} />
        </div>
        <div>
          <Label htmlFor="city" className="mb-1 text-sm font-medium text-gray-700">
            City
          </Label>
          <Input id="city" defaultValue="Bengaluru" className={fieldClass} />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button className="rounded-xl bg-blue-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-800">
          Update Profile
        </button>
      </div>
    </div>
  )
}

function SecurityTab() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-gray-900">Change Password</h2>
      <p className="mt-1 text-sm text-gray-500">
        Keep your account secure with a strong password.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-5 md:max-w-md">
        <div>
          <Label htmlFor="current" className="mb-1 text-sm font-medium text-gray-700">
            Current Password
          </Label>
          <Input id="current" type="password" placeholder="••••••••" className={fieldClass} />
        </div>
        <div>
          <Label htmlFor="new" className="mb-1 text-sm font-medium text-gray-700">
            New Password
          </Label>
          <Input id="new" type="password" placeholder="••••••••" className={fieldClass} />
        </div>
        <div>
          <Label htmlFor="confirm" className="mb-1 text-sm font-medium text-gray-700">
            Confirm Password
          </Label>
          <Input id="confirm" type="password" placeholder="••••••••" className={fieldClass} />
        </div>
      </div>
      <div className="mt-6 flex justify-start">
        <button className="rounded-xl bg-blue-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-800">
          Update Password
        </button>
      </div>
    </div>
  )
}

const preferences = [
  {
    icon: Bell,
    title: "Push Notifications",
    desc: "Get notified when your requests are approved or completed.",
    defaultOn: true,
  },
  {
    icon: Mail,
    title: "Email Updates",
    desc: "Receive monthly impact reports and donation receipts.",
    defaultOn: true,
  },
  {
    icon: Globe,
    title: "New Opportunities",
    desc: "Alerts when partner NGOs post new requirements near you.",
    defaultOn: false,
  },
]

function PreferencesTab() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-gray-900">Notification Preferences</h2>
      <p className="mt-1 text-sm text-gray-500">
        Choose how you would like to hear from donate.org.
      </p>
      <div className="mt-6 divide-y divide-gray-100">
        {preferences.map((p) => {
          const Icon = p.icon
          return (
            <div key={p.title} className="flex items-center justify-between gap-4 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{p.title}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
                </div>
              </div>
              <Switch defaultChecked={p.defaultOn} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [tab, setTab] = useState("profile")

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-600 leading-relaxed">
          Manage your profile, security, and notification preferences.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6 flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
          {[
            { v: "profile", l: "Profile" },
            { v: "security", l: "Security" },
            { v: "preferences", l: "Preferences" },
          ].map((t) => (
            <TabsTrigger
              key={t.v}
              value={t.v}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 data-[state=active]:border-blue-700 data-[state=active]:bg-blue-700 data-[state=active]:text-white"
            >
              {t.l}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile" className="mt-0">
          <ProfileTab />
        </TabsContent>
        <TabsContent value="security" className="mt-0">
          <SecurityTab />
        </TabsContent>
        <TabsContent value="preferences" className="mt-0">
          <PreferencesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
