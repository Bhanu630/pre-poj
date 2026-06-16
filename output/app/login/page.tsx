import type { Metadata } from "next"
import { AuthShell } from "@/components/auth/auth-shell"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Sign In — donate",
  description: "Sign in to your donate account to manage donations and track your impact.",
}

export default function LoginPage() {
  return (
    <AuthShell heading="Welcome back" subheading="Sign in to continue supporting the causes you care about.">
      <LoginForm />
    </AuthShell>
  )
}
