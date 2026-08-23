'use client'

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  MapPin,
  ShoppingCart,
  Truck,
  User,
  Wallet,
  Banknote,
  Tag,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert } from "@/components/ui/alert"
import { FormField } from "@/components/ui/form-field"
import { useCart } from "@/components/providers/cart-provider"
import { useBusinessConfig } from "@/components/providers/business-config-provider"
import { checkoutSchema, type CheckoutValues } from "@/lib/validators/checkout"
import { getDeliveryZones } from "@/lib/data/delivery"
import { placeOrder } from "@/lib/orders/order-service"
import { formatCurrency, formatMinutes } from "@/lib/utils/format"
import { DeliveryZone } from "@/lib/domain/types"
import { validatePromoCode } from "@/lib/orders/payment-service"

export default function CheckoutPage() {
  const { lines, subtotal, clearCart } = useCart()
  const { currency } = useBusinessConfig()
  const router = useRouter()
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [zonesLoading, setZonesLoading] = useState(true)
  const [zonesError, setZonesError] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoMessage, setPromoMessage] = useState<string | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)
  const [applyingPromo, setApplyingPromo] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      contact: { fullName: "", phone: "", email: "" },
      delivery: {
        zoneId: "",
        addressLabel: "Home",
        addressLine: "",
        city: "",
        area: "",
        deliveryInstructions: "",
      },
      payment: { method: "cash_on_delivery" },
    },
  })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const result = await getDeliveryZones()
        if (!cancelled) setZones(result)
      } catch {
        if (!cancelled) setZonesError(true)
      } finally {
        if (!cancelled) setZonesLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const selectedZoneId = useWatch({
    control,
    name: "delivery.zoneId",
  })
  const selectedZone = useMemo(
    () => zones.find((zone) => zone.id === selectedZoneId) ?? null,
    [zones, selectedZoneId]
  )
  const deliveryFee = selectedZone?.deliveryFee ?? 0
  const discount = promoDiscount
  const total = subtotal + deliveryFee - discount

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6 lg:px-8">
        <span className="bg-muted grid size-16 place-items-center rounded-full">
          <ShoppingCart className="text-muted-foreground size-7" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">Your cart is empty</h1>
        <p className="text-muted-foreground max-w-md text-sm">
          Add a gas refill, cylinder exchange or new cylinder before checking out.
        </p>
        <Button asChild size="lg" className="mt-2">
          <Link href="/products">Browse gas products</Link>
        </Button>
      </div>
    )
  }

  const onSubmit = handleSubmit(async (values: CheckoutValues) => {
    setFormError(null)
    if (values.payment.method === "pay_online") {
      setFormError("Please select a specific payment method below.")
      return
    }
    if (!lines.length) {
      setFormError("Your cart is empty.")
      return
    }
    setSubmitting(true)
    try {
      const result = await placeOrder({
        lines,
        customer: values.contact,
        delivery: values.delivery,
        paymentMethod: values.payment.method as "cash_on_delivery" | "pay_on_delivery" | "pay_online",
        subtotal,
        deliveryFee,
        total,
      })
      if (!result.ok) {
        setFormError(result.message)
        return
      }
      clearCart()
      const demoParam = result.order.demo ? "?demo=1" : ""
      router.push(`/order/${result.order.id}${demoParam}`)
    } catch {
      setFormError("Something went wrong while creating your order. Please try again.")
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Link
        href="/cart"
        className="text-muted-foreground inline-flex items-center gap-1.5 text-sm hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:rounded-sm focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to cart
      </Link>

      <div className="mt-4 flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
        <p className="text-muted-foreground text-sm">
          A few details and your gas will be on its way.
        </p>
      </div>

      <Alert variant="info" className="mt-6" title="Demo mode">
        <p>
          Order placement is currently in demo mode until the order service is connected. No real
          order is created and no payment is taken.
        </p>
      </Alert>

      <form
        onSubmit={onSubmit}
        noValidate
        className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_340px]"
      >
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="text-primary size-5" aria-hidden="true" />
                Your details
              </CardTitle>
              <CardDescription>Who we should contact about this order.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Full name"
                htmlFor="fullName"
                required
                error={errors.contact?.fullName?.message}
                className="sm:col-span-2"
              >
                <Input
                  id="fullName"
                  placeholder="Jane Moyo"
                  autoComplete="name"
                  {...register("contact.fullName")}
                />
              </FormField>
              <FormField
                label="Phone number"
                htmlFor="phone"
                required
                error={errors.contact?.phone?.message}
              >
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+27 82 000 0000"
                  autoComplete="tel"
                  {...register("contact.phone")}
                />
              </FormField>
              <FormField
                label="Email address"
                htmlFor="email"
                required
                error={errors.contact?.email?.message}
              >
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...register("contact.email")}
                />
              </FormField>
            </CardContent>
          </Card>


          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="text-primary size-5" aria-hidden="true" />
                Delivery address
              </CardTitle>
              <CardDescription>Where we should deliver your gas.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Delivery zone"
                htmlFor="zoneId"
                required
                hint={zonesLoading ? "Loading delivery zones…" : undefined}
                error={
                  errors.delivery?.zoneId?.message ||
                  (zonesError ? "Unable to load delivery zones." : undefined)
                }
                className="sm:col-span-2"
              >
                <Select
                  id="zoneId"
                  disabled={zonesLoading || zonesError || zones.length === 0}
                  {...register("delivery.zoneId")}
                >
                  <option value="">
                    {zonesLoading ? "Loading zones…" : "Choose your zone"}
                  </option>
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} — {formatCurrency(zone.deliveryFee, currency ?? "USD")} · approx.{" "}
                      {formatMinutes(zone.estimatedMinutes)}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField
                label="Address label"
                htmlFor="addressLabel"
                required
                error={errors.delivery?.addressLabel?.message}
              >
                <Input id="addressLabel" placeholder="Home" {...register("delivery.addressLabel")} />
              </FormField>
              <FormField
                label="Street address"
                htmlFor="addressLine"
                required
                error={errors.delivery?.addressLine?.message}
                className="sm:col-span-2"
              >
                <Input
                  id="addressLine"
                  placeholder="123 Example Street, Plot 4"
                  autoComplete="street-address"
                  {...register("delivery.addressLine")}
                />
              </FormField>
              <FormField label="City" htmlFor="city" required error={errors.delivery?.city?.message}>
                <Input
                  id="city"
                  placeholder="City"
                  autoComplete="address-level2"
                  {...register("delivery.city")}
                />
              </FormField>
              <FormField label="Area / suburb" htmlFor="area" required error={errors.delivery?.area?.message}>
                <Input id="area" placeholder="Area or suburb" {...register("delivery.area")} />
              </FormField>
              <FormField
                label="Delivery instructions (optional)"
                htmlFor="deliveryInstructions"
                hint="Gate codes, landmarks, preferred delivery times…"
                className="sm:col-span-2"
              >
                <Textarea
                  id="deliveryInstructions"
                  {...register("delivery.deliveryInstructions")}
                />
              </FormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="text-primary size-5" aria-hidden="true" />
                Payment method
              </CardTitle>
              <CardDescription>Choose how you would like to pay.</CardDescription>
            </CardHeader>
            <CardContent>
              <Controller
                control={control}
                name="payment.method"
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    aria-label="Payment method"
                  >
                    <Label
                      htmlFor="cash-on-delivery"
                      className="border-input hover:bg-muted/50 flex cursor-pointer items-start gap-3 rounded-2xl border p-4"
                    >
                      <RadioGroupItem id="cash-on-delivery" value="cash_on_delivery" />
                      <span className="grid gap-0.5">
                        <span className="flex items-center gap-2 font-medium">
                          <Banknote className="size-4" aria-hidden="true" />
                          Cash on Delivery
                        </span>
                        <span className="text-muted-foreground text-sm">
                          Pay cash when your gas is delivered to your door.
                        </span>
                      </span>
                    </Label>
                    <Label
                      htmlFor="payfast"
                      className="border-input hover:bg-muted/50 flex cursor-pointer items-start gap-3 rounded-2xl border p-4"
                    >
                      <RadioGroupItem id="payfast" value="payfast" />
                      <span className="grid gap-0.5">
                        <span className="flex items-center gap-2 font-medium">
                          <CreditCard className="size-4" aria-hidden="true" />
                          PayFast — Card & Instant EFT
                        </span>
                        <span className="text-muted-foreground text-sm">
                          Visa, Mastercard, or instant bank transfer. Secure & immediate.
                        </span>
                      </span>
                    </Label>
                    <Label
                      htmlFor="ozow"
                      className="border-input hover:bg-muted/50 flex cursor-pointer items-start gap-3 rounded-2xl border p-4"
                    >
                      <RadioGroupItem id="ozow" value="ozow" />
                      <span className="grid gap-0.5">
                        <span className="flex items-center gap-2 font-medium">
                          <Wallet className="size-4" aria-hidden="true" />
                          Ozow — Instant EFT
                        </span>
                        <span className="text-muted-foreground text-sm">
                          Direct bank transfer. No card needed, approved in seconds.
                        </span>
                      </span>
                    </Label>
                  </RadioGroup>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <aside className="flex flex-col gap-4">
          <Card className="sticky top-24 gap-5 p-6">
            <CardContent className="flex flex-col gap-4 p-0">
              <h2 className="text-lg font-semibold">Order summary</h2>
              <ul className="flex flex-col gap-3 text-sm">
                {lines.map((line) => (
                  <li key={line.productId} className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block font-medium">{line.name}</span>
                      <span className="text-muted-foreground text-xs">Qty {line.quantity}</span>
                    </span>
                    <span className="font-medium tabular-nums">
                      {formatCurrency((line.salePrice ?? line.unitPrice ?? 0) * line.quantity, currency ?? "USD")}
                    </span>
                  </li>
                ))}
              </ul>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium tabular-nums">
                  {formatCurrency(subtotal, currency ?? "USD")}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Delivery fee</span>
                <span className="font-medium tabular-nums">
                  {selectedZone ? formatCurrency(deliveryFee, currency ?? "ZAR") : "Select a zone"}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-600 flex items-center gap-1">
                    <Tag className="size-3" /> Promo discount
                  </span>
                  <span className="text-emerald-600 font-medium tabular-nums">
                    -{formatCurrency(discount, currency ?? "ZAR")}
                  </span>
                </div>
              )}
              {selectedZone?.estimatedMinutes ? (
                <p className="text-muted-foreground text-xs">
                  Estimated delivery: approx. {formatMinutes(selectedZone.estimatedMinutes)}
                </p>
              ) : null}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-semibold tabular-nums">
                  {formatCurrency(total, currency ?? "ZAR")}
                </span>
              </div>
              {/* Promo code */}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => { setPromoCode(e.target.value); setPromoError(null); setPromoMessage(null); }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={applyingPromo || !promoCode.trim()}
                    onClick={async () => {
                      setApplyingPromo(true);
                      setPromoError(null);
                      setPromoMessage(null);
                      const result = await validatePromoCode(promoCode.trim(), subtotal + deliveryFee);
                      if (result.valid) {
                        setPromoDiscount(result.discount);
                        setPromoMessage(result.message);
                      } else {
                        setPromoDiscount(0);
                        setPromoError(result.message);
                      }
                      setApplyingPromo(false);
                    }}
                  >
                    {applyingPromo ? <Loader2 className="size-3.5 animate-spin" /> : "Apply"}
                  </Button>
                </div>
                {promoMessage && <p className="text-emerald-600 text-xs">{promoMessage}</p>}
                {promoError && <p className="text-destructive text-xs">{promoError}</p>}
              </div>
              <p className="text-muted-foreground text-xs">
                Prices are recalculated and confirmed by our system when you place the order.
              </p>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full gap-2" disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            {submitting ? "Placing order…" : "Place order"}
          </Button>

          {formError ? (
            <Alert variant="destructive" title="We couldn't place your order">
              <p>{formError}</p>
            </Alert>
          ) : null}
        </aside>
      </form>
    </div>
  )
}
