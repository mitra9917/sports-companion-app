"use client"

export const dynamic = "force-dynamic"

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
  const supabase = createClient()
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [workoutStats, setWorkoutStats] = useState<any[]>([])
  const [bmiTrend, setBmiTrend] = useState<any[]>([])
  const [sportTypeDistribution, setSportTypeDistribution] = useState<any[]>([])
  const [weeklyStats, setWeeklyStats] = useState<any>(null)

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)
      await loadAnalytics(user.id)
      setLoading(false)
    }

    init()
  }, [])

  const loadAnalytics = async (userId: string) => {
    // Profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()

    setProfile(profileData ?? null)

    // Last 7 days workouts
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: workoutsData } = await supabase
      .from("workout_sessions")
      .select("*")
      .eq("user_id", userId)
      .gte("session_date", sevenDaysAgo.toISOString())
      .order("session_date", { ascending: true })

    const workouts = workoutsData ?? []

    const statsByDay: any = {}
    workouts.forEach((workout: any) => {
      const date = new Date(workout.session_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })

      if (!statsByDay[date]) {
        statsByDay[date] = { date, workouts: 0, calories: 0, duration: 0 }
      }

      statsByDay[date].workouts += 1
      statsByDay[date].calories += workout.calories_burned || 0
      statsByDay[date].duration += workout.duration_minutes || 0
    })

    setWorkoutStats(Object.values(statsByDay))

    // Sport type distribution
    const { data: allWorkouts } = await supabase
      .from("workout_sessions")
      .select("sport_type")
      .eq("user_id", userId)

    const sportTypes: any = {}
    ;(allWorkouts ?? []).forEach((w: any) => {
      if (!w.sport_type) return
      sportTypes[w.sport_type] = (sportTypes[w.sport_type] || 0) + 1
    })

    setSportTypeDistribution(
      Object.entries(sportTypes).map(([name, value]) => ({ name, value }))
    )

    // Weekly stats
    setWeeklyStats({
      totalWorkouts: workouts.length,
      totalCalories: workouts.reduce(
        (sum: number, w: any) => sum + (w.calories_burned || 0),
        0
      ),
      totalDuration: workouts.reduce(
        (sum: number, w: any) => sum + (w.duration_minutes || 0),
        0
      ),
    })

    // BMI trend
    const { data: bmiData } = await supabase
      .from("bmi_records")
      .select("*")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: true })
      .limit(15)

    setBmiTrend(
      (bmiData ?? []).map((record: any) => ({
        date: new Date(record.recorded_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        bmi: Number(record.bmi?.toFixed(1)),
        weight: Number(record.weight_kg?.toFixed(1)),
      }))
    )
  }

  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading analytics...
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} profile={profile} />

      <main className="flex-1 space-y-6 p-6 md:p-8 lg:p-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your performance and progress
          </p>
        </div>

        {weeklyStats && (
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              title="Total Workouts"
              value={weeklyStats.totalWorkouts}
              icon={<Activity className="h-6 w-6 text-primary" />}
            />
            <StatCard
              title="Calories Burned"
              value={weeklyStats.totalCalories}
              icon={<Flame className="h-6 w-6 text-secondary" />}
            />
            <StatCard
              title="Total Duration"
              value={`${weeklyStats.totalDuration} min`}
              icon={<Target className="h-6 w-6 text-accent" />}
            />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="Weekly Activity">
            {workoutStats.length ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={workoutStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="workouts" fill="hsl(var(--primary))" />
                  <Bar dataKey="calories" fill="hsl(var(--secondary))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState text="No workout data available" />
            )}
          </ChartCard>

          <ChartCard title="Sport Type Distribution">
            {sportTypeDistribution.length ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={sportTypeDistribution} dataKey="value" label>
                    {sportTypeDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState text="No sport type data available" />
            )}
          </ChartCard>

          <ChartCard title="BMI & Weight Trend" full>
            {bmiTrend.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={bmiTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" dataKey="bmi" stroke="hsl(var(--primary))" />
                  <Line
                    yAxisId="right"
                    dataKey="weight"
                    stroke="hsl(var(--secondary))"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState text="No BMI data available" />
            )}
          </ChartCard>
        </div>
      </main>
    </div>
  )
}

/* ---------- Small helper components ---------- */

function StatCard({ title, value, icon }: any) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function ChartCard({ title, children, full }: any) {
  return (
    <Card className={full ? "lg:col-span-2" : ""}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function EmptyState({ text }: any) {
  return (
    <div className="flex h-64 items-center justify-center text-muted-foreground">
      {text}
    </div>
  )
}
