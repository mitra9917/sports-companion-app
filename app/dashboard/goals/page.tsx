"use client"

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
  unit?: string
  target_date?: string
  status: string
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [title, setTitle] = useState("")
  const [goalType, setGoalType] = useState("weight_loss")
  const [description, setDescription] = useState("")
  const [targetValue, setTargetValue] = useState("")
  const [currentValue, setCurrentValue] = useState("")
  const [unit, setUnit] = useState("")
  const [targetDate, setTargetDate] = useState("")

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

    const { data: goalsData } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
    setGoals(goalsData || [])
  }

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.from("goals").insert({
        user_id: user.id,
        goal_type: goalType,
        title: title,
        description: description || null,
        target_value: targetValue ? Number.parseFloat(targetValue) : null,
        current_value: currentValue ? Number.parseFloat(currentValue) : null,
        unit: unit || null,
        target_date: targetDate || null,
        status: "active",
      })

      if (error) throw error

      setIsOpen(false)
      setTitle("")
      setGoalType("weight_loss")
      setDescription("")
      setTargetValue("")
      setCurrentValue("")
      setUnit("")
      setTargetDate("")
      loadData()
    } catch (error) {
      console.error("[v0] Error adding goal:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProgress = async (goalId: string, newValue: number) => {
    try {
      const { error } = await supabase.from("goals").update({ current_value: newValue }).eq("id", goalId)

      if (error) throw error
      loadData()
    } catch (error) {
      console.error("[v0] Error updating goal:", error)
    }
  }

  const handleCompleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase.from("goals").update({ status: "completed" }).eq("id", goalId)

      if (error) throw error
      loadData()
    } catch (error) {
      console.error("[v0] Error completing goal:", error)
    }
  }

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

  if (!user) return null

  const activeGoals = goals.filter((g) => g.status === "active")
  const completedGoals = goals.filter((g) => g.status === "completed")

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} profile={profile} />
      <main className="flex-1 space-y-6 p-6 md:p-8 lg:p-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
            <p className="text-muted-foreground">Set and track your fitness objectives</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
                <DialogDescription>Set a new fitness objective to track</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddGoal} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    placeholder="Lose 5kg"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="goalType">Goal Type</Label>
                  <Select value={goalType} onValueChange={setGoalType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight_loss">Weight Loss</SelectItem>
                      <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                      <SelectItem value="endurance">Endurance</SelectItem>
                      <SelectItem value="strength">Strength</SelectItem>
                      <SelectItem value="flexibility">Flexibility</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="What do you want to achieve?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="currentValue">Current Value</Label>
                    <Input
                      id="currentValue"
                      type="number"
                      step="0.1"
                      placeholder="70"
                      value={currentValue}
                      onChange={(e) => setCurrentValue(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="targetValue">Target Value</Label>
                    <Input
                      id="targetValue"
                      type="number"
                      step="0.1"
                      placeholder="65"
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input id="unit" placeholder="kg" value={unit} onChange={(e) => setUnit(e.target.value)} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="targetDate">Target Date (optional)</Label>
                  <Input
                    id="targetDate"
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

        <div className="space-y-8">
          {/* Active Goals */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Active Goals</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {activeGoals.length > 0 ? (
                activeGoals.map((goal) => {
                  const progress = getProgress(goal)
                  return (
                    <Card key={goal.id}>
                      <CardContent className="space-y-4 p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="text-lg font-semibold">{goal.title}</h3>
                            <p className="text-sm text-muted-foreground">{formatGoalType(goal.goal_type)}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCompleteGoal(goal.id)}
                            className="text-secondary hover:text-secondary"
                          >
                            <CheckCircle2 className="h-5 w-5" />
                          </Button>
                        </div>
                        {goal.description && <p className="text-sm text-muted-foreground">{goal.description}</p>}
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
                        {goal.target_date && (
                          <p className="text-xs text-muted-foreground">
                            Target: {new Date(goal.target_date).toLocaleDateString()}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })
              ) : (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <Target className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No active goals</p>
                    <p className="mt-1 text-sm text-muted-foreground">Create a goal to get started</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold">Completed Goals</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {completedGoals.map((goal) => (
                  <Card key={goal.id} className="opacity-75">
                    <CardContent className="space-y-2 p-6">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-secondary" />
                        <div className="space-y-1">
                          <h3 className="font-semibold">{goal.title}</h3>
                          <p className="text-sm text-muted-foreground">{formatGoalType(goal.goal_type)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
