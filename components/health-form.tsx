"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import {
  Card as UICard,
  CardContent,
  CardHeader as UICardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Moon, Utensils, Droplets, Footprints, Dumbbell, Ban, Sparkles, Clock } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type PointsSnapshot = {
  sleep: number
  meals: number
  water: number
  walking: number
  exercise: number
  other: number
  total: number
}

export default function HealthForm({
  onScoreChange,
}: {
  onScoreChange?: (snapshot: PointsSnapshot) => void
}) {
  // Inputs
  const [sleepTime, setSleepTime] = useState<string>("10:00 PM")
  const [wakeTime, setWakeTime] = useState<string>("6:30 AM")
  const [breakfastOnTime, setBreakfastOnTime] = useState<boolean>(false)
  const [lunchOnTime, setLunchOnTime] = useState<boolean>(false)
  const [dinnerOnTime, setDinnerOnTime] = useState<boolean>(false)
  const [tabletsOnTime, setTabletsOnTime] = useState<boolean>(false)
  const [waterLiters, setWaterLiters] = useState<number>(2.5)
  const [walkingMinutes, setWalkingMinutes] = useState<number>(30)
  const [exerciseDone, setExerciseDone] = useState<boolean>(false)
  const [noJunk, setNoJunk] = useState<boolean>(false)
  const [stressManaged, setStressManaged] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  // Convert 12-hour format to 24-hour format for calculations
  const to24Hour = (time12h: string) => {
    const [time, period] = time12h.split(" ")
    let [hours, minutes] = time.split(":").map(Number)
    if (period === "PM" && hours !== 12) hours += 12
    if (period === "AM" && hours === 12) hours = 0
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
  }

  // Convert 24-hour format to 12-hour format for display
  const to12Hour = (time24h: string) => {
    const [hours24, minutes] = time24h.split(":").map(Number)
    let period = "AM"
    let hours12 = hours24
    if (hours24 >= 12) {
      period = "PM"
      hours12 = hours24 === 12 ? 12 : hours24 - 12
    }
    if (hours12 === 0) hours12 = 12
    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  // Calculate sleep hours
  const sleepHours = useMemo(() => {
    try {
      const sleep24h = to24Hour(sleepTime)
      const wake24h = to24Hour(wakeTime)
      
      let sleepDate = new Date(`2000-01-01T${sleep24h}:00`)
      let wakeDate = new Date(`2000-01-01T${wake24h}:00`)
      
      // If wake time is before sleep time, it means we slept past midnight
      if (wakeDate < sleepDate) {
        wakeDate.setDate(wakeDate.getDate() + 1)
      }
      
      return (wakeDate.getTime() - sleepDate.getTime()) / (1000 * 60 * 60)
    } catch {
      return 0
    }
  }, [sleepTime, wakeTime])

  // Points calculation (linear to target, capped to max)
  const { sleepPoints, mealsPoints, tabletsPoints, waterPoints, walkingPoints, exercisePoints, otherPoints, total } = useMemo(() => {
    // Sleep points: 15 max for 7.5+ hours
    const minSleepHours = 7.5
    // Full points for sleeping 7.5 hours or more, reduce points only for sleeping less
    const sp = Math.min(15, Math.round(Math.max(0, 15 * (sleepHours / minSleepHours))))
    
    // Anti-diabetic priorities
    // Tablets points: 20 points (highest priority)
    const tp = tabletsOnTime ? 20 : 0
    
    // Meal points: 25 total (critical for blood sugar)
    // Breakfast most important (10), then lunch (8), then dinner (7)
    const mp = (breakfastOnTime ? 10 : 0) + (lunchOnTime ? 8 : 0) + (dinnerOnTime ? 7 : 0)
    
    // Exercise points: 15 points total
    // Walking: 10 points for 45 minutes
    const wlk = Math.min(10, Math.round((Math.max(0, Math.min(walkingMinutes, 45)) / 45) * 10))
    // Additional exercise: 5 points
    const ep = exerciseDone ? 5 : 0
    
    // Water points: 15 points for 3L (important for kidney health)
    const wp = Math.min(15, Math.round((Math.max(0, Math.min(waterLiters, 3)) / 3) * 15))
    
    // Other healthy habits: 10 points total
    // No junk food (important for blood sugar): 7 points
    // Stress management: 3 points
    const op = (noJunk ? 7 : 0) + (stressManaged ? 3 : 0)

    const t = sp + tp + mp + wp + wlk + ep + op // Will total exactly 100
    return {
      sleepPoints: sp,      // 15 points
      tabletsPoints: tp,    // 20 points
      mealsPoints: mp,      // 25 points
      waterPoints: wp,      // 15 points
      walkingPoints: wlk,   // 10 points
      exercisePoints: ep,   // 5 points
      otherPoints: op,      // 10 points
      total: t,            // 100 points total
    }
  }, [sleepHours, breakfastOnTime, lunchOnTime, dinnerOnTime, waterLiters, walkingMinutes, exerciseDone, noJunk, stressManaged])

  useEffect(() => {
    const snapshot: PointsSnapshot = {
      sleep: sleepPoints,
      meals: mealsPoints,
      water: waterPoints,
      walking: walkingPoints,
      exercise: exercisePoints,
      other: otherPoints,
      total,
    }
    onScoreChange?.(snapshot)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sleepPoints, mealsPoints, waterPoints, walkingPoints, exercisePoints, otherPoints, total])

  const totalPercent = Math.min(100, Math.max(0, total))

  return (
    <div className="space-y-6">
      {/* Sleep */}
      <ColorCard icon={<Moon className="h-4 w-4 text-indigo-600" />} title="Sleep Schedule" subtitle="Target 7.5h (15 pts)">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sleep-time" className="text-sm font-medium tracking-tight">
                Bedtime
              </Label>
              <Select
                value={sleepTime}
                onValueChange={setSleepTime}
              >
                <SelectTrigger id="sleep-time" className="w-full border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-sm transition-all hover:bg-slate-50">
                  <SelectValue placeholder="Select bedtime" />
                  <Clock className="h-4 w-4 text-slate-500" />
                </SelectTrigger>
                <SelectContent>
                  <div className="grid grid-cols-1 gap-1">
                    <div className="px-2 py-1.5 text-sm font-medium text-slate-500">Evening</div>
                    {["9:00 PM", "9:30 PM", "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM"].map((time) => (
                      <SelectItem
                        key={time}
                        value={time}
                        className="transition-colors hover:bg-slate-100"
                      >
                        {time}
                      </SelectItem>
                    ))}
                    <div className="px-2 py-1.5 text-sm font-medium text-slate-500">Night</div>
                    {["12:00 AM", "12:30 AM", "1:00 AM", "1:30 AM"].map((time) => (
                      <SelectItem
                        key={time}
                        value={time}
                        className="transition-colors hover:bg-slate-100"
                      >
                        {time}
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wake-time" className="text-sm font-medium tracking-tight">
                Wake time
              </Label>
              <Select
                value={wakeTime}
                onValueChange={setWakeTime}
              >
                <SelectTrigger id="wake-time" className="w-full border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-sm transition-all hover:bg-slate-50">
                  <SelectValue placeholder="Select wake time" />
                  <Clock className="h-4 w-4 text-slate-500" />
                </SelectTrigger>
                <SelectContent>
                  <div className="grid grid-cols-1 gap-1">
                    <div className="px-2 py-1.5 text-sm font-medium text-slate-500">Early Morning</div>
                    {["4:30 AM", "5:00 AM", "5:30 AM", "6:00 AM", "6:30 AM"].map((time) => (
                      <SelectItem
                        key={time}
                        value={time}
                        className="transition-colors hover:bg-slate-100"
                      >
                        {time}
                      </SelectItem>
                    ))}
                    <div className="px-2 py-1.5 text-sm font-medium text-slate-500">Morning</div>
                    {["7:00 AM", "7:30 AM", "8:00 AM", "8:30 AM", "9:00 AM"].map((time) => (
                      <SelectItem
                        key={time}
                        value={time}
                        className="transition-colors hover:bg-slate-100"
                      >
                        {time}
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-sm text-slate-500">Total sleep duration:</span>
                <p className="text-2xl font-semibold text-indigo-600">{sleepHours.toFixed(1)}h</p>
              </div>
              <Badge 
                className={cn(
                  "px-3 py-1.5 text-xs font-medium shadow-sm ring-1",
                  sleepHours >= 7.5
                    ? "bg-gradient-to-br from-emerald-100 to-white text-emerald-700 ring-emerald-200"
                    : sleepHours >= 6
                    ? "bg-gradient-to-br from-amber-100 to-white text-amber-700 ring-amber-200"
                    : "bg-gradient-to-br from-rose-100 to-white text-rose-700 ring-rose-200"
                )}
              >
                {sleepPoints} pts
              </Badge>
            </div>
            <p className="text-sm text-slate-500 italic">
              {sleepHours >= 7.5
                ? sleepHours >= 9
                  ? "✨ Great! Extended sleep can be beneficial for recovery"
                  : "✨ Perfect! You're getting optimal sleep (7.5+ hours)"
                : sleepHours >= 6
                ? "� Try to get a bit more sleep for optimal health"
                : "⚠️ Consider getting more sleep for better health"}
            </p>
          </div>
        </div>
      </ColorCard>

      {/* Tablets on time - Highest priority */}
      <ColorCard 
        icon={<svg className="h-4 w-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 12H4" />
          <path d="M12 4v16" />
        </svg>} 
        title="Medication" 
        subtitle="Critical for health (20 pts)"
      >
        <div className="space-y-4">
          <CheckRow
            id="tablets-on-time"
            label="Took all prescribed tablets on time"
            checked={tabletsOnTime}
            onChange={setTabletsOnTime}
            chip="+20 pts"
            chipClass="bg-purple-100 text-purple-800"
          />
          <div className="mt-2">
            <p className="text-sm text-muted-foreground italic">Highest priority task for blood sugar management</p>
          </div>
        </div>
      </ColorCard>

      {/* Meals on time */}
      <ColorCard icon={<Utensils className="h-4 w-4 text-emerald-600" />} title="Meals on Time" subtitle="Important for blood sugar (25 pts)">
        <div className="space-y-4">
          <CheckRow
            id="breakfast-on-time"
            label="Had breakfast on time (7-9 AM)"
            checked={breakfastOnTime}
            onChange={setBreakfastOnTime}
            chip="+10 pts"
            chipClass="bg-emerald-100 text-emerald-800"
          />
          <CheckRow
            id="lunch-on-time"
            label="Had lunch on time (12-2 PM)"
            checked={lunchOnTime}
            onChange={setLunchOnTime}
            chip="+8 pts"
            chipClass="bg-emerald-100 text-emerald-800"
          />
          <CheckRow
            id="dinner-on-time"
            label="Had dinner on time (6-8 PM)"
            checked={dinnerOnTime}
            onChange={setDinnerOnTime}
            chip="+7 pts"
            chipClass="bg-emerald-100 text-emerald-800"
          />
          <div className="mt-2 flex justify-between items-center">
            <p className="text-sm text-muted-foreground italic">Breakfast is most important for glucose control</p>
            <Badge className="bg-gradient-to-br from-emerald-100 to-white px-3 py-1.5 text-sm font-medium text-emerald-700 shadow-sm ring-1 ring-emerald-200">
              Total: {mealsPoints}/25 pts
            </Badge>
          </div>
        </div>
      </ColorCard>

      {/* Water */}
      <ColorCard
        icon={<Droplets className="h-4 w-4 text-sky-600" />}
        title="Water Intake"
        subtitle="Important for kidney health (15 pts)"
      >
        <div className="space-y-4">
          <SliderNumber
            id="water"
            label="Water"
            min={0}
            max={5}
            step={0.25}
            value={waterLiters}
            onChange={setWaterLiters}
            suffix="L"
            accentClass="text-sky-700"
            chip={`${waterPoints}/15 pts`}
          />
          <p className="text-sm text-muted-foreground italic">Target: 3L per day for optimal hydration</p>
        </div>
      </ColorCard>

      {/* Exercise Section */}
      <ColorCard
        icon={<Dumbbell className="h-4 w-4 text-orange-600" />}
        title="Physical Activity"
        subtitle="Essential for blood sugar (15 pts)"
      >
        <div className="space-y-6">
          {/* Walking */}
          <div className="space-y-4">
            <SliderNumber
              id="walking"
              label="Walking"
              min={0}
              max={45}
              step={5}
              value={walkingMinutes}
              onChange={setWalkingMinutes}
              suffix="min"
              accentClass="text-pink-700"
              chip={`${walkingPoints}/10 pts`}
            />
            <p className="text-sm text-muted-foreground italic">Regular walking helps control blood sugar</p>
          </div>

          {/* Additional Exercise */}
          <div className="space-y-4">
            <CheckRow
              id="exercise"
              label="Additional exercise or yoga"
              checked={exerciseDone}
              onChange={setExerciseDone}
              chip={`${exercisePoints} pts`}
              chipClass="bg-orange-100 text-orange-800"
            />
            <div className="mt-2 flex justify-end">
              <Badge className="bg-gradient-to-br from-orange-100 to-white px-3 py-1.5 text-sm font-medium text-orange-700 shadow-sm ring-1 ring-orange-200">
                Total: {walkingPoints + exercisePoints}/15 pts
              </Badge>
            </div>
          </div>
        </div>
      </ColorCard>

      {/* Other Healthy Habits */}
      <ColorCard
        icon={<Sparkles className="h-4 w-4 text-fuchsia-600" />}
        title="Other Healthy Habits"
        subtitle="Supporting habits (10 pts)"
      >
        <div className="space-y-4">
          <CheckRow
            id="no-junk"
            label="No junk food today"
            checked={noJunk}
            onChange={setNoJunk}
            chip="+7 pts"
            iconAfter={<Ban className="h-4 w-4 text-fuchsia-600" />}
            chipClass="bg-fuchsia-100 text-fuchsia-800"
          />
          <CheckRow
            id="stress-mgmt"
            label="Took time for stress management"
            checked={stressManaged}
            onChange={setStressManaged}
            chip="+3 pts"
            chipClass="bg-fuchsia-100 text-fuchsia-800"
          />
          <div className="mt-2 flex justify-between items-center">
            <p className="text-sm text-muted-foreground italic">Avoiding junk food helps maintain stable blood sugar</p>
            <Badge className="bg-gradient-to-br from-fuchsia-100 to-white px-3 py-1.5 text-sm font-medium text-fuchsia-700 shadow-sm ring-1 ring-fuchsia-200">
              Total: {otherPoints}/10 pts
            </Badge>
          </div>
        </div>
      </ColorCard>

      {/* Total */}
      <UICard className="relative overflow-hidden shadow-lg border-2 border-gradient-to-r from-purple-200 via-emerald-200 to-sky-200">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-emerald-50 to-sky-50 opacity-50" />
        <UICardHeader className="relative">
          <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-emerald-600 to-sky-600">
            Daily Health Score
          </CardTitle>
          <CardDescription className="text-base space-y-2">
            <p>Priority-weighted scoring system (100 points total):</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="space-y-1">
                <p className="text-purple-600">🔹 Medication: 20 pts</p>
                <p className="text-emerald-600">🔹 Meals: 25 pts</p>
                <p className="text-sky-600">🔹 Water: 15 pts</p>
              </div>
              <div className="space-y-1">
                <p className="text-orange-600">🔹 Exercise: 15 pts</p>
                <p className="text-indigo-600">🔹 Sleep: 15 pts</p>
                <p className="text-fuchsia-600">🔹 Other: 10 pts</p>
              </div>
            </div>
          </CardDescription>
        </UICardHeader>
        <CardContent className="relative">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="mt-1 text-5xl font-black leading-none bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-emerald-600 to-sky-600">
                {total}
                <span className="text-2xl font-bold text-muted-foreground"> / 100</span>
              </p>
            </div>
            <Badge
              className={cn(
                "px-3 py-1.5 text-sm font-semibold shadow-lg transition-all duration-300",
                total >= 80 ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600" :
                total >= 60 ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white hover:from-sky-600 hover:to-indigo-600" :
                "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
              )}
              aria-label={total >= 80 ? "Excellent" : total >= 60 ? "Good Progress" : "Keep Going"}
            >
              {total >= 80 ? "Excellent!" : total >= 60 ? "Good Progress!" : "Keep Going!"}
            </Badge>
          </div>

          {/* Progress bar */}
          <div
            className="mt-6 h-4 w-full rounded-full bg-gradient-to-r from-emerald-100 via-sky-100 to-fuchsia-100 p-0.5 shadow-inner"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={totalPercent}
            aria-label="Total health points progress"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-fuchsia-500 transition-all duration-500 ease-out shadow-lg"
              style={{ width: `${totalPercent}%` }}
            />
          </div>

          {/* Auto-save indicator */}
          <div className="mt-6 flex items-center justify-center">
            <Badge
              variant="secondary"
              className="bg-white/50 text-muted-foreground shadow-sm backdrop-blur-sm"
            >
              <svg
                className="mr-2 h-3 w-3 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Auto-saving your progress
            </Badge>
          </div>
        </CardContent>
      </UICard>
    </div>
  )
}

function ColorCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <UICard className="group relative overflow-hidden border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 shadow-md transition-all duration-300 hover:shadow-lg hover:border-slate-300">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-white/80 to-white opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <UICardHeader className="relative flex flex-row items-start justify-between gap-3 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-br from-slate-50 to-white p-2 shadow-sm ring-1 ring-slate-100/80 transition-transform duration-300 group-hover:scale-110">
            {icon}
          </div>
          <div>
            <CardTitle className="text-lg font-semibold leading-tight tracking-tight">{title}</CardTitle>
            {subtitle ? (
              <CardDescription className="mt-1 text-sm tracking-tight text-slate-500">
                {subtitle}
              </CardDescription>
            ) : null}
          </div>
        </div>
      </UICardHeader>
      <CardContent className="relative pt-0">{children}</CardContent>
    </UICard>
  )
}

function SliderNumber({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
  accentClass,
  chip,
}: {
  id: string
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  suffix?: string
  accentClass?: string
  chip?: string
}) {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id} className="text-sm font-medium tracking-tight">
          {label}
        </Label>
        {chip ? (
          <span className="rounded-lg bg-gradient-to-br from-slate-50 to-white px-3 py-1.5 text-xs font-medium shadow-sm ring-1 ring-slate-200">
            {chip}
          </span>
        ) : null}
      </div>
      <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto]">
        <div className="relative py-4">
          <Slider
            value={[Number.isNaN(value) ? 0 : value]}
            min={min}
            max={max}
            step={step ?? 1}
            onValueChange={(vals) => onChange(vals[0] ?? 0)}
            className="relative z-10 min-w-0 w-full [&>span]:h-2 [&>span]:bg-gradient-to-r [&>span]:from-slate-100 [&>span]:to-white [&>span]:shadow-inner [&>span]:border [&>span]:border-slate-200"
            aria-label={label}
          />
          {/* Animated background gradient */}
          <div 
            className="absolute inset-y-4 left-0 rounded-full bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-purple-500/20 blur transition-[width,opacity] duration-300 ease-out"
            style={{ 
              width: `${Math.max(5, percentage)}%`,
              opacity: percentage / 200 + 0.1
            }}
          />
          {/* Tick marks */}
          <div className="absolute inset-x-0 top-0 flex justify-between px-[2px]">
            {Array.from({ length: 5 }, (_, i) => (
              <div 
                key={i} 
                className="h-1 w-0.5 bg-slate-200"
                style={{
                  opacity: percentage >= (i * 25) ? 0.8 : 0.3
                }}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Input
            id={id}
            type="number"
            inputMode="decimal"
            className="w-24 sm:w-28 border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-sm transition-shadow focus-visible:shadow-md"
            min={min}
            max={max}
            step={step ?? 1}
            value={Number.isNaN(value) ? 0 : value}
            onChange={(e) => onChange(Number(e.target.value))}
            aria-describedby={`${id}-suffix`}
          />
          {suffix ? (
            <span id={`${id}-suffix`} className={cn(
              "text-sm font-medium transition-colors duration-300",
              accentClass,
              percentage > 75 ? "text-emerald-600" : 
              percentage > 50 ? "text-sky-600" : 
              percentage > 25 ? "text-amber-600" : 
              "text-slate-500"
            )}>
              {suffix}
            </span>
          ) : null}
        </div>
      </div>
      {/* Mini scale */}
      <div className="flex justify-between px-1 text-xs text-slate-400">
        <span>{min}{suffix}</span>
        <span className="text-slate-300">|</span>
        <span>{(max - min) / 2 + min}{suffix}</span>
        <span className="text-slate-300">|</span>
        <span>{max}{suffix}</span>
      </div>
    </div>
  )
}

function CheckRow({
  id,
  label,
  checked,
  onChange,
  chip,
  chipClass,
  iconAfter,
}: {
  id: string
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  chip?: string
  chipClass?: string
  iconAfter?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Checkbox
            id={id}
            checked={checked}
            onCheckedChange={(v) => onChange(Boolean(v))}
            aria-checked={checked}
            className="h-5 w-5 border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-sm transition-all duration-300 data-[state=checked]:border-transparent data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-sky-500 data-[state=checked]:shadow-md hover:shadow-md"
          />
          <div className="absolute inset-0 scale-150 bg-gradient-to-r from-emerald-500 to-sky-500 opacity-0 blur transition-opacity duration-500 data-[state=checked]:opacity-20" />
        </div>
        <Label htmlFor={id} className="text-sm font-medium tracking-tight">
          {label}
        </Label>
      </div>
      <div className="flex items-center gap-3">
        {chip ? (
          <span className={cn(
            "rounded-lg bg-gradient-to-br from-slate-50 to-white px-3 py-1.5 text-xs font-medium shadow-sm ring-1 ring-slate-200 transition-all duration-300",
            chipClass ?? "bg-muted",
            checked && "scale-110"
          )}>
            {chip}
          </span>
        ) : null}
        {iconAfter && (
          <div className={cn(
            "transition-all duration-300",
            checked ? "opacity-100 scale-100" : "opacity-50 scale-90"
          )}>
            {iconAfter}
          </div>
        )}
      </div>
    </div>
  )
}
