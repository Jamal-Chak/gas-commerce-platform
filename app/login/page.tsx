'use client'

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { FormField } from "@/components/ui/form-field"
import { loginSchema, type LoginValues } from "@/lib/validators/auth"
import { signInWithEmail } from "@/lib/auth/auth-service"
import { LogoLink } from "@/components/layout/logo"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    setSubmitting(true)
    try {
      const result = await signInWithEmail(values.email, values.password)
      if (!result.ok) {
        setError(result.message)
        return
      }
      router.push("/account")
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-14 sm:px-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <LogoLink />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Sign in to manage your orders and delivery details.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          {error ? (
            <Alert variant="destructive" title="Sign in failed">
              <p>{error}</p>
            </Alert>
          ) : null}

          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <FormField label="Email address" htmlFor="email" required error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register("email")}
              />
            </FormField>

            <div className="relative">
              <FormField
                label="Password"
                htmlFor="password"
                required
                error={errors.password?.message}
              >
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="At least 8 characters"
                  className="pr-11"
                  {...register("password")}
                />
              </FormField>
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="text-muted-foreground hover:text-foreground absolute top-[22px] right-1.5 grid size-9 place-items-center rounded-md focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
              </button>
            </div>

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-muted-foreground text-sm hover:underline focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:rounded-sm focus-visible:outline-none"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : <LogIn className="size-4" aria-hidden="true" />}
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="text-muted-foreground text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
