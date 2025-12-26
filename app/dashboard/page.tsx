export const dynamic = "force-dynamic";


import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { BMIMonitor } from "@/components/dashboard/bmi-monitor"
import { QuickStats } from "@/components/dashboard/quick-stats"
import { RecentWorkouts } from "@/components/dashboard/recent-workouts"
import { ActiveGoals } from "@/components/dashboard/active-goals"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch latest BMI record
  const { data: latestBMI } = await supabase
    .from("bmi_records")
    .select("*")
    .eq("user_id", user.id)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .single()

  // Fetch BMI history for chart
  const { data: bmiHistory } = await supabase
    .from("bmi_records")
    .select("*")
    .eq("user_id", user.id)
    .order("recorded_at", { ascending: false })
    .limit(30)

  // Fetch recent workouts
  const { data: recentWorkouts } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("session_date", { ascending: false })
    .limit(5)

  // Fetch active goals
  const { data: activeGoals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(4)

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} profile={profile} />
      <main className="flex-1 space-y-6 p-6 md:p-8 lg:p-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-balance text-3xl font-bold tracking-tight">
            Welcome back, {profile?.full_name || "Athlete"}
          </h1>
          <p className="text-muted-foreground">Track your progress and achieve your fitness goals</p>
        </div>

        <QuickStats userId={user.id} />

        <div className="grid gap-6 lg:grid-cols-2">
          <BMIMonitor latestBMI={latestBMI} bmiHistory={bmiHistory || []} userId={user.id} />
          <ActiveGoals goals={activeGoals || []} />
        </div>

        <RecentWorkouts workouts={recentWorkouts || []} />
      </main>
    </div>
  )
}
