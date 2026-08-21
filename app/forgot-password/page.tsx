'use client'

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { FormField } from "@/components/ui/form-field"
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validators/auth"
import { sendPasswordReset } from "@/lib/auth/auth-service"
import { LogoLink } from "@/components/layout/logo"

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    setSuccess(null)
    setSubmitting(true)
    try {
      const result = await sendPasswordReset(values.email)
      if (!result.ok) {
        setError(result.message)
        return
      }
      setSuccess(result.message)
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-14 sm:px-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <LogoLink />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Forgot your password?</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Enter your email and we&apos;ll send you a link to reset it.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          {error ? (
            <Alert variant="destructive" title="Something went wrong">
              <p>{error}</p>
            </Alert>
          ) : null}
          {success ? (
            <Alert variant="success" title="Check your email">
              <p>{success}</p>
            </Alert>
          ) : null}

          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <FormField label="Email address" htmlFor="email" required error={errors.email?.message}>
              <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
            </FormField>

            <Button type="submit" className="w-full gap-2" disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
              {submitting ? "Sending…" : "Send reset link"}
            </Button>
          </form>

          <p className="text-muted-foreground text-center text-sm">
            Remembered it?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Back to sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}