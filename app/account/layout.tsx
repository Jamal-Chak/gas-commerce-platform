import { ReactNode } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { AccountNav } from "@/components/account/account-nav"

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">My account</h1>
      <AuthGuard>
        <div className="mt-6 grid items-start gap-8 lg:grid-cols-[220px_1fr]">
          <AccountNav />
          <div className="min-w-0">{children}</div>
        </div>
      </AuthGuard>
    </div>
  )
}