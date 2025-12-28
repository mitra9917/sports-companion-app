"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { Plus, TrendingDown, TrendingUp } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useRouter } from "next/navigation"

interface BMIRecord {
  id: string
  weight_kg: number
  height_cm: number
  bmi: number
  body_fat_percentage?: number
  muscle_mass_kg?: number
  recorded_at: string
  notes?: string
}

interface BMIMonitorProps {
  latestBMI: BMIRecord | null
  bmiHistory: BMIRecord[]
  userId: string
}

export function BMIMonitor({ latestBMI, bmiHistory, userId }: BMIMonitorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [bodyFat, setBodyFat] = useState("")
  const [muscleMass, setMuscleMass] = useState("")
  const [notes, setNotes] = useState("")

  const router = useRouter()
  const supabase = createClient()

  /**
   * ✅ SAFELY pre-fill height from latest BMI (if exists)
   * Runs AFTER data loads — never crashes
   */
  useEffect(() => {
    if (latestBMI?.height_cm) {
      setHeight(String(latestBMI.height_cm))
    }
  }, [latestBMI])

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.from("bmi_records").insert({
        user_id: userId,
        weight_kg: Number.parseFloat(weight),
        height_cm: Number.parseFloat(height),
        body_fat_percentage: bodyFat ? Number.parseFloat(bodyFat) : null,
        muscle_mass_kg: muscleMass ? Number.parseFloat(muscleMass) : null,
        notes: notes || null,
      })

      if (error) throw error

      setIsOpen(false)
      setWeight("")
      setBodyFat("")
      setMuscleMass("")
      setNotes("")
      router.refresh()
    } catch (error) {
      console.error("Error adding BMI record:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: "text-blue-600" }
    if (bmi < 25) return { label: "Normal", color: "text-secondary" }
    if (bmi < 30) return { label: "Overweight", color: "text-yellow-600" }
    return { label: "Obese", color: "text-destructive" }
  }

  const getTrend = () => {
    if (bmiHistory.length < 2) return null
    const latest = bmiHistory[0].bmi
    const previous = bmiHistory[1].bmi
    const diff = latest - previous
    return { diff: Math.abs(diff).toFixed(1), isUp: diff > 0 }
  }

  const chartData = bmiHistory
    .slice(0, 10)
    .reverse()
    .map((record) => ({
      date: new Date(record.recorded_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      bmi: Number.parseFloat(record.bmi.toFixed(1)),
    }))

  const category = latestBMI ? getBMICategory(latestBMI.bmi) : null
  const trend = getTrend()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>BMI Monitor</CardTitle>
            <CardDescription>Track your body metrics over time</CardDescription>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Record
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add BMI Record</DialogTitle>
                <DialogDescription>Enter your current body metrics</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddRecord} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    required
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bodyFat">Body Fat % (optional)</Label>
                  <Input
                    id="bodyFat"
                    type="number"
                    step="0.1"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="muscleMass">Muscle Mass (kg) (optional)</Label>
                  <Input
                    id="muscleMass"
                    type="number"
                    step="0.1"
                    value={muscleMass}
                    onChange={(e) => setMuscleMass(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Record"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {latestBMI ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current BMI</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold">{latestBMI.bmi.toFixed(1)}</p>
                  <span className={`text-sm font-medium ${category?.color}`}>
                    {category?.label}
                  </span>
                </div>
              </div>

              {trend && (
                <div className="flex items-center gap-1">
                  {trend.isUp ? (
                    <TrendingUp className="h-5 w-5 text-destructive" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-secondary" />
                  )}
                  <span className="text-sm font-medium">{trend.diff}</span>
                </div>
              )}
            </div>

            {chartData.length > 1 && (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={["dataMin - 1", "dataMax + 1"]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="bmi"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            No BMI records yet. Add your first record to start tracking.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
