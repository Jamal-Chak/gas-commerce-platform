import type { Metadata } from "next"
import { Mail, Phone, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getCurrentCustomerProfile } from "@/lib/data/customer"

export const metadata: Metadata = {
  title: "My Profile",
  robots: { index: false, follow: false },
}

export default async function AccountProfilePage() {
  const profile = await getCurrentCustomerProfile()

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="text-primary size-5" aria-hidden="true" />
            Profile
          </CardTitle>
          <CardDescription>Your personal details, used for orders and delivery.</CardDescription>
        </CardHeader>
        <CardContent>
          {profile ? (
            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Full name</dt>
                <dd className="font-medium">{profile.fullName}</dd>
              </div>
              {profile.phone ? (
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground flex items-center gap-2">
                    <Phone className="size-4" aria-hidden="true" /> Phone
                  </dt>
                  <dd className="font-medium">{profile.phone}</dd>
                </div>
              ) : null}
              {profile.email ? (
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground flex items-center gap-2">
                    <Mail className="size-4" aria-hidden="true" /> Email
                  </dt>
                  <dd className="font-medium">{profile.email}</dd>
                </div>
              ) : null}
            </dl>
          ) : (
            <div className="flex flex-col gap-2 py-4">
              <p className="font-medium">Your profile isn&apos;t connected yet</p>
              <p className="text-muted-foreground text-sm">
                Once your account is linked to our system, your name, phone and email will appear
                here. No other customer&apos;s information is ever shown.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Security</CardTitle>
          <CardDescription>How you sign in and protect your account.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <p className="text-muted-foreground">
            Passwords are managed securely by the authentication provider. We never store your
            password in our database.
          </p>
          <Separator />
          <p className="text-muted-foreground">
            For account security changes (email, phone, or deletion), contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}