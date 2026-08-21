import type { Metadata } from "next"
import Link from "next/link"
import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCurrentUserAddresses } from "@/lib/data/customer"

export const metadata: Metadata = {
  title: "My Addresses",
  robots: { index: false, follow: false },
}

export default async function AccountAddressesPage() {
  const addresses = await getCurrentUserAddresses()

  return (
    <div>
      {addresses.length === 0 ? (
        <div className="bg-card flex flex-col items-center gap-3 rounded-3xl border p-10 text-center">
          <span className="bg-muted grid size-14 place-items-center rounded-full">
            <MapPin className="text-muted-foreground size-6" aria-hidden="true" />
          </span>
          <h2 className="font-semibold">No saved addresses</h2>
          <p className="text-muted-foreground max-w-sm text-sm">
            Save the addresses you deliver to most so checkout is even faster. Addresses are only
            ever visible on your own account.
          </p>
          <Button asChild className="mt-2">
            <Link href="/products">Start an order</Link>
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <li key={address.id} className="bg-card flex flex-col gap-1 rounded-3xl border p-5">
              <span className="font-semibold">{address.label}</span>
              <span className="text-muted-foreground text-sm">
                {address.addressLine}, {address.area}, {address.city}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}