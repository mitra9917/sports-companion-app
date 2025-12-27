//fully functional now powered by supabase tables and foreign keys all set
"use client"
export const dynamic = "force-dynamic";



import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
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

    try {
      const { error } = await supabase.from("workout_sessions").insert({
        user_id: user.id,
        session_name: sessionName,
        sport_type: sportType,
        duration_minutes: Number.parseInt(duration),
        intensity: intensity,
        calories_burned: calories ? Number.parseInt(calories) : null,
        distance_km: distance ? Number.parseFloat(distance) : null,
        notes: notes || null,
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
      console.error("[v0] Error adding workout:", error)
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
            <p className="text-muted-foreground">Track and manage your training sessions</p>
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
                <DialogDescription>Record your training session details</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddWorkout} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="sessionName">Session Name</Label>
                  <Input
                    id="sessionName"
                    placeholder="Morning Run"
                    required
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sportType">Sport Type</Label>
                  <Input
                    id="sportType"
                    placeholder="Running, Cycling, Swimming..."
                    required
                    value={sportType}
                    onChange={(e) => setSportType(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="45"
                      required
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="intensity">Intensity</Label>
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
                    <Label htmlFor="calories">Calories Burned (optional)</Label>
                    <Input
                      id="calories"
                      type="number"
                      placeholder="350"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="distance">Distance (km) (optional)</Label>
                    <Input
                      id="distance"
                      type="number"
                      step="0.1"
                      placeholder="5.5"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="How did it go?"
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
          {workouts.length > 0 ? (
            workouts.map((workout) => (
              <Card key={workout.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{workout.session_name}</h3>
                      <Badge variant="secondary">{workout.sport_type}</Badge>
                      <Badge className={getIntensityColor(workout.intensity)}>{workout.intensity}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(workout.session_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {workout.duration_minutes} min
                      </span>
                      {workout.calories_burned && (
                        <span className="flex items-center gap-1">
                          <Flame className="h-4 w-4" />
                          {workout.calories_burned} cal
                        </span>
                      )}
                      {workout.distance_km && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {workout.distance_km} km
                        </span>
                      )}
                    </div>
                    {workout.notes && <p className="text-sm text-muted-foreground">{workout.notes}</p>}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-muted-foreground">No workouts logged yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Start tracking your training sessions</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
