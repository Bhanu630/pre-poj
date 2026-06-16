import type { Metadata } from "next"
import { AuthShell } from "@/components/auth/auth-shell"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Organization Sign In — donate",
  description: "Sign in to your organization account to manage donations and track your impact.",
}

export default function OrgLoginPage() {
  return (
    <AuthShell
      heading="Welcome back, Partner"
      subheading="Sign in to manage your programs, update slots, and connect with sponsors."
    >
      <LoginForm />
    </AuthShell>
  )
}
