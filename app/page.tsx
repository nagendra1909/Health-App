"use client"

import { useEffect, useState } from "react"
import HealthForm from "@/components/health-form"
import FoodGuide from "@/components/food-guide"
import ScoreHistory, { type ScoreSnapshot } from "@/components/score-history"
import { STORAGE_KEY as VS_STORAGE_KEY } from "@/components/score-history"
import {
  Card as UICard,
  CardHeader as UICardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Menu, Info, HeartPulse, CalendarDays, BarChart2 } from "lucide-react"

export default function Page() {
  const [current, setCurrent] = useState<ScoreSnapshot | null>(null)
  const [foodOpen, setFoodOpen] = useState(false)
  const [yesterday, setYesterday] = useState<number | null>(null)
  const [avg7, setAvg7] = useState<number | null>(null)

  useEffect(() => {
    const loadStats = () => {
      try {
        const raw = localStorage.getItem(VS_STORAGE_KEY)
        const parsed: { date: string; total: number }[] = raw ? JSON.parse(raw) : []
        const sorted = [...parsed].sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0))
        const todayStr = new Date().toISOString().slice(0, 10)
        const y = sorted.find((e) => e.date < todayStr)?.total ?? null
        setYesterday(y)
        const last7 = sorted.slice(0, 7)
        setAvg7(last7.length ? Math.round(last7.reduce((s, e) => s + (e.total ?? 0), 0) / last7.length) : null)
      } catch {
        setYesterday(null)
        setAvg7(null)
      }
    }

    loadStats()

    const onStorage = (e: StorageEvent) => {
      if (e.key === VS_STORAGE_KEY) loadStats()
    }
    const onCustom = () => loadStats()
    window.addEventListener("storage", onStorage)
    window.addEventListener("vitalscore:updated", onCustom as EventListener)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("vitalscore:updated", onCustom as EventListener)
    }
  }, [])

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 md:py-8">
      <header className="mb-6 flex items-center justify-between rounded-xl border bg-background/70 px-3 py-2 backdrop-blur">
        <div className="flex items-center gap-2">
          <HeartPulse className="h-5 w-5 text-rose-500" aria-hidden />
          <span className="text-sm font-semibold tracking-tight">VitalScore</span>
        </div>

        <div className="hidden gap-2 md:flex">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={() => setFoodOpen(true)}>
            <Info className="h-4 w-4" />
            Food Info
          </Button>
        </div>

        <Sheet open={foodOpen} onOpenChange={setFoodOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setFoodOpen(true)}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[92vw] sm:w-[420px]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" /> Food Guide
              </SheetTitle>
              <SheetDescription>Quick reference on foods to focus on and to limit.</SheetDescription>
            </SheetHeader>
            <div className="mt-4">
              <FoodGuide />
            </div>
            <div className="mt-6 flex justify-end">
              <SheetClose asChild>
                <Button variant="secondary" onClick={() => setFoodOpen(false)}>
                  Close
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <UICard className="mb-8 border bg-background">
        <UICardHeader className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-pretty text-xl md:text-2xl">Daily Health Points</CardTitle>
              {/* <CardDescription className="mt-1">
                Track healthy habits in a premium, colorful interface designed for momentum.
              </CardDescription> */}
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">Consistency</Badge>
              <Badge className="bg-amber-500 text-black hover:bg-amber-600">Momentum</Badge>
              <Badge className="bg-sky-500 text-white hover:bg-sky-600">Balance</Badge>
            </div>
          </div>

          {/* <blockquote className="text-pretty text-sm md:text-base italic leading-relaxed text-muted-foreground">
            “Small, steady habits compound into remarkable health.” Keep going, one day at a time.
          </blockquote> */}

          <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <CalendarDays className="h-4 w-4 text-amber-600" />
                  Yesterday
                </span>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
              <div className="mt-1 flex items-end gap-2">
                <span className="text-3xl font-bold">{yesterday ?? 0}</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500"
                  style={{ width: `${Math.max(0, Math.min(100, yesterday ?? 0))}%` }}
                />
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <BarChart2 className="h-4 w-4 text-emerald-600" />
                  7‑Day Avg
                </span>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
              <div className="mt-1 flex items-end gap-2">
                <span className="text-3xl font-bold">{avg7 ?? 0}</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500"
                  style={{ width: `${Math.max(0, Math.min(100, avg7 ?? 0))}%` }}
                />
              </div>
            </div>
          </div>
        </UICardHeader>
        <CardContent className="pt-0">
          <div className="mt-3 flex gap-2 md:hidden">
            <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">Consistency</Badge>
            <Badge className="bg-amber-500 text-black hover:bg-amber-600">Momentum</Badge>
            <Badge className="bg-sky-500 text-white hover:bg-sky-600">Balance</Badge>
          </div>
        </CardContent>
      </UICard>

      <section className="mb-10">
        <HealthForm
          onScoreChange={(snapshot) => {
            setCurrent(snapshot)
            // Save immediately when score changes
            if (snapshot) {
              const event = new CustomEvent("vitalscore:updated")
              window.dispatchEvent(event)
            }
          }}
        />
      </section>
    </main>
  )
}
