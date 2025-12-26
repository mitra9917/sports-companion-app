import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { Activity, Target, Trophy, Zap } from "lucide-react"

interface QuickStatsProps {
  userId: string
}

export async function QuickStats({ userId }: QuickStatsProps) {
  const supabase = await createClient()

  // Get total workouts this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: workoutsThisMonth } = await supabase
    .from("workout_sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("session_date", startOfMonth.toISOString())

  // Get total calories burned this month
  const { data: workoutsData } = await supabase
    .from("workout_sessions")
    .select("calories_burned")
    .eq("user_id", userId)
    .gte("session_date", startOfMonth.toISOString())

  const totalCalories = workoutsData?.reduce((sum, w) => sum + (w.calories_burned || 0), 0) || 0

  // Get active goals count
  const { count: activeGoalsCount } = await supabase
    .from("goals")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "active")

  // Get achievements count
  const { count: achievementsCount } = await supabase
    .from("achievements")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)

  const stats = [
    {
      title: "Workouts This Month",
      value: workoutsThisMonth || 0,
      icon: Activity,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Calories Burned",
      value: totalCalories,
      icon: Zap,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Active Goals",
      value: activeGoalsCount || 0,
      icon: Target,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Achievements",
      value: achievementsCount || 0,
      icon: Trophy,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
