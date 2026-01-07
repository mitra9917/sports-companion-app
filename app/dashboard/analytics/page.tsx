"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Activity, Flame, Target } from "lucide-react"
import { useRouter } from "next/navigation"

/* ---------- COLORS ---------- */
const COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
]

export default function AnalyticsPage() {
  const supabase = createClient()
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [weeklyStats, setWeeklyStats] = useState<any>(null)
  const [workoutStats, setWorkoutStats] = useState<any[]>([])
  const [sportTypeDistribution, setSportTypeDistribution] = useState<any[]>([])
  const [bmiTrend, setBmiTrend] = useState<any[]>([])

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push("/auth/login")
        return
      }

      setUser(data.user)
      await loadAnalytics(data.user.id)
      setLoading(false)
    }

    init()
  }, [])

  const loadAnalytics = async (userId: string) => {
    /* ---------- PROFILE ---------- */
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()

    setProfile(profileData ?? null)

    /* ---------- WORKOUTS (LAST 7 DAYS) ---------- */
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

    workouts.forEach((w: any) => {
      const date = new Date(w.session_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })

      if (!statsByDay[date]) {
        statsByDay[date] = { date, workouts: 0, calories: 0 }
      }

      statsByDay[date].workouts += 1
      statsByDay[date].calories += w.calories_burned || 0
    })

    setWorkoutStats(Object.values(statsByDay))

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

    /* ======================================================
       🔧 FIX #1 — CASE-INSENSITIVE SPORT AGGREGATION
       ====================================================== */

    const { data: allWorkouts } = await supabase
      .from("workout_sessions")
      .select("sport_type")
      .eq("user_id", userId)

    const sportMap: Record<string, number> = {}

    ;(allWorkouts ?? []).forEach((w: any) => {
      if (!w.sport_type) return

      // 🔧 CHANGE: normalize sport type
      const key = w.sport_type.toLowerCase().trim()

      sportMap[key] = (sportMap[key] || 0) + 1
    })

    // 🔧 CHANGE: convert back to Title Case for UI
    const formattedSports = Object.entries(sportMap).map(
      ([name, value]) => ({
        name: name
          .split(" ")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1)
          )
          .join(" "),
        value,
      })
    )

    setSportTypeDistribution(formattedSports)

    /* ---------- BMI TREND ---------- */
    const { data: bmiData } = await supabase
      .from("bmi_records")
      .select("*")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: true })
      .limit(15)

    setBmiTrend(
      (bmiData ?? []).map((r: any) => ({
        date: new Date(r.recorded_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        bmi: r.bmi ? Number(r.bmi.toFixed(1)) : 0,
        weight: r.weight_kg ? Number(r.weight_kg.toFixed(1)) : 0,
      }))
    )
  }

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
        <h1 className="text-3xl font-bold">Analytics</h1>

        {/* ---------- SUMMARY ---------- */}
        {weeklyStats && (
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard title="Total Workouts" value={weeklyStats.totalWorkouts} icon={<Activity />} />
            <StatCard title="Calories Burned" value={weeklyStats.totalCalories} icon={<Flame />} />
            <StatCard title="Total Duration" value={`${weeklyStats.totalDuration} min`} icon={<Target />} />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* ---------- BAR CHART ---------- */}
          <ChartCard title="Weekly Activity">
            {workoutStats.length ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={workoutStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="workouts" fill="#2563eb" name="Workouts" />
                  <Bar dataKey="calories" fill="#f59e0b" name="Calories" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState text="No workout data available" />
            )}
          </ChartCard>

          {/* ---------- PIE CHART ---------- */}
          <ChartCard title="Sport Type Distribution">
            {sportTypeDistribution.length ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={sportTypeDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {sportTypeDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState text="No sport data available" />
            )}
          </ChartCard>

          {/* ---------- BMI LINE CHART ---------- */}
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
                  <Line yAxisId="left" dataKey="bmi" stroke="#2563eb" strokeWidth={2} name="BMI" />
                  <Line yAxisId="right" dataKey="weight" stroke="#16a34a" strokeWidth={2} name="Weight (kg)" />
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

/* ---------- Helper Components ---------- */

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
