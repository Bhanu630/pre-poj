"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Pencil,
  BadgeCheck,
  MapPin,
  Users,
  CalendarDays,
  Mail,
  Phone,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Save,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getOrganization, upsertOrganization, type OrganizationDoc } from "@/lib/firestore"
import { Spinner } from "@/components/ui/spinner"

const socials = [
  { label: "Facebook", icon: Facebook },
  { label: "Twitter", icon: Twitter },
  { label: "Instagram", icon: Instagram },
  { label: "LinkedIn", icon: Linkedin },
]

export function OrgProfile() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [data, setData] = useState<OrganizationDoc | null>(null)
  const [draft, setDraft] = useState<Partial<OrganizationDoc>>({})

  const loadProfile = useCallback(async () => {
    if (!user?.uid) return

    setLoading(true)
    try {
      const org = await getOrganization(user.uid)
      setData(org)
      setDraft(org || {})
    } catch (error) {
      console.error("Failed to load organization profile:", error)
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const startEdit = () => {
    setDraft(data || {})
    setEditing(true)
  }

  const save = async () => {
    if (!user?.uid || !draft) return
    try {
      await upsertOrganization(user.uid, draft)
      setData({ ...data, ...draft } as OrganizationDoc)
      setEditing(false)
    } catch (error) {
      console.error("Failed to update profile:", error)
    }
  }

  const update = (key: keyof OrganizationDoc, value: any) =>
    setDraft((d) => ({ ...d, [key]: value }))

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl p-6 lg:p-8 text-center">
        <p className="text-gray-500">Profile not found. Please complete your registration.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/org/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        {editing ? (
          <button
            onClick={save}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-800"
          >
            <Save className="h-4 w-4" />
            Update Details
          </button>
        ) : (
          <button
            onClick={startEdit}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-blue-700 px-6 py-2.5 font-medium text-blue-700 transition-colors hover:bg-blue-50"
          >
            <Pencil className="h-4 w-4" />
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Hero card */}
          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
            <div className="relative h-56 w-full sm:h-72">
              <img
                src="/images/hope-foundation.png"
                alt="Organization cover"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-3">
                {editing ? (
                  <input
                    value={draft.name || ""}
                    onChange={(e) => update("name", e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-2xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto"
                    placeholder="Organization Name"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-gray-900">{data.name}</h1>
                )}
                {data.verified && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Registered Organization
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                {editing ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      value={draft.city || ""}
                      onChange={(e) => update("city", e.target.value)}
                      placeholder="City"
                      className="w-1/2 rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      value={draft.state || ""}
                      onChange={(e) => update("state", e.target.value)}
                      placeholder="State"
                      className="w-1/2 rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ) : (
                  <span>{data.city}, {data.state}</span>
                )}
              </div>

              <div className="mt-4">
                {editing ? (
                  <textarea
                    value={draft.description || ""}
                    onChange={(e) => update("description", e.target.value)}
                    rows={6}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 leading-relaxed text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="About the organization..."
                  />
                ) : (
                  <p className="leading-relaxed text-gray-600">{data.description}</p>
                )}
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Users className="h-5 w-5" />
                    {editing ? (
                      <input
                        type="number"
                        value={draft.beneficiaries || 0}
                        onChange={(e) => update("beneficiaries", Number(e.target.value))}
                        className="w-24 rounded-lg border border-gray-200 px-2 py-1 text-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-gray-900">{data.beneficiaries || 0}</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Beneficiaries</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-blue-700">
                    <CalendarDays className="h-5 w-5" />
                    {editing ? (
                      <input
                        type="number"
                        value={draft.founded || 0}
                        onChange={(e) => update("founded", Number(e.target.value))}
                        className="w-24 rounded-lg border border-gray-200 px-2 py-1 text-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-gray-900">{data.founded || "—"}</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Founded</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar column */}
        <div className="space-y-6">
          {/* Contact */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Contact</h2>
            <div className="space-y-4">
              <ContactRow
                icon={Mail}
                label="Email"
                value={data.email || ""}
                editing={editing}
                draftValue={draft.email || ""}
                onChange={(v) => update("email", v)}
                href={`mailto:${data.email}`}
              />
              <ContactRow
                icon={Phone}
                label="Phone"
                value={data.phone || ""}
                editing={editing}
                draftValue={draft.phone || ""}
                onChange={(v) => update("phone", v)}
                href={`tel:${data.phone?.replace(/\s/g, "")}`}
              />
              <ContactRow
                icon={Globe}
                label="Website"
                value={data.website || ""}
                editing={editing}
                draftValue={draft.website || ""}
                onChange={(v) => update("website", v)}
                href={`https://${data.website}`}
              />
            </div>
          </section>

          {/* Social */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Follow Us</h2>
            <div className="grid grid-cols-4 gap-3">
              {socials.map(({ label, icon: Icon }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex aspect-square items-center justify-center rounded-xl bg-slate-50 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-700"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function ContactRow({
  icon: Icon,
  label,
  value,
  editing,
  draftValue,
  onChange,
  href,
}: {
  icon: any
  label: string
  value: string
  editing: boolean
  draftValue: string
  onChange: (v: string) => void
  href: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400">{label}</p>
        {editing ? (
          <input
            value={draftValue}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <a href={href} className="block truncate text-sm font-medium text-gray-900 hover:text-blue-700">
            {value || "Not provided"}
          </a>
        )}
      </div>
    </div>
  )
}
