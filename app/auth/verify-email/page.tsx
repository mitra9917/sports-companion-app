import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Activity, Mail } from "lucide-react"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background to-muted p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-balance text-2xl font-bold">Sports Companion</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-balance text-center text-2xl">Check your email</CardTitle>
            <CardDescription className="text-balance text-center">
              We&apos;ve sent you a verification link. Please check your email to activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="rounded-md bg-muted p-4 text-sm">
              <p className="font-medium">What&apos;s next?</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
                <li>Check your email inbox</li>
                <li>Click the verification link</li>
                <li>Start tracking your fitness journey</li>
              </ul>
            </div>
            <Link href="/auth/login" className="w-full">
              <Button variant="outline" className="w-full bg-transparent">
                Back to login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
