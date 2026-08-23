import { z } from 'zod';

export const contactSchema = z.object({
  fullName: z.string().min(2, 'Please enter your full name.'),
  phone: z
    .string()
    .min(7, 'Please enter a valid phone number.')
    .regex(/^[+\d][\d\s-]{6,}$/, 'Please enter a valid phone number.'),
  email: z.string().email('Please enter a valid email address.'),
});

export const deliverySchema = z.object({
  zoneId: z.string().min(1, 'Please choose a delivery zone.'),
  addressLabel: z.string().min(2, 'Give this address a short label, e.g. "Home".'),
  addressLine: z.string().min(5, 'Please enter your street address.'),
  city: z.string().min(2, 'Please enter your city.'),
  area: z.string().min(2, 'Please enter your area or suburb.'),
  deliveryInstructions: z.string().optional(),
});

export const paymentSchema = z.object({
  method: z.enum(['pay_on_delivery', 'pay_online', 'cash_on_delivery', 'payfast', 'ozow', 'yoco', 'snapscan', 'zapper'], {
    message: 'Please choose a payment method.',
  }),
});

export const checkoutSchema = z.object({
  contact: contactSchema,
  delivery: deliverySchema,
  payment: paymentSchema,
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;
export type ContactValues = z.infer<typeof contactSchema>;
export type DeliveryValues = z.infer<typeof deliverySchema>;
export type PaymentValues = z.infer<typeof paymentSchema>;
