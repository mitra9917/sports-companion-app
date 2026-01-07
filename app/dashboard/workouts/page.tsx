"use client"
export const dynamic = "force-dynamic"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, Clock, Flame, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"

interface Workout {
  id: string
  session_name: string
  sport_type: string
  duration_minutes: number
  intensity: string
  calories_burned?: number
  distance_km?: number
  session_date: string
  notes?: string
}

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [sessionName, setSessionName] = useState("")
  const [sportType, setSportType] = useState("")
  const [duration, setDuration] = useState("")
  const [intensity, setIntensity] = useState("moderate")
  const [calories, setCalories] = useState("")
  const [distance, setDistance] = useState("")
  const [notes, setNotes] = useState("")

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    setUser(user)

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    setProfile(profileData)

    const { data: workoutsData } = await supabase
      .from("workout_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("session_date", { ascending: false })

    setWorkouts(workoutsData || [])
  }

  const handleAddWorkout = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    /* ---------- HARD VALIDATION ---------- */
    const durationNum = Number(duration)
    const caloriesNum = calories ? Number(calories) : 0
    const distanceNum = distance ? Number(distance) : 0

    if (!sessionName.trim() || !sportType.trim()) {
      alert("Session name and sport type are required")
      setIsLoading(false)
      return
    }

    if (isNaN(durationNum) || durationNum <= 0) {
      alert("Duration must be greater than 0 minutes")
      setIsLoading(false)
      return
    }

    if (caloriesNum < 0) {
      alert("Calories burned cannot be negative")
      setIsLoading(false)
      return
    }

    if (distanceNum < 0) {
      alert("Distance cannot be negative")
      setIsLoading(false)
      return
    }

    const normalizedSportType = sportType.trim().toLowerCase()

    try {
      const { error } = await supabase.from("workout_sessions").insert({
        user_id: user.id,
        session_name: sessionName.trim(),
        sport_type: normalizedSportType.trim(),
        duration_minutes: durationNum,
        intensity,
        calories_burned: calories ? caloriesNum : null,
        distance_km: distance ? distanceNum : null,
        notes: notes.trim() || null,
      })

      if (error) throw error

      setIsOpen(false)
      setSessionName("")
      setSportType("")
      setDuration("")
      setIntensity("moderate")
      setCalories("")
      setDistance("")
      setNotes("")
      loadData()
    } catch (error) {
      console.error("Error adding workout:", error)
      alert("Failed to log workout. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getIntensityColor = (intensity: string) => {
    const colors = {
      low: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
      moderate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
      high: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
      extreme: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
    }
    return colors[intensity as keyof typeof colors] || colors.moderate
  }

  if (!user) return null

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} profile={profile} />

      <main className="flex-1 space-y-6 p-6 md:p-8 lg:p-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Workouts</h1>
            <p className="text-muted-foreground">
              Track and manage your training sessions
            </p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Log Workout
              </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Log Workout Session</DialogTitle>
                <DialogDescription>
                  Record your training session details
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddWorkout} className="space-y-4">
                <div className="grid gap-2">
                  <Label>Session Name</Label>
                  <Input
                    required
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Sport Type</Label>
                  <Input
                    required
                    value={sportType}
                    onChange={(e) => setSportType(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      required
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Intensity</Label>
                    <Select value={intensity} onValueChange={setIntensity}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="extreme">Extreme</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Calories Burned</Label>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Distance (km)</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.1}
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging..." : "Log Workout"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {workouts.length ? (
            workouts.map((w) => (
              <Card key={w.id}>
                <CardContent className="p-6 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{w.session_name}</h3>
                    <Badge variant="secondary">{w.sport_type}</Badge>
                    <Badge className={getIntensityColor(w.intensity)}>
                      {w.intensity}
                    </Badge>
                  </div>

                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(w.session_date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {w.duration_minutes} min
                    </span>
                    {w.calories_burned !== null && (
                      <span className="flex items-center gap-1">
                        <Flame className="h-4 w-4" />
                        {w.calories_burned} cal
                      </span>
                    )}
                    {w.distance_km !== null && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {w.distance_km} km
                      </span>
                    )}
                  </div>

                  {w.notes && (
                    <p className="text-sm text-muted-foreground">{w.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                No workouts logged yet
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
