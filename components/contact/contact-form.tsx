'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert } from "@/components/ui/alert"
import { FormField } from "@/components/ui/form-field"

const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name."),
  email: z.string().email("Please enter a valid email address."),
  subject: z.string().min(2, "Please enter a subject."),
  message: z.string().min(10, "Please enter a message of at least 10 characters."),
})

type ContactValues = z.infer<typeof contactSchema>

/**
 * Contact form. Currently opens the visitor's email client addressed to the
 * configured business email (no backend is wired). Swap for a server action
 * when a contact/notification service is added.
 */
export function ContactForm({ email }: { email: string | null | undefined }) {
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  })

  const onSubmit = handleSubmit((values) => {
    if (!email) return
    const subject = encodeURIComponent(values.subject)
    const body = encodeURIComponent(`${values.message}\n\n— ${values.name} (${values.email})`)
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
    setSent(true)
  })

  if (!email) {
    return (
      <Alert variant="info" title="Contact email not configured">
        <p>
          A contact email will be available here once the business configuration is provided.
          Please check back soon.
        </p>
      </Alert>
    )
  }

  if (sent) {
    return (
      <Alert variant="success" title="Opening your email app">
        <p>
          Your email client should now be open with your message ready to send. If nothing
          happened, you can also reach us by phone.
        </p>
      </Alert>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormField label="Your name" htmlFor="contact-name" required error={errors.name?.message}>
        <Input id="contact-name" autoComplete="name" placeholder="Jane Moyo" {...register("name")} />
      </FormField>
      <FormField label="Your email" htmlFor="contact-email" required error={errors.email?.message}>
        <Input id="contact-email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
      </FormField>
      <FormField label="Subject" htmlFor="contact-subject" required error={errors.subject?.message}>
        <Input id="contact-subject" placeholder="How can we help?" {...register("subject")} />
      </FormField>
      <FormField label="Message" htmlFor="contact-message" required error={errors.message?.message}>
        <Textarea id="contact-message" rows={5} placeholder="Write your message…" {...register("message")} />
      </FormField>
      <Button type="submit" className="gap-2 sm:w-fit">
        <Send className="size-4" aria-hidden="true" />
        Send message
      </Button>
    </form>
  )
}