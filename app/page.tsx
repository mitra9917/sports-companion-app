import { Button } from "@/components/ui/button"
import { Activity, TrendingUp, Target, Award } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">Sports Companion</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-background via-muted/20 to-primary/5 px-6 py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-balance text-5xl font-bold tracking-tight md:text-6xl">
              Your Complete <span className="text-primary">Fitness Companion</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground md:text-xl">
              Track workouts, monitor your BMI in real-time, set goals, and achieve peak performance with our
              comprehensive sports companion app.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/sign-up">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Your Journey
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="w-full bg-transparent sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-balance text-center text-3xl font-bold md:text-4xl">Everything You Need to Excel</h2>
            <p className="mx-auto mt-4 max-w-2xl text-balance text-center text-muted-foreground">
              Comprehensive tools designed for athletes of all levels
            </p>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Real-Time BMI Tracking</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Monitor your body metrics with detailed tracking and visualizations
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/10">
                  <Activity className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold">Workout Logging</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Track every session with detailed metrics and performance data
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
                  <Target className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-lg font-semibold">Goal Setting</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Set and achieve your fitness goals with progress tracking
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-chart-4/10">
                  <Award className="h-8 w-8 text-chart-4" />
                </div>
                <h3 className="text-lg font-semibold">Achievements</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Earn badges and celebrate milestones on your journey
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-primary/5 to-secondary/5 px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance text-3xl font-bold md:text-4xl">Ready to Transform Your Fitness?</h2>
            <p className="mt-4 text-balance text-lg text-muted-foreground">
              Join thousands of athletes already tracking their progress
            </p>
            <Link href="/auth/sign-up">
              <Button size="lg" className="mt-8">
                Get Started Free
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Sports Companion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
