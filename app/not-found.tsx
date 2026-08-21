import Link from "next/link"
import { Flame } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
      <span className="bg-primary/10 text-primary grid size-16 place-items-center rounded-full">
        <Flame className="size-8" aria-hidden="true" />
      </span>
      <p className="text-primary font-semibold tracking-wide uppercase">404</p>
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground max-w-md text-sm">
        The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back
        to the good stuff — gas, delivered.
      </p>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/">Back to home</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/products">Browse gas products</Link>
        </Button>
      </div>
    </div>
  )
}