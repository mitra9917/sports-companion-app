"use client"
export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
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
import { Progress } from "@/components/ui/progress"
import { Plus, Target, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Goal {
  id: string
  goal_type: string
  title: string
  description?: string
  target_value?: number
  current_value?: number
  start_value?: number
  unit?: string
  target_date?: string
  status: string
}

export default function GoalsPage() {
  const supabase = createClient()
  const router = useRouter()

  const [goals, setGoals] = useState<Goal[]>([])
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [title, setTitle] = useState("")
  const [goalType, setGoalType] = useState("weight_loss")
  const [description, setDescription] = useState("")
  const [currentValue, setCurrentValue] = useState("")
  const [targetValue, setTargetValue] = useState("")
  const [unit, setUnit] = useState("kg")
  const [targetDate, setTargetDate] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      router.push("/auth/login")
      return
    }
    setUser(data.user)

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single()

    setProfile(profileData)

    const { data: goalsData } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", data.user.id)
      .order("created_at", { ascending: false })

    setGoals(goalsData || [])
  }

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault()

    const curr = currentValue ? Number(currentValue) : null
    const target = targetValue ? Number(targetValue) : null

    if (curr !== null && curr < 0) return alert("Current value cannot be negative")
    if (target === null || target <= 0) return alert("Target value must be greater than 0")

    setIsLoading(true)

    try {
      const { error } = await supabase.from("goals").insert({
        user_id: user.id,
        goal_type: goalType,
        title,
        description: description || null,
        current_value: curr,
        target_value: target,
        unit,
        target_date: targetDate || null,
        status: "active",
      })

      if (error) throw error

      setIsOpen(false)
      setTitle("")
      setDescription("")
      setCurrentValue("")
      setTargetValue("")
      setTargetDate("")
      loadData()
    } catch (err) {
      console.error("Goal insert error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  /* ✅ FIXED PROGRESS LOGIC */
  const getProgress = (goal: Goal) => {
    if (goal.current_value == null || goal.target_value == null) return 0

    // Weight loss → reverse progress
    if (goal.goal_type === "weight_loss") {
      const start = goal.start_value ?? goal.current_value
      const current = goal.current_value
      const target = goal.target_value

      if (start <= target) return 0

      const progress =
        ((start - current) / (start - target)) * 100

      return Math.min(Math.max(progress, 0), 100)
    }

    // Normal forward goals
    return Math.min(
      (goal.current_value / goal.target_value) * 100,
      100
    )
  }

  const activeGoals = goals.filter((g) => g.status === "active")
  const completedGoals = goals.filter((g) => g.status === "completed")

  if (!user) return null

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} profile={profile} />

      <main className="flex-1 space-y-6 p-6 md:p-8 lg:p-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
            <p className="text-muted-foreground">
              Set and track your fitness objectives
            </p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Goal
              </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader className="space-y-1">
                <DialogTitle>Create New Goal</DialogTitle>
                <DialogDescription>
                  Set a new fitness objective to track
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddGoal} className="space-y-5 mt-4">
                <div className="space-y-1">
                  <Label>Goal Title</Label>
                  <Input
                    placeholder="Lose 5kg"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label>Goal Type</Label>
                  <Select value={goalType} onValueChange={setGoalType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight_loss">Weight Loss</SelectItem>
                      <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                      <SelectItem value="endurance">Endurance</SelectItem>
                      <SelectItem value="strength">Strength</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>Description (optional)</Label>
                  <Textarea
                    placeholder="Losing weight to attain BMI of 22.6"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label>Current Value</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="71"
                      value={currentValue}
                      onChange={(e) => setCurrentValue(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Target Value</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="66"
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Unit</Label>
                    <Input
                      placeholder="kg"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Target Date (optional)</Label>
                  <Input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Goal"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {activeGoals.length ? (
            activeGoals.map((goal) => (
              <Card key={goal.id}>
                <CardContent className="p-6 space-y-3">
                  <h3 className="font-semibold">{goal.title}</h3>
                  <Progress value={getProgress(goal)} />
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <Target className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground">No active goals</p>
              </CardContent>
            </Card>
          )}
        </div>

        {completedGoals.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Completed Goals</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {completedGoals.map((goal) => (
                <Card key={goal.id} className="opacity-75">
                  <CardContent className="p-6 flex items-center gap-2">
                    <CheckCircle2 className="text-secondary" />
                    {goal.title}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
