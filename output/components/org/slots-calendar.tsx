"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Plus, X, Clock, CalendarDays, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/lib/auth-context"
import { addSlot, deleteSlot, getMySlots, type SlotDoc } from "@/lib/firestore"

type Meals = { breakfast: number; lunch: number; dinner: number }

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function parseIsoDate(date: string) {
  const [year, month, day] = date.split("-").map(Number)
  return { year, month, day }
}

function computeSlotStatus(sponsored: number, totalNeeded: number): SlotDoc["status"] {
  if (totalNeeded > 0 && sponsored >= totalNeeded) return "Full"
  if (sponsored > 0) return "Partially Filled"
  return "Available"
}

function slotsToDayMap(slots: SlotDoc[], year: number, month: number): Record<number, Meals> {
  const map: Record<number, Meals> = {}

  for (const slot of slots) {
    const { year: slotYear, month: slotMonth, day } = parseIsoDate(slot.date)
    if (slotYear !== year || slotMonth !== month) continue

    if (!map[day]) map[day] = { breakfast: 0, lunch: 0, dinner: 0 }

    if (slot.mealType === "Breakfast") map[day].breakfast += slot.totalNeeded
    else if (slot.mealType === "Dinner") map[day].dinner += slot.totalNeeded
    else map[day].lunch += slot.totalNeeded
  }

  return map
}

function statusBadgeClass(status: SlotDoc["status"]) {
  switch (status) {
    case "Full":
      return "bg-green-100 text-green-700"
    case "Partially Filled":
      return "bg-amber-100 text-amber-700"
    default:
      return "bg-blue-100 text-blue-700"
  }
}

