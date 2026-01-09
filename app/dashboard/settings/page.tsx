"use client"
export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const supabase = createClient()
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
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
  }

  /* ---------------- SIGN OUT ---------------- */
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  /* ---------------- FORGOT PASSWORD ---------------- */
  const handleForgotPassword = async () => {
    if (!user?.email) return

    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        user.email,
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      )

      if (error) throw error

      setMessage("Password reset email sent. Check your inbox.")
    } catch (err: any) {
      setError(err.message ?? "Failed to send reset email")
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- CHANGE PASSWORD ---------------- */
  const handleChangePassword = () => {
    router.push("/auth/reset-password")
  }

  if (!user) return null

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} profile={profile} />

      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <h1 className="mb-6 text-3xl font-bold">Settings</h1>

        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 text-sm">
            <p>
              <strong>Name:</strong> {profile?.full_name ?? "—"}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Height:</strong> {profile?.height_cm ?? "—"} cm
            </p>

            {/* -------- PASSWORD ACTIONS -------- */}
            <div className="pt-4 space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleChangePassword}
              >
                Change Password
              </Button>

              <Button
                variant="secondary"
                className="w-full"
                disabled={loading}
                onClick={handleForgotPassword}
              >
                {loading ? "Sending..." : "Forgot Password"}
              </Button>
            </div>

            {/* -------- FEEDBACK -------- */}
            {message && (
              <p className="text-sm text-green-600">{message}</p>
            )}

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {/* -------- SIGN OUT -------- */}
            <Button
              variant="destructive"
              className="mt-4 w-full"
              onClick={handleSignOut}
            >
              Sign out
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
