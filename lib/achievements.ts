import { SupabaseClient } from "@supabase/supabase-js"

// Define the achievement archetypes
export const ACHIEVEMENTS = {
    // Volume (Workouts)
    FIRST_STEP: { id: "first_step", title: "First Step", description: "Log your first workout. Every journey begins with a single step.", icon: "Footprints" },
    DEDICATED: { id: "dedicated", title: "Dedicated", description: "Log 10 workouts. You are building a habit!", icon: "Activity" },
    UNSTOPPABLE: { id: "unstoppable", title: "Unstoppable", description: "Log 50 workouts. Nothing can hold you back.", icon: "Swords" },
    CENTURY_CLUB: { id: "century_club", title: "Century Club", description: "Log 100 workouts. Welcome to the elite.", icon: "Crown" },

    // Goals
    TARGET_ACQUIRED: { id: "target_acquired", title: "Target Acquired", description: "Complete your first fitness goal.", icon: "Target" },
    OVERACHIEVER: { id: "overachiever", title: "Overachiever", description: "Complete 5 fitness goals.", icon: "Trophy" },
    MASTER_PLANNER: { id: "master_planner", title: "Master Planner", description: "Complete 20 fitness goals.", icon: "Medal" },

    // Calories
    BURNING_UP: { id: "burning_up", title: "Burning Up", description: "Burn 5,000 total calories.", icon: "Flame" },
    INFERNO: { id: "inferno", title: "Inferno", description: "Burn 25,000 total calories.", icon: "Zap" },

    // Specific Feats
    MARATHONER: { id: "marathoner", title: "Marathoner", description: "Log a single session with over 42km of distance.", icon: "Timer" },
    BEAST_MODE: { id: "beast_mode", title: "Beast Mode", description: "Log a workout with extreme intensity.", icon: "Dumbbell" }
}

export async function checkWorkoutAchievements(userId: string, supabase: SupabaseClient) {

    // 1. Get total workouts and caloric burn and feats
    const { data: workouts } = await supabase
        .from("workout_sessions")
        .select("intensity, calories_burned, distance_km")
        .eq("user_id", userId)

    if (!workouts) return

    const totalWorkouts = workouts.length
    const totalCalories = workouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0)

    // Check feats in the latest workout
    const latestWorkout = workouts[workouts.length - 1]
    const isExtreme = latestWorkout?.intensity === "extreme"
    const isMarathon = (latestWorkout?.distance_km || 0) >= 42

    // 2. Get existing achievements to prevent duplicates
    const { data: existingRecords } = await supabase
        .from("achievements")
        .select("achievement_type")
        .eq("user_id", userId)

    const existingTypes = new Set(existingRecords?.map(a => a.achievement_type) || [])
    const newAchievements = []

    // Check Volume
    if (totalWorkouts >= 1 && !existingTypes.has(ACHIEVEMENTS.FIRST_STEP.id)) newAchievements.push(ACHIEVEMENTS.FIRST_STEP)
    if (totalWorkouts >= 10 && !existingTypes.has(ACHIEVEMENTS.DEDICATED.id)) newAchievements.push(ACHIEVEMENTS.DEDICATED)
    if (totalWorkouts >= 50 && !existingTypes.has(ACHIEVEMENTS.UNSTOPPABLE.id)) newAchievements.push(ACHIEVEMENTS.UNSTOPPABLE)
    if (totalWorkouts >= 100 && !existingTypes.has(ACHIEVEMENTS.CENTURY_CLUB.id)) newAchievements.push(ACHIEVEMENTS.CENTURY_CLUB)

    // Check Calories
    if (totalCalories >= 5000 && !existingTypes.has(ACHIEVEMENTS.BURNING_UP.id)) newAchievements.push(ACHIEVEMENTS.BURNING_UP)
    if (totalCalories >= 25000 && !existingTypes.has(ACHIEVEMENTS.INFERNO.id)) newAchievements.push(ACHIEVEMENTS.INFERNO)

    // Check Feats 
    if (isExtreme && !existingTypes.has(ACHIEVEMENTS.BEAST_MODE.id)) newAchievements.push(ACHIEVEMENTS.BEAST_MODE)
    if (isMarathon && !existingTypes.has(ACHIEVEMENTS.MARATHONER.id)) newAchievements.push(ACHIEVEMENTS.MARATHONER)

    // 3. Insert new achievements
    if (newAchievements.length > 0) {
        const payloads = newAchievements.map(ac => ({
            user_id: userId,
            achievement_type: ac.id,
            title: ac.title,
            description: ac.description,
            icon: ac.icon
        }))

        const { error } = await supabase.from("achievements").insert(payloads)
        if (error) throw new Error(`Workout DB Error: ${error.message} (Code: ${error.code})`)
        return newAchievements
    }
    return null
}

export async function checkGoalAchievements(userId: string, supabase: SupabaseClient) {

    const { data: goals } = await supabase
        .from("goals")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "completed")

    if (!goals) return

    const completedCount = goals.length

    const { data: existingRecords } = await supabase
        .from("achievements")
        .select("achievement_type")
        .eq("user_id", userId)

    const existingTypes = new Set(existingRecords?.map(a => a.achievement_type) || [])
    const newAchievements = []

    if (completedCount >= 1 && !existingTypes.has(ACHIEVEMENTS.TARGET_ACQUIRED.id)) newAchievements.push(ACHIEVEMENTS.TARGET_ACQUIRED)
    if (completedCount >= 5 && !existingTypes.has(ACHIEVEMENTS.OVERACHIEVER.id)) newAchievements.push(ACHIEVEMENTS.OVERACHIEVER)
    if (completedCount >= 20 && !existingTypes.has(ACHIEVEMENTS.MASTER_PLANNER.id)) newAchievements.push(ACHIEVEMENTS.MASTER_PLANNER)

    if (newAchievements.length > 0) {
        const payloads = newAchievements.map(ac => ({
            user_id: userId,
            achievement_type: ac.id,
            title: ac.title,
            description: ac.description,
            icon: ac.icon
        }))

        const { error } = await supabase.from("achievements").insert(payloads)
        if (error) throw new Error(`Goal DB Error: ${error.message} (Code: ${error.code})`)
        return newAchievements
    }
    return null
}
