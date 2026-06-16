import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { RoleCards } from "@/components/landing/role-cards"
import { Stats } from "@/components/landing/stats"
import { FeaturedOrganizations } from "@/components/landing/featured-organizations"
import { HowItWorks } from "@/components/landing/how-it-works"
import { ImpactChart } from "@/components/landing/impact-chart"
import { Testimonials } from "@/components/landing/testimonials"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="flex flex-col gap-20 pb-20 sm:gap-24 sm:pb-24">
        <Hero />
        <RoleCards />
        <Stats />
        <FeaturedOrganizations />
        <HowItWorks />
        <ImpactChart />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
