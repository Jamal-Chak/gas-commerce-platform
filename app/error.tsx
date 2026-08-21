"use client"

import { useEffect } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"

/**
 * Root app error boundary (keeps the header/footer layout intact).
 * Never reveal stack traces or internal errors to the user.
 */
export default function RootErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
      <Alert variant="destructive" title="Something went wrong" className="w-full text-left">
        <p>
          We hit an unexpected problem while loading this page. Please try again.{" "}
          {error.digest ? `(Reference: ${error.digest})` : null}
        </p>
      </Alert>
      <Button size="lg" onClick={reset} className="gap-2">
        <RefreshCw className="size-4" aria-hidden="true" />
        Try again
      </Button>
    </div>
  )
}