"use client"
export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function BmiPage() {
  const supabase = createClient()
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [weight, setWeight] = useState("")
  const [bmiRecords, setBmiRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    setProfile(profileData)

    const { data: bmiData } = await supabase
      .from("bmi_records")
      .select("*")
      .eq("user_id", user.id)
      .order("recorded_at", { ascending: false })

    setBmiRecords(bmiData || [])
  }

  const handleSaveBMI = async () => {
    setError(null)

    const weightNum = Number(weight)

    if (!profile?.height_cm) {
      setError("Height not found in profile")
      return
    }

    if (!weight || weightNum <= 0) {
      setError("Weight must be greater than 0")
      return
    }

    const heightM = profile.height_cm / 100
    const bmiValue = weightNum / (heightM * heightM)

    setLoading(true)

    try {
      const { error } = await supabase.from("bmi_records").insert({
        user_id: user.id,
        weight_kg: weightNum,
        height_cm: profile.height_cm,
        bmi: Number(bmiValue.toFixed(2)),
      })

      if (error) throw error

      setWeight("")
      loadData()
    } catch (err) {
      console.error("BMI save error:", err)
      setError("Failed to save BMI. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} profile={profile} />
      <main className="flex-1 space-y-6 p-6 md:p-8 lg:p-10">
        <h1 className="text-3xl font-bold">BMI Tracker</h1>

        <Card>
          <CardHeader>
            <CardTitle>Log New BMI</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 items-center">
            <Input
              type="number"
              min="1"
              step="0.1"
              placeholder="Weight (kg)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
            <Button onClick={handleSaveBMI} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </CardContent>

          {error && (
            <p className="px-6 pb-4 text-sm text-destructive">{error}</p>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {bmiRecords.length > 0 ? (
              bmiRecords.map((r) => (
                <div key={r.id} className="flex justify-between text-sm">
                  <span>{new Date(r.recorded_at).toLocaleDateString()}</span>
                  <span>{r.weight_kg} kg</span>
                  <span>BMI {r.bmi}</span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No records yet</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
