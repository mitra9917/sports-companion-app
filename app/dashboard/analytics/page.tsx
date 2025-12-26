"use client"
export const dynamic = "force-dynamic";



import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Activity, Target, Flame } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AnalyticsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [workoutStats, setWorkoutStats] = useState<any[]>([])
  const [bmiTrend, setBmiTrend] = useState<any[]>([])
  const [sportTypeDistribution, setSportTypeDistribution] = useState<any[]>([])
  const [weeklyStats, setWeeklyStats] = useState<any>(null)

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

    // Get last 7 days workouts
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: workoutsData } = await supabase
      .from("workout_sessions")
      .select("*")
      .eq("user_id", user.id)
      .gte("session_date", sevenDaysAgo.toISOString())
      .order("session_date", { ascending: true })

    // Process workout stats by day
    const statsByDay: any = {}
    workoutsData?.forEach((workout: any) => {
      const date = new Date(workout.session_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      if (!statsByDay[date]) {
        statsByDay[date] = { date, workouts: 0, calories: 0, duration: 0 }
      }
      statsByDay[date].workouts += 1
      statsByDay[date].calories += workout.calories_burned || 0
      statsByDay[date].duration += workout.duration_minutes || 0
    })
    setWorkoutStats(Object.values(statsByDay))

    // Get all workouts for sport type distribution
    const { data: allWorkouts } = await supabase.from("workout_sessions").select("sport_type").eq("user_id", user.id)

    const sportTypes: any = {}
    allWorkouts?.forEach((workout: any) => {
      sportTypes[workout.sport_type] = (sportTypes[workout.sport_type] || 0) + 1
    })
    setSportTypeDistribution(
      Object.entries(sportTypes).map(([name, value]) => ({
        name,
        value,
      })),
    )

    // Calculate weekly stats
    const totalWorkouts = workoutsData?.length || 0
    const totalCalories = workoutsData?.reduce((sum: number, w: any) => sum + (w.calories_burned || 0), 0) || 0
    const totalDuration = workoutsData?.reduce((sum: number, w: any) => sum + (w.duration_minutes || 0), 0) || 0
    setWeeklyStats({ totalWorkouts, totalCalories, totalDuration })

    // Get BMI trend
    const { data: bmiData } = await supabase
      .from("bmi_records")
      .select("*")
      .eq("user_id", user.id)
      .order("recorded_at", { ascending: true })
      .limit(15)

    setBmiTrend(
      bmiData?.map((record: any) => ({
        date: new Date(record.recorded_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        bmi: Number.parseFloat(record.bmi.toFixed(1)),
        weight: Number.parseFloat(record.weight_kg.toFixed(1)),
      })) || [],
    )
  }

  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  if (!user) return null

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} profile={profile} />
      <main className="flex-1 space-y-6 p-6 md:p-8 lg:p-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Track your performance and progress</p>
        </div>

        {/* Weekly Summary */}
        {weeklyStats && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Workouts</p>
                  <p className="text-2xl font-bold">{weeklyStats.totalWorkouts}</p>
                  <p className="text-xs text-muted-foreground">Last 7 days</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                  <Flame className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Calories Burned</p>
                  <p className="text-2xl font-bold">{weeklyStats.totalCalories}</p>
                  <p className="text-xs text-muted-foreground">Last 7 days</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <Target className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Duration</p>
                  <p className="text-2xl font-bold">{weeklyStats.totalDuration} min</p>
                  <p className="text-xs text-muted-foreground">Last 7 days</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Workout Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
              <CardDescription>Workouts and calories over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {workoutStats.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={workoutStats}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="workouts" fill="hsl(var(--primary))" name="Workouts" />
                      <Bar dataKey="calories" fill="hsl(var(--secondary))" name="Calories" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                  No workout data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sport Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Sport Type Distribution</CardTitle>
              <CardDescription>Breakdown of your training activities</CardDescription>
            </CardHeader>
            <CardContent>
              {sportTypeDistribution.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sportTypeDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="hsl(var(--primary))"
                        dataKey="value"
                        label
                      >
                        {sportTypeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                  No sport type data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* BMI Trend */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Body Metrics Trend</CardTitle>
              <CardDescription>Track your BMI and weight progress over time</CardDescription>
            </CardHeader>
            <CardContent>
              {bmiTrend.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={bmiTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis yAxisId="left" className="text-xs" />
                      <YAxis yAxisId="right" orientation="right" className="text-xs" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="bmi"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))" }}
                        name="BMI"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="weight"
                        stroke="hsl(var(--secondary))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--secondary))" }}
                        name="Weight (kg)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-80 items-center justify-center text-muted-foreground">No BMI data available</div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
