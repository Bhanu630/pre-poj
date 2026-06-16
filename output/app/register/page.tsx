import type { Metadata } from "next"
import { AuthShell } from "@/components/auth/auth-shell"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Create Account — donate",
  description: "Create a donate account as a donor or organization and start making a difference today.",
}

export default function RegisterPage() {
  return (
    <AuthShell
      heading="Create your account"
      subheading="Join thousands of donors and organizations creating real change."
    >
      <RegisterForm />
    </AuthShell>
  )
}
