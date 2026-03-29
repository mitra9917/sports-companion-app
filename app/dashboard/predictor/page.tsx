"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Bot, Swords, User, BrainCircuit, Activity, Zap } from "lucide-react"

interface PlayerStats {
    height: number
    weight: number
    age: number
    experience: number
}

interface PredictionResult {
    fairness: string
    dominance: {
        player: string
        probability: number
    }
    mode: string
}

export default function PredictorPage() {
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)

    const [useDeepModel, setUseDeepModel] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<PredictionResult | null>(null)
    const [error, setError] = useState<string | null>(null)

    const [player1, setPlayer1] = useState<PlayerStats>({
        height: 180,
        weight: 75,
        age: 25,
        experience: 5
    })

    const [player2, setPlayer2] = useState<PlayerStats>({
        height: 175,
        weight: 70,
        age: 28,
        experience: 8
    })

    // Load user data so header renders properly
    useState(() => {
        async function loadUser() {
            const supabase = createClient()
            const { data } = await supabase.auth.getUser()
            if (data.user) {
                setUser(data.user)
                const { data: profileData } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()
                setProfile(profileData)
            }
        }
        loadUser()
    })

    const handlePredict = async () => {
        setIsLoading(true)
        setError(null)
        setResult(null)

        try {
            const response = await fetch("/api/predict", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    player1,
                    player2,
                    useDeepModel
                })
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.error || "Prediction API failed to respond.");
            }

            const data = await response.json()
            setResult(data)
        } catch (err: any) {
            setError(err.message || "Something went wrong.")
        } finally {
            setIsLoading(false)
        }
    }

    const renderPlayerInput = (num: number, player: PlayerStats, setPlayer: (p: PlayerStats) => void) => (
        <Card className={`relative overflow-hidden border ${num === 1 ? 'border-primary/20' : 'border-secondary/20'}`}>
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[64px] rounded-full opacity-20 pointer-events-none ${num === 1 ? 'bg-primary' : 'bg-secondary'}`} />
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <User className={num === 1 ? "text-primary" : "text-secondary"} />
                    Player {num}
                </CardTitle>
                <CardDescription>Enter physical metrics and experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Height (cm)</Label>
                        <Input
                            type="number"
                            value={player.height}
                            onChange={e => setPlayer({ ...player, height: Number(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Weight (kg)</Label>
                        <Input
                            type="number"
                            value={player.weight}
                            onChange={e => setPlayer({ ...player, weight: Number(e.target.value) })}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Age</Label>
                        <Input
                            type="number"
                            value={player.age}
                            onChange={e => setPlayer({ ...player, age: Number(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Experience (Years)</Label>
                        <Input
                            type="number"
                            value={player.experience}
                            onChange={e => setPlayer({ ...player, experience: Number(e.target.value) })}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="flex min-h-screen flex-col">
            <DashboardHeader user={user} profile={profile} />

            <main className="flex-1 space-y-8 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Match Predictor</h1>
                    <p className="text-muted-foreground mt-1">
                        Simulate a face-off between two athletes using our heuristic modeling or deep AI.
                    </p>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
                    <div className="space-y-0.5">
                        <Label className="text-base flex items-center gap-2">
                            <BrainCircuit className={useDeepModel ? "text-primary" : "text-muted-foreground"} size={18} />
                            Enable Deep Learning
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Pass inputs through the trained neural network instead of the quick heuristic rules engine.
                        </p>
                    </div>
                    <Switch checked={useDeepModel} onCheckedChange={setUseDeepModel} />
                </div>

                <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
                    {renderPlayerInput(1, player1, setPlayer1)}

                    <div className="flex flex-col items-center justify-center p-4">
                        <div className="h-16 w-[1px] bg-gradient-to-b from-transparent via-border to-transparent hidden md:block" />
                        <div className="bg-muted text-muted-foreground w-12 h-12 rounded-full flex items-center justify-center my-4 font-bold border-2 border-background z-10 shadow-lg shadow-black/20">
                            VS
                        </div>
                        <div className="h-16 w-[1px] bg-gradient-to-b from-transparent via-border to-transparent hidden md:block" />
                    </div>

                    {renderPlayerInput(2, player2, setPlayer2)}
                </div>

                <div className="flex justify-center py-4">
                    <Button
                        size="lg"
                        className="w-full md:w-auto md:min-w-64 h-14 text-lg gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all"
                        onClick={handlePredict}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Activity className="animate-spin" />
                        ) : (
                            <Swords />
                        )}
                        {isLoading ? "Simulating Match..." : "Simulate Match"}
                    </Button>
                </div>

                {error && (
                    <div className="p-4 bg-destructive/20 text-destructive border border-destructive/50 rounded-lg text-center">
                        {error}
                    </div>
                )}

                {result && (
                    <Card className="overflow-hidden border-t-4 border-t-primary animate-in slide-in-from-bottom-4 fade-in duration-500">
                        <CardHeader className="text-center pb-2">
                            <CardDescription className="uppercase tracking-widest font-bold text-primary flex items-center justify-center gap-2">
                                <Bot size={16} /> {result.mode} Prediction
                            </CardDescription>
                            <CardTitle className="text-3xl mt-2">{result.fairness}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center space-y-6">

                                <div className="text-center space-y-2">
                                    <p className="text-muted-foreground text-sm uppercase tracking-wider">Predicted Winner</p>
                                    <h3 className={`text-4xl font-black ${result.dominance.player === "Player 1" ? "text-primary" : "text-secondary"}`}>
                                        {result.dominance.player}
                                    </h3>
                                </div>

                                <div className="w-full max-w-xl space-y-3">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span className="text-primary">Player 1</span>
                                        <span className="text-muted-foreground">{result.dominance.player === "Player 1" ? result.dominance.probability : (100 - result.dominance.probability).toFixed(2)}% Confidence</span>
                                        <span className="text-secondary">Player 2</span>
                                    </div>

                                    {/* Custom split progress bar */}
                                    <div className="h-4 w-full bg-secondary/30 rounded-full overflow-hidden flex">
                                        <div
                                            className={`h-full bg-primary transition-all duration-1000 ease-out`}
                                            style={{ width: `${result.dominance.player === "Player 1" ? result.dominance.probability : 100 - result.dominance.probability}%` }}
                                        />
                                        <div className="h-full bg-secondary flex-1" />
                                    </div>
                                </div>

                            </div>
                        </CardContent>
                    </Card>
                )}

            </main>
        </div>
    )
}
