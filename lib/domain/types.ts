export enum ServiceType {
  REFILL = 'REFILL',
  EXCHANGE = 'EXCHANGE',
  NEW_CYLINDER = 'NEW_CYLINDER',
}

export enum CylinderSize {
  KG6 = '6KG',
  KG9 = '9KG',
  KG14 = '14KG',
  KG19 = '19KG',
  KG48 = '48KG',
}

export enum CylinderState {
  FULL = 'FULL',
  EMPTY = 'EMPTY',
  RESERVED = 'RESERVED',
  SOLD = 'SOLD',
  AVAILABLE_FOR_EXCHANGE = 'AVAILABLE_FOR_EXCHANGE',
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  cylinderSize?: CylinderSize | null;
  serviceType: ServiceType;
  price?: number | null;
  salePrice?: number | null;
  imageUrl?: string | null;
  inventoryTracked?: boolean;
  active?: boolean;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Cylinder {
  id: string;
  serialNumber?: string;
  size: CylinderSize;
  state: CylinderState;
  location?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type Currency = string;

export interface BusinessConfig {
  companyName?: string | null;
  logoUrl?: string | null;
  tagline?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  currency?: Currency | null;
  whatsapp?: string | null;
  socialLinks?: Record<string, string> | null;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  DISPATCHED = 'dispatched',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  cylinderSize?: CylinderSize | null;
}

export interface Order {
  id: string;
  customerId?: string | null;
  items: OrderItem[];
  subtotal: number;
  deliveryFee?: number | null;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryAddressId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  description?: string | null;
  deliveryFee: number;
  estimatedMinutes: number;
  active?: boolean;
}

export interface Address {
  id: string;
  label: string;
  addressLine: string;
  city: string;
  area: string;
  deliveryInstructions?: string | null;
}

export interface CustomerProfile {
  id: string;
  fullName: string;
  phone?: string | null;
  email?: string | null;
}

export type PaymentMethod = "pay_on_delivery" | "pay_online";
