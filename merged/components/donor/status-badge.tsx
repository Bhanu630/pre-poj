import { cn } from "@/lib/utils"

type Variant = "pending" | "approved" | "completed" | "available" | "partial" | "full"

const styles: Record<Variant, string> = {
  pending: "bg-warning-soft text-warning",
  approved: "bg-success-soft text-success",
  completed: "bg-info-soft text-info",
  available: "bg-success-soft text-success",
  partial: "bg-warning-soft text-warning",
  full: "bg-muted text-muted-foreground",
}

const labelMap: Record<string, Variant> = {
  Pending: "pending",
  Approved: "approved",
  Completed: "completed",
  Available: "available",
  "Partially Filled": "partial",
  Full: "full",
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const variant = labelMap[status] ?? "pending"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        styles[variant],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}
