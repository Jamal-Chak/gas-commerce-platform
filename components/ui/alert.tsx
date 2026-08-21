import * as React from "react"
import { CircleAlert, CircleCheck, Info } from "lucide-react"
import { cn } from "@/lib/utils"

type AlertVariant = "info" | "success" | "warning" | "destructive"

const variantStyles: Record<AlertVariant, string> = {
  info: "border-sky-500/30 bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-200",
  success:
    "border-emerald-500/30 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
  warning:
    "border-amber-500/30 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
  destructive: "border-destructive/30 bg-destructive/5 text-destructive",
}

const variantIcons: Record<AlertVariant, typeof Info> = {
  info: Info,
  success: CircleCheck,
  warning: CircleAlert,
  destructive: CircleAlert,
}

interface AlertProps extends React.ComponentProps<"div"> {
  variant?: AlertVariant
  title?: string
}

/**
 * Accessible inline notice used for loading/error/empty/success messaging.
 * `role="alert"` is used for errors so screen readers announce them.
 */
function Alert({ variant = "info", title, children, className, ...props }: AlertProps) {
  const Icon = variantIcons[variant]
  return (
    <div
      data-slot="alert"
      role={variant === "destructive" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-xl border p-4 text-sm", variantStyles[variant], className)}
      {...props}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? (
          <div className={cn(title ? "mt-1 text-sm/relaxed opacity-90" : "opacity-90")}>
            {children}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export { Alert }
export type { AlertVariant }
