export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button"
import { Activity, TrendingUp, Target, Award, ArrowRight, Zap } from "lucide-react"
import Link from "next/link"

const featureCards = [
  {
    title: "Real-Time BMI Tracking",
    description: "Monitor your body metrics with clear trends and data points that update as you train.",
    icon: TrendingUp,
    tone: "text-primary",
  },
  {
    title: "Workout Logging",
    description: "Capture sessions, intensity, and duration so every training block is measurable.",
    icon: Activity,
    tone: "text-secondary",
  },
  {
    title: "Goal Setting",
    description: "Set milestones and track progress with structure that keeps you moving forward.",
    icon: Target,
    tone: "text-accent",
  },
  {
    title: "Achievements",
    description: "Celebrate streaks and progress markers that reinforce momentum.",
    icon: Award,
    tone: "text-chart-4",
  },
]

const particles = Array.from({ length: 28 }, (_, index) => ({
  id: index,
  style: {
    left: `${(index * 37) % 100}%`,
    top: `${(index * 23) % 100}%`,
    animationDelay: `${(index % 7) * 0.5}s`,
    animationDuration: `${6 + (index % 4) * 2}s`,
  },
}))

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="hero-atmosphere pointer-events-none absolute inset-0" />
      <div className="hero-glow hero-glow-top pointer-events-none absolute" />
      <div className="hero-glow hero-glow-bottom pointer-events-none absolute" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <span key={particle.id} className="particle-dot" style={particle.style} />
        ))}
      </div>

      <header className="relative z-20 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="shadow-glow-primary flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
              <Activity className="h-5 w-5 text-black" />
            </div>
            <span className="text-lg font-semibold tracking-wide text-white">Sports Companion</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="shadow-glow-primary bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        <section className="relative px-6 pb-16 pt-20 md:pb-24 md:pt-28">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs tracking-[0.2em] text-primary uppercase">
              <Zap className="h-3.5 w-3.5" />
              Performance-first fitness platform
            </div>

            <div className="ring-stage mx-auto mb-10">
              <div className="ring-layer ring-layer-1" />
              <div className="ring-layer ring-layer-2" />
              <div className="ring-layer ring-layer-3" />
            </div>

            <h1 className="text-balance text-5xl font-semibold tracking-tight text-white md:text-7xl">
              Train Smarter With
              <span className="ml-3 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Sports Companion
              </span>
            </h1>
            <p className="mx-auto mt-7 max-w-3xl text-balance text-lg leading-relaxed text-slate-300 md:text-xl">
              Track workouts, monitor BMI in real-time, set measurable goals, and build consistency with a dashboard
              designed for athletes and everyday performers.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/sign-up">
                <Button size="lg" className="shadow-glow-primary w-full sm:w-auto">
                  Start Your Journey <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
                >
                  Sign In
                </Button>
              </Link>
            </div>

            <div className="glass-panel mx-auto mt-14 max-w-3xl rounded-2xl p-6 md:p-8">
              <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
                {[
                  { label: "Workouts", value: "12K+" },
                  { label: "Active Goals", value: "4.8K" },
                  { label: "BMI Logs", value: "32K+" },
                  { label: "Athletes", value: "9.2K" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-xl font-semibold text-white md:text-2xl">{stat.value}</p>
                    <p className="text-xs tracking-wide text-slate-300 uppercase">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-balance text-center text-3xl font-semibold text-white md:text-4xl">
              Everything You Need to Excel
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-balance text-center text-slate-300">
              Comprehensive tools designed for athletes of all levels
            </p>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {featureCards.map((card) => (
                <div
                  key={card.title}
                  className="glass-panel hover-lift rounded-2xl border border-white/10 p-6 text-left transition-transform"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                    <card.icon className={`h-6 w-6 ${card.tone}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 pb-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="glass-panel rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-10">
              <h2 className="text-balance text-3xl font-semibold text-white md:text-4xl">
                Ready to Transform Your Fitness?
              </h2>
              <p className="mt-4 text-balance text-lg text-slate-300">
                Join thousands of athletes already tracking their progress
              </p>
              <Link href="/auth/sign-up">
                <Button size="lg" className="shadow-glow-primary mt-8">
                  Get Started Free <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-slate-400">
          <p>&copy; 2025 Sports Companion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
