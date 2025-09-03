"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TrendingUp, Save, Lightbulb, CalendarDays } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"

export type ScoreSnapshot = {
  total: number
  sleep?: number
  meals?: number
  water?: number
  walking?: number
  exercise?: number
  other?: number
}

type Entry = {
  date: string // YYYY-MM-DD
  total: number
  breakdown?: Omit<ScoreSnapshot, "total">
}

export const STORAGE_KEY = "vitalscore.entries.v1"

export default function ScoreHistory({ current, onAfterSave }: { current?: ScoreSnapshot; onAfterSave?: () => void }) {
  const [entries, setEntries] = useState<Entry[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setEntries(JSON.parse(raw))
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    } catch {
      // ignore
    }
  }, [entries])

  const today = new Date()
  const todayKey = today.toISOString().slice(0, 10)

  function saveToday() {
    if (!current) return
    setEntries((prev) => {
      const next = prev.filter((e) => e.date !== todayKey)
      next.push({
        date: todayKey,
        total: current.total,
        breakdown: {
          sleep: current.sleep,
          meals: current.meals,
          water: current.water,
          walking: current.walking,
          exercise: current.exercise,
          other: current.other,
        },
      })
      // keep sorted desc
      const sorted = next.sort((a, b) => (a.date < b.date ? 1 : -1))
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted))
        window.dispatchEvent(new Event("vitalscore:updated"))
      } catch {
        // ignore
      }
      onAfterSave?.()
      return sorted
    })
  }

  const last7 = useMemo(() => {
    const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1))
    return sorted.slice(0, 7).reverse()
  }, [entries])

  const weeklyAvg = useMemo(() => {
    if (entries.length === 0) return 0
    const recent = entries.slice(0, 7)
    const avg = recent.reduce((acc, e) => acc + e.total, 0) / Math.max(1, recent.length)
    return Math.round(avg)
  }, [entries])

  const suggestions = useMemo(() => {
    if (!current) return ["Log today’s score to begin receiving tailored suggestions."]
    const s: string[] = []
    if ((current.sleep ?? 0) < 15) s.push("Try to get closer to 8h sleep for maximum points.")
    if ((current.water ?? 0) < 12) s.push("Increase water intake toward 3L to boost hydration points.")
    if ((current.walking ?? 0) < 15) s.push("Add a short walk to approach 60 minutes total.")
    if ((current.meals ?? 0) === 0) s.push("Aim to have meals on time to secure 25 points.")
    if ((current.exercise ?? 0) === 0) s.push("Even 10–15 minutes of yoga or exercise can help.")
    if ((current.other ?? 0) < 10) s.push("Avoid junk and add a stress-relief habit for bonus points.")
    return s.length ? s : ["Great job! Maintain consistency to keep your momentum."]
  }, [current])

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>History & Insights</CardTitle>
          <CardDescription>Save your daily score, view trends, and get suggestions.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">
            <TrendingUp className="mr-1 h-3.5 w-3.5" />
            Avg {weeklyAvg}
          </Badge>
          <Badge variant="secondary" className="hidden md:inline-flex">
            <CalendarDays className="mr-1 h-3.5 w-3.5" />
            Last 7 days
          </Badge>
          <Button size="sm" onClick={saveToday} disabled={!current} className="gap-2">
            <Save className="h-4 w-4" />
            Save Today
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart */}
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7.map((e) => ({ date: e.date.slice(5), score: e.total }))}>
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="score" radius={[6, 6, 0, 0]} fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <Separator className="my-6" />

        {/* Recent list */}
        <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-2">
          {entries.slice(0, 6).map((e) => (
            <div key={e.date} className="flex items-center justify-between rounded-md border bg-card px-3 py-2 text-sm">
              <span className="text-muted-foreground">{e.date}</span>
              <span className="font-medium">{e.total}</span>
            </div>
          ))}
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No entries yet. Log today’s score to start tracking.</p>
          ) : null}
        </div>

        {/* Suggestions */}
        <div className="rounded-md border bg-card p-4">
          <div className="mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-semibold">Suggestions</p>
          </div>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
