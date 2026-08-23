import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

interface FormFieldProps {
  /** Visible label text. */
  label: string
  /** id of the control this label is associated with. */
  htmlFor?: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactElement
  className?: string
}

/**
 * Accessible form-field wrapper: renders a real <label>, injects
 * `id`/`aria-invalid`/`aria-describedby` onto the child control, and shows a
 * hint or an inline error message that screen readers announce.
 */
function FormField({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
  className,
}: FormFieldProps) {
  const childProps = (children as React.ReactElement<{ [key: string]: unknown }>).props
  const controlId = htmlFor ?? (typeof childProps.id === "string" ? childProps.id : undefined)
  const errorId = controlId ? `${controlId}-error` : undefined
  const hintId = controlId ? `${controlId}-hint` : undefined
  const describedBy = [error ? errorId : null, hint && !error ? hintId : null]
    .filter(Boolean)
    .join(" ") || undefined

  const ariaInvalid = error
    ? true
    : typeof childProps["aria-invalid"] === "boolean"
      ? childProps["aria-invalid"]
      : undefined

  const control = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<{ [key: string]: unknown }>, {
        id: controlId,
        "aria-invalid": ariaInvalid,
        "aria-describedby": describedBy,
      })
    : children

  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={controlId}>
        {label}
        {required ? (
          <span className="text-destructive" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </Label>
      {control}
      {hint && !error ? (
        <p id={hintId} className="text-muted-foreground text-xs">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-destructive text-xs font-medium">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export { FormField }
