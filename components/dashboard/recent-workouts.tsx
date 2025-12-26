import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Flame } from "lucide-react"
import Link from "next/link"

interface Workout {
  id: string
  session_name: string
  sport_type: string
  duration_minutes: number
  intensity: string
  calories_burned?: number
  session_date: string
}

interface RecentWorkoutsProps {
  workouts: Workout[]
}

export function RecentWorkouts({ workouts }: RecentWorkoutsProps) {
  const getIntensityColor = (intensity: string) => {
    const colors = {
      low: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
      moderate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
      high: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
      extreme: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
    }
    return colors[intensity as keyof typeof colors] || colors.moderate
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Workouts</CardTitle>
            <CardDescription>Your latest training sessions</CardDescription>
          </div>
          <Link href="/dashboard/workouts">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {workouts.length > 0 ? (
          <div className="space-y-4">
            {workouts.map((workout) => (
              <div key={workout.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{workout.session_name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {workout.sport_type}
                    </Badge>
                    <Badge className={`text-xs ${getIntensityColor(workout.intensity)}`}>{workout.intensity}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(workout.session_date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {workout.duration_minutes} min
                    </span>
                    {workout.calories_burned && (
                      <span className="flex items-center gap-1">
                        <Flame className="h-3 w-3" />
                        {workout.calories_burned} cal
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No workouts recorded yet</p>
            <Link href="/dashboard/workouts">
              <Button className="mt-4">Log Your First Workout</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
