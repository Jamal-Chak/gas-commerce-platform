'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { ReactNode } from "react"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getAuthStatus } from "@/lib/auth/auth-service"

type GuardState = "loading" | "not-configured" | "configured-anonymous" | "authenticated"

function AccountLoading() {
  return (
    <div className="grid gap-6" aria-hidden="true">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}

/**
 * Client-side guard for the account area. It checks the Supabase session and
 * redirects anonymous users to /login. Server-side session enforcement
 * (middleware/proxy + @supabase/ssr) must be added when authentication is
 * fully wired in production.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [state, setState] = useState<GuardState>("loading")

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const result = await getAuthStatus()
      if (cancelled) return
      if (result.status === "not-configured") setState("not-configured")
      else if (result.user) setState("authenticated")
      else setState("configured-anonymous")
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (state === "configured-anonymous") {
      router.replace("/login?next=/account")
    }
  }, [state, router])

  if (state === "loading" || state === "configured-anonymous") {
    return <AccountLoading />
  }

  if (state === "not-configured") {
    return (
      <div className="mx-auto max-w-md">
        <Alert variant="warning" title="Authentication is not configured yet">
          <p>
            The account area needs Supabase Auth to be connected. Please ask an administrator to
            set the Supabase environment variables, then refresh this page.
          </p>
          <Button asChild variant="outline" className="mt-3">
            <Link href="/">Back to home</Link>
          </Button>
        </Alert>
      </div>
    )
  }

  return children
}
