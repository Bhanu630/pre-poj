import { IndianRupee, HandHeart, Users } from "lucide-react"
import {
  ImpactOverTimeChart,
  TopCausesChart,
} from "@/components/donor/impact-charts"

const stats = [
  {
    label: "Total Donations",
    value: "\u20B924,500",
    sub: "Across all causes",
    icon: IndianRupee,
    bg: "bg-blue-50",
    color: "text-blue-700",
  },
  {
    label: "Donations Made",
    value: "15",
    sub: "All Time",
    icon: HandHeart,
    bg: "bg-green-50",
    color: "text-green-600",
  },
  {
    label: "Lives Impacted",
    value: "420+",
    sub: "People reached",
    icon: Users,
    bg: "bg-amber-50",
    color: "text-amber-600",
  },
]

export default function ImpactPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Your Impact</h1>
        <p className="mt-1 text-gray-600 leading-relaxed">
          A snapshot of the difference your generosity has made through
          donate.org.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">{s.label}</p>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg} ${s.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-bold text-gray-900">{s.value}</p>
              <p className="mt-1 text-xs text-gray-400">{s.sub}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900">Impact Over Time</h2>
          <p className="mb-4 text-sm text-gray-500">Meals donated per month</p>
          <ImpactOverTimeChart />
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900">Top Causes Supported</h2>
          <p className="mb-4 text-sm text-gray-500">
            Distribution of your contributions
          </p>
          <TopCausesChart />
        </div>
      </div>
    </div>
  )
}
