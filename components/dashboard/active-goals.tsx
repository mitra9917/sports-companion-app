import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Target } from "lucide-react"
import Link from "next/link"

interface Goal {
  id: string
  goal_type: string
  title: string
  description?: string
  target_value?: number
  current_value?: number
  unit?: string
  target_date?: string
}

interface ActiveGoalsProps {
  goals: Goal[]
}

export function ActiveGoals({ goals }: ActiveGoalsProps) {
  const getProgress = (goal: Goal) => {
    if (!goal.target_value || !goal.current_value) return 0
    return Math.min((goal.current_value / goal.target_value) * 100, 100)
  }

  const formatGoalType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Active Goals</CardTitle>
            <CardDescription>Track your fitness objectives</CardDescription>
          </div>
          <Link href="/dashboard/goals">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {goals.length > 0 ? (
          <div className="space-y-4">
            {goals.map((goal) => {
              const progress = getProgress(goal)
              return (
                <div key={goal.id} className="space-y-2 rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold">{goal.title}</h4>
                      <p className="text-sm text-muted-foreground">{formatGoalType(goal.goal_type)}</p>
                    </div>
                    {goal.target_date && (
                      <p className="text-xs text-muted-foreground">
                        Due {new Date(goal.target_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {goal.target_value && goal.current_value !== undefined && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {goal.current_value} / {goal.target_value} {goal.unit}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <p className="text-muted-foreground">No active goals</p>
            <Link href="/dashboard/goals">
              <Button className="mt-4">Set Your First Goal</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
