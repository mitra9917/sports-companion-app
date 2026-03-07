"use client"
export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { ACHIEVEMENTS, checkWorkoutAchievements, checkGoalAchievements } from "@/lib/achievements"
import * as Icons from "lucide-react"
import { useRouter } from "next/navigation"

interface EarnedAchievement {
    id: string
    achievement_type: string
    earned_at: string
}

export default function AchievementsPage() {
    const supabase = createClient()
    const router = useRouter()

    const [earned, setEarned] = useState<Set<string>>(new Set())
    const [earnedDates, setEarnedDates] = useState<Record<string, string>>({})
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [dbError, setDbError] = useState<string | null>(null)

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

        // Evaluate historical data to catch any achievements missed before the feature existed
        try {
            await checkWorkoutAchievements(data.user.id, supabase)
            await checkGoalAchievements(data.user.id, supabase)
        } catch (err: any) {
            setDbError(err.message)
        }

        const { data: achievementsData } = await supabase
            .from("achievements")
            .select("achievement_type, earned_at")
            .eq("user_id", data.user.id)

        if (achievementsData) {
            const earnedIds = new Set(achievementsData.map(a => a.achievement_type))
            const dates = achievementsData.reduce((acc, a) => {
                acc[a.achievement_type] = a.earned_at
                return acc
            }, {} as Record<string, string>)

            setEarned(earnedIds)
            setEarnedDates(dates)
        }

        setIsLoading(false)
    }

    const allAchievements = Object.values(ACHIEVEMENTS)

    if (!user && !isLoading) return null

    return (
        <div className="flex min-h-screen flex-col">
            <DashboardHeader user={user} profile={profile} />

            <main className="flex-1 space-y-8 p-6 md:p-8 lg:p-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
                    <p className="text-muted-foreground">
                        View your unlocked badges and see what to aim for next
                    </p>
                </div>

                {dbError && (
                    <div className="bg-destructive/15 text-destructive font-medium p-4 rounded-lg flex items-center justify-between">
                        <span>Database Error: {dbError}</span>
                        <span className="text-xs opacity-70">Check your Supabase RLS policies</span>
                    </div>
                )}

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {allAchievements.map((achievement) => {
                        const isEarned = earned.has(achievement.id)
                        const earnedDate = earnedDates[achievement.id]
                        const IconComponent = Icons[achievement.icon as keyof typeof Icons] as React.ElementType

                        return (
                            <Card
                                key={achievement.id}
                                className={`transition-all duration-300 ${isEarned ? 'border-primary/50 bg-primary/5' : 'opacity-60 grayscale'}`}
                            >
                                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                                    <div className={`flex h-20 w-20 items-center justify-center rounded-full ${isEarned ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                        {IconComponent && <IconComponent className="h-10 w-10" />}
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-lg">{achievement.title}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {achievement.description}
                                        </p>
                                    </div>
                                    {isEarned && earnedDate && (
                                        <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                                            Earned on {new Date(earnedDate).toLocaleDateString()}
                                        </div>
                                    )}
                                    {!isEarned && (
                                        <div className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                            Locked
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </main>
        </div>
    )
}
