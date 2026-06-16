"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, Mail, Lock, Eye, EyeOff, HandHeart, Building2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { registerUser } from "@/lib/auth"
import type { UserRole } from "@/lib/firestore"

const roles = [
  { id: "donor", label: "I'm a Donor", desc: "Support causes you care about", icon: HandHeart },
  { id: "organization", label: "I'm an Organization", desc: "Raise funds for your mission", icon: Building2 },
] as const

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  )
}

export function RegisterForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<(typeof roles)[number]["id"]>("donor")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await registerUser(email, password, role as UserRole, name)
      router.push(role === "organization" ? "/org/dashboard" : "/donor/dashboard")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create account. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full gap-2.5 rounded-xl border-2 text-sm font-semibold text-foreground hover:bg-accent"
      >
        <GoogleIcon />
        Sign up with Google
      </Button>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground">or sign up with email</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* Role selector */}
      <div className="grid grid-cols-2 gap-3">
        {roles.map((r) => {
          const active = role === r.id
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id)}
              disabled={loading}
              className={cn(
                "relative flex flex-col gap-2 rounded-xl border-2 p-4 text-left transition-colors",
                active ? "border-primary bg-accent" : "border-border bg-card hover:border-primary/40",
              )}
              aria-pressed={active}
            >
              {active && (
                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3 w-3" />
                </span>
              )}
              <r.icon className={cn("h-6 w-6", active ? "text-primary" : "text-muted-foreground")} />
              <span className="text-sm font-semibold text-foreground">{r.label}</span>
              <span className="text-xs leading-snug text-muted-foreground">{r.desc}</span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="name" className="text-sm font-medium text-foreground">
          {role === "organization" ? "Organization name" : "Full name"}
        </Label>
        <div className="relative">
          {role === "organization" ? (
            <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          ) : (
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          )}
          <Input
            id="name"
            type="text"
            placeholder={role === "organization" ? "Clean Water Initiative" : "Amelia Parker"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 rounded-xl pl-10"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="reg-email" className="text-sm font-medium text-foreground">
          Email address
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="reg-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-xl pl-10"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="reg-password" className="text-sm font-medium text-foreground">
          Password
        </Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="reg-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 rounded-xl px-10"
            required
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Must be at least 8 characters.</p>
      </div>

      <div className="flex items-start gap-2">
        <Checkbox id="terms" className="mt-0.5" required />
        <Label htmlFor="terms" className="text-sm font-normal leading-snug text-muted-foreground">
          I agree to the{" "}
          <Link href="#" className="font-medium text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="font-medium text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </Label>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="h-11 w-full rounded-xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
      >
        {loading ? <Spinner className="size-5 text-primary-foreground" /> : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