function todayIso() {
  const now = new Date()
  return toIsoDate(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

export function SlotsCalendar() {
  const { user } = useAuth()
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1)
  const [slots, setSlots] = useState<SlotDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({
    date: todayIso(),
    mealType: "Lunch" as NonNullable<SlotDoc["mealType"]>,
    totalNeeded: "",
    description: "",
  })

  const loadSlots = useCallback(async () => {
    if (!user?.uid) {
      setSlots([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const data = await getMySlots(user.uid)
      setSlots(data)
    } catch (error) {
      console.error("Failed to load slots:", error)
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  useEffect(() => {
    loadSlots()
  }, [loadSlots])

  const daysInMonth = useMemo(
    () => new Date(viewYear, viewMonth, 0).getDate(),
    [viewYear, viewMonth],
  )

  const leadingBlanks = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay()
    return firstDay === 0 ? 6 : firstDay - 1
  }, [viewYear, viewMonth])

  const today = useMemo(() => parseIsoDate(todayIso()), [])

  const slotData = useMemo(
    () => slotsToDayMap(slots, viewYear, viewMonth),
    [slots, viewYear, viewMonth],
  )

  const cells: (number | null)[] = useMemo(
    () => [
      ...Array(leadingBlanks).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ],
    [leadingBlanks, daysInMonth],
  )

  const selectedDaySlots = useMemo(() => {
    if (!selectedDate) return []
    return slots.filter((slot) => slot.date === selectedDate)
  }, [slots, selectedDate])

  const selectedDaySummary = useMemo(() => {
    const totals = selectedDaySlots.reduce(
      (acc, slot) => {
        acc.sponsored += slot.sponsored
        acc.totalNeeded += slot.totalNeeded
        return acc
      },
      { sponsored: 0, totalNeeded: 0 },
    )
    const percent =
      totals.totalNeeded > 0 ? Math.round((totals.sponsored / totals.totalNeeded) * 100) : 0
    return { ...totals, percent }
  }, [selectedDaySlots])

  function openAdd() {
    setForm({
      date: selectedDate ?? todayIso(),
      mealType: "Lunch",
      totalNeeded: "",
      description: "",
    })
    setAddOpen(true)
  }

  async function handleDelete(slotId: string) {
    try {
      await deleteSlot(slotId)
      await loadSlots()
    } catch (error) {
      console.error("Failed to delete slot:", error)
    }
  }

  async function handleSave() {
    if (!user?.uid) return

    const totalNeeded = form.totalNeeded === "" ? 0 : Number(form.totalNeeded)
    const sponsored = 0
    const status = computeSlotStatus(sponsored, totalNeeded)
    const title = `${form.mealType} · ${form.date}`

    setSaving(true)
    try {
      await addSlot({
        organizationId: user.uid,
        title,
        description: form.description.trim() || "",
        date: form.date,
        mealType: form.mealType,
        totalNeeded,
        sponsored,
        status,
      })
      setAddOpen(false)
      await loadSlots()
    } catch (error) {
      console.error("Failed to add slot:", error)
    } finally {
      setSaving(false)
    }
  }

  function selectDay(day: number) {
    setSelectedDate(toIsoDate(viewYear, viewMonth, day))
  }

  const selectedDayLabel = selectedDate
    ? (() => {
        const { day } = parseIsoDate(selectedDate)
        return `${day} ${monthNames[viewMonth - 1]} ${viewYear}`
      })()
    : ""

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Sponsorship Slots</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {monthNames[viewMonth - 1]} {viewYear} · Manage meal sponsorship availability
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Slot
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner className="size-8" />
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => {
                    if (viewMonth === 1) {
                      setViewYear((y) => y - 1)
                      setViewMonth(12)
                    } else {
                      setViewMonth((m) => m - 1)
                    }
                    setSelectedDate(null)
                  }}
                >
                  Prev
                </Button>
                <span className="text-sm font-medium text-foreground">
                  {monthNames[viewMonth - 1]} {viewYear}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => {
                    if (viewMonth === 12) {
                      setViewYear((y) => y + 1)
                      setViewMonth(1)
                    } else {
                      setViewMonth((m) => m + 1)
                    }
                    setSelectedDate(null)
                  }}
                >
                  Next
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {weekdays.map((d) => (
                  <div key={d} className="pb-2 text-center text-xs font-semibold uppercase text-muted-foreground">
                    {d}
                  </div>
                ))}
                {cells.map((day, idx) => {
                  if (day === null) return <div key={`blank-${idx}`} className="aspect-square" />
                  const meals = slotData[day]
                  const dateKey = toIsoDate(viewYear, viewMonth, day)
                  const isToday =
                    today.year === viewYear && today.month === viewMonth && today.day === day
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => selectDay(day)}
                      className={cn(
                        "flex aspect-square flex-col rounded-xl border border-gray-100 p-1.5 text-left transition-colors hover:border-primary/40 hover:bg-blue-50/50 sm:p-2",
                        selectedDate === dateKey && "border-primary ring-1 ring-primary",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                          isToday ? "bg-primary text-primary-foreground" : "text-foreground",
                        )}
                      >
                        {day}
                      </span>
                      {meals && (
                        <div className="mt-auto flex flex-col gap-0.5 text-[10px] sm:text-xs">
                          {meals.breakfast > 0 && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              {meals.breakfast}
                            </span>
                          )}
                          {meals.lunch > 0 && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              {meals.lunch}
                            </span>
                          )}
                          {meals.dinner > 0 && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <span className="h-1.5 w-1.5 rounded-full bg-purple-600" />
                              {meals.dinner}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Partially Filled
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Filled
                </span>
                <span className="ml-auto flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Breakfast
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Lunch
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-purple-600" /> Dinner
                  </span>
                </span>
              </div>
            </>
          )}
        </div>

        {selectedDate !== null && (
          <div className="w-full shrink-0 rounded-2xl border border-gray-100 bg-white shadow-sm lg:w-80">
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
              <h2 className="font-semibold text-foreground">{selectedDayLabel}</h2>
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-gray-50 hover:text-foreground"
                aria-label="Close panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="border-b border-gray-100 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">
                  {selectedDaySummary.sponsored}/{selectedDaySummary.totalNeeded || 0} Meals Sponsored
                </span>
                <span className="text-muted-foreground">{selectedDaySummary.percent}%</span>
              </div>
              <Progress value={selectedDaySummary.percent} className="mt-2 h-2 [&>div]:bg-green-500" />
            </div>

            <div className="max-h-[480px] space-y-3 overflow-y-auto p-4">
              {selectedDaySlots.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No slots for this day. Add one to open it for sponsorship.
                </p>
              ) : (
                selectedDaySlots.map((slot) => (
                  <div key={slot.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-semibold text-foreground">{slot.title}</p>
                          <Badge
                            variant="secondary"
                            className={cn("rounded-full text-[10px]", statusBadgeClass(slot.status))}
                          >
                            {slot.status}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {slot.mealType ?? "Lunch"} · {slot.sponsored}/{slot.totalNeeded} meals
                        </p>
                        {slot.description && (
                          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{slot.description}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => slot.id && handleDelete(slot.id)}
                        disabled={!slot.id}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-danger disabled:opacity-50"
                        aria-label={`Delete ${slot.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Sponsorship Slot</DialogTitle>
            <DialogDescription>Create a new meal slot for donors to sponsor.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="slot-date">Date</Label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="slot-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="rounded-xl pl-9"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="meal-type">Meal Type</Label>
              <Select
                value={form.mealType}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, mealType: v as NonNullable<SlotDoc["mealType"]> }))
                }
              >
                <SelectTrigger id="meal-type" className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Breakfast">Breakfast</SelectItem>
                  <SelectItem value="Lunch">Lunch</SelectItem>
                  <SelectItem value="Dinner">Dinner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="total-meals">Total Meals</Label>
              <Input
                id="total-meals"
                type="number"
                min={0}
                value={form.totalNeeded}
                onChange={(e) => setForm((f) => ({ ...f, totalNeeded: e.target.value }))}
                placeholder="100"
                className="rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="slot-desc">Description (optional)</Label>
              <Textarea
                id="slot-desc"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Add any notes about this slot..."
                className="min-h-20 rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              className="gap-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleSave}
              disabled={saving}
            >
              <Clock className="h-4 w-4" />
              {saving ? "Saving..." : "Save Slot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
