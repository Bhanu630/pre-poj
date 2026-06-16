import type { Metadata } from "next"
import { DonorShell } from "@/components/dashboard/donor-shell"
import { DonorFavorites } from "@/components/donor/favorites"

export const metadata: Metadata = {
  title: "Saved Organizations — donate",
  description: "View and manage the organizations you have saved as favorites.",
}

export default function DonorFavoritesPage() {
  return (
    <DonorShell>
      <DonorFavorites />
    </DonorShell>
  )
}
