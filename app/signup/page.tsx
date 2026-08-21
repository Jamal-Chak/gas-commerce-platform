'use client'

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { FormField } from "@/components/ui/form-field"
import { signupSchema, type SignupValues } from "@/lib/validators/auth"
import { signUpWithEmail } from "@/lib/auth/auth-service"
import { LogoLink } from "@/components/layout/logo"

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  })

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    setSuccess(null)
    setSubmitting(true)
    try {
      const result = await signUpWithEmail(values.fullName, values.email, values.password)
      if (!result.ok) {
        setError(result.message)
        return
      }
      if (result.message && result.message.includes("check your email")) {
        setSuccess(result.message)
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
          <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Track orders, save delivery addresses and check out faster.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          {error ? (
            <Alert variant="destructive" title="Sign up failed">
              <p>{error}</p>
            </Alert>
          ) : null}
          {success ? (
            <Alert variant="success" title="Account created">
              <p>{success}</p>
            </Alert>
          ) : null}

          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <FormField label="Full name" htmlFor="fullName" required error={errors.fullName?.message}>
              <Input id="fullName" autoComplete="name" placeholder="Jane Moyo" {...register("fullName")} />
            </FormField>
            <FormField label="Email address" htmlFor="email" required error={errors.email?.message}>
              <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
            </FormField>

            <div className="relative">
              <FormField label="Password" htmlFor="password" required error={errors.password?.message}>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
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

            <FormField
              label="Confirm password"
              htmlFor="confirmPassword"
              required
              error={errors.confirmPassword?.message}
            >
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Repeat your password"
                {...register("confirmPassword")}
              />
            </FormField>

            <Button type="submit" className="w-full gap-2" disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : <UserPlus className="size-4" aria-hidden="true" />}
              {submitting ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="text-muted-foreground text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}