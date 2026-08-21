"use client"

import { useEffect } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Root error boundary. Never reveal stack traces, SQL errors or internal
 * details to the user — keep the message friendly and generic.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Report to the logging/monitoring service in production.
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
          <span className="bg-destructive/10 text-destructive grid size-16 place-items-center rounded-full">
            <RefreshCw className="size-8" aria-hidden="true" />
          </span>
          <h1 className="text-3xl font-semibold tracking-tight">
            Something went wrong
          </h1>
          <p className="text-muted-foreground max-w-md text-sm">
            We hit an unexpected problem. Please try again — if it keeps happening,
            that reference code is {error.digest ?? "unknown"}.
          </p>
          <Button size="lg" onClick={reset} className="mt-2">
            Try again
          </Button>
        </div>
      </body>
    </html>
  )
}