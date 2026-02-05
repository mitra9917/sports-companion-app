"use client"

import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Activity, LogOut, Settings, User } from "lucide-react"
import { useRouter } from "next/navigation"

interface DashboardHeaderProps {
  user: any
  profile: any
}

export function DashboardHeader({ user, profile }: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const initials =
    profile?.full_name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() || "A"

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-black/40 border-b border-white/10">
      <div className="flex h-16 items-center justify-between px-6 md:px-8 lg:px-10">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/90 shadow-md">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            Sports Companion
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          <Link href="/dashboard/workouts">
            <Button variant="ghost" className="text-white/80 hover:text-white">
              Workouts
            </Button>
          </Link>
          <Link href="/dashboard/goals">
            <Button variant="ghost" className="text-white/80 hover:text-white">
              Goals
            </Button>
          </Link>
          <Link href="/dashboard/analytics">
            <Button variant="ghost" className="text-white/80 hover:text-white">
              Analytics
            </Button>
          </Link>
          <Link href="/dashboard/bmi">
            <Button variant="ghost" className="text-white/80 hover:text-white">
              BMI
            </Button>
          </Link>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full hover:bg-white/10"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="bg-black/80 backdrop-blur-xl border border-white/10 text-white"
            >
              <DropdownMenuLabel>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">
                    {profile?.full_name || "Athlete"}
                  </p>
                  <p className="text-xs text-white/60">{user.email}</p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="bg-white/10" />

              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/profile"
                  className="flex cursor-pointer items-center"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/settings"
                  className="flex cursor-pointer items-center"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-white/10" />

              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-red-400 focus:text-red-300"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  )
}
