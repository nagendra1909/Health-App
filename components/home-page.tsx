"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Menu, ChefHat, Sparkles } from "lucide-react"
import HealthForm from "./health-form"
import FoodGuide from "./food-guide"
import HeroStats from "./hero-stats"
import ScoreHistory, { get7DayAverage, getYesterdayScore } from "./score-history"

export default function HomePage() {
  const [foodOpen, setFoodOpen] = useState(false)
  const [latestScore, setLatestScore] = useState<number>(0)

  // Recompute hero snapshot on mount and on history changes (simple localStorage event sync)
  const [heroSnapshot, setHeroSnapshot] = useState<{ yesterday: number | null; avg7: number | null }>({
    yesterday: null,
    avg7: null,
  })

  useEffect(() => {
    // initial
    setHeroSnapshot({ yesterday: getYesterdayScore(), avg7: get7DayAverage() })
    // listen for storage updates from other tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === "hp_history") {
        setHeroSnapshot({ yesterday: getYesterdayScore(), avg7: get7DayAverage() })
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  return (
    <main className="min-h-dvh bg-gradient-to-b from-white via-sky-50 to-fuchsia-50 text-foreground">
      {/* Top navigation - light, premium, mobile-first */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-sky-600 text-white shadow-sm">
              <Sparkles className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold text-pretty">Health Points Tracker</p>
              <p className="text-xs text-muted-foreground truncate">Small wins, every day.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="hidden sm:inline-flex bg-emerald-600/10 text-emerald-700 hover:bg-emerald-600/20"
              onClick={() => setFoodOpen(true)}
            >
              <ChefHat className="mr-2 h-4 w-4" />
              Food Info
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              aria-label="Open food info"
              onClick={() => setFoodOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero: yesterday + 7-day avg at the top as requested */}
      <section className="mx-auto w-full max-w-3xl px-4 pt-4">
        <Card className="border-0 bg-white/80 shadow-lg ring-1 ring-black/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-balance text-xl sm:text-2xl">Keep showing up. Your effort compounds.</CardTitle>
            <p className="text-sm text-muted-foreground">
              Track, improve, and celebrate progress — one premium step at a time.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <HeroStats
              title="Yesterday"
              value={heroSnapshot.yesterday ?? 0}
              subtitle="Last recorded daily score"
              color="from-amber-500 to-orange-500"
            />
            <HeroStats
              title="7‑Day Avg"
              value={heroSnapshot.avg7 ?? 0}
              subtitle="Average of last 7 saved days"
              color="from-emerald-500 to-teal-500"
            />
          </CardContent>
        </Card>
      </section>

      {/* Main content */}
      <section className="mx-auto w-full max-w-3xl px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 gap-4">
          <HealthForm onScoreChange={setLatestScore} />
          <ScoreHistory
            latestScore={latestScore}
            onAfterSave={() => {
              // Refresh hero snapshot after saving today's score
              setHeroSnapshot({ yesterday: getYesterdayScore(), avg7: get7DayAverage() })
            }}
          />
        </div>
      </section>

      {/* Mobile-friendly Food Info Sheet/Drawer */}
      {foodOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFoodOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-[92%] max-w-sm rounded-l-xl bg-background shadow-xl ring-1 ring-black/10">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-emerald-600" />
                <span className="font-medium">Food Guide</span>
              </div>
              <Button variant="ghost" size="icon" aria-label="Close food guide" onClick={() => setFoodOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="max-h-[calc(100dvh-56px)] overflow-y-auto px-4 py-3">
              <FoodGuide onClose={() => setFoodOpen(false)} compact />
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
