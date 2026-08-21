import { Skeleton } from "@/components/ui/skeleton"

export default function RootLoading() {
  return (
    <div
      className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:px-8"
      aria-label="Loading page content"
    >
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-12 w-full max-w-md" />
          <Skeleton className="h-12 w-full max-w-md" />
          <Skeleton className="h-6 w-72" />
        </div>
        <Skeleton className="aspect-square w-full max-w-sm place-self-center rounded-4xl" />
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        <Skeleton className="h-52 rounded-4xl" />
        <Skeleton className="h-52 rounded-4xl" />
        <Skeleton className="h-52 rounded-4xl" />
      </div>
    </div>
  )
}