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

export type PaymentMethod = "pay_on_delivery" | "pay_online" | "payfast" | "ozow" | "yoco" | "snapscan" | "zapper" | "cash_on_delivery";

// ── Real-Time Tracking ──────────────────────────────────────

export interface OrderStatusEvent {
  id: string;
  orderId: string;
  status: OrderStatus;
  previousStatus?: OrderStatus | null;
  changedByName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  note?: string | null;
  createdAt: string;
}

export interface DriverLocation {
  latitude: number;
  longitude: number;
  driverName?: string | null;
  driverPhone?: string | null;
  updatedAt?: string | null;
}

export interface OrderNotification {
  id: string;
  orderId: string;
  channel: 'email' | 'sms' | 'whatsapp' | 'push' | 'in_app';
  type: string;
  title: string;
  body?: string | null;
  data?: Record<string, unknown>;
  sentAt?: string | null;
  readAt?: string | null;
  createdAt: string;
}

// ── Subscriptions ───────────────────────────────────────────

export interface Subscription {
  id: string;
  customerId: string;
  productId: string;
  productName?: string | null;
  addressId?: string | null;
  intervalDays: number;
  nextDeliveryDate: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  lastOrderId?: string | null;
  createdAt: string;
}

// ── Payments ────────────────────────────────────────────────

export type PaymentProviderType = 'payfast' | 'ozow' | 'yoco' | 'snapscan' | 'zapper' | 'cash_on_delivery' | 'manual';

export interface PaymentProviderConfig {
  provider: PaymentProviderType;
  enabled: boolean;
  displayName: string;
  icon?: string | null;
  description?: string | null;
}

// ── Admin ───────────────────────────────────────────────────

export type UserRole = 'customer' | 'driver' | 'admin' | 'super_admin';

export interface Driver {
  id: string;
  fullName: string;
  phone: string;
  vehicleType?: string | null;
  vehicleRegistration?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isOnline: boolean;
  isActive: boolean;
}

// ── Cylinder Deposits ───────────────────────────────────────

export interface CylinderDeposit {
  id: string;
  customerId: string;
  cylinderSizeKg: number;
  quantity: number;
  depositAmount: number;
  depositPaidAt: string;
  returnedAt?: string | null;
  refundAmount?: number | null;
  orderId?: string | null;
  notes?: string | null;
}

// ── Load Shedding ───────────────────────────────────────────

export interface LoadSheddingStage {
  areaCode: string;
  areaName: string;
  stage: number;
  currentlyInLoadShedding: boolean;
  nextStageChange?: string | null;
  scheduleData?: Record<string, unknown>;
}

// ── Loyalty ─────────────────────────────────────────────────

export interface LoyaltyBalance {
  points: number;
  lifetimePoints: number;
  pointsPerRandSpent: number;
  referralBonusPoints: number;
  minRedemptionPoints: number;
}

export interface LoyaltyTransaction {
  id: string;
  points: number;
  type: 'earned' | 'redeemed' | 'bonus' | 'expired' | 'referral';
  description?: string | null;
  orderId?: string | null;
  createdAt: string;
}

// ── Reviews ─────────────────────────────────────────────────

export interface ProductReview {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number;
  title?: string | null;
  body?: string | null;
  isVerifiedPurchase: boolean;
  adminReply?: string | null;
  createdAt: string;
}

// ── Promo Codes ─────────────────────────────────────────────

export interface PromoCode {
  id: string;
  code: string;
  description?: string | null;
  type: 'percentage' | 'fixed' | 'free_delivery';
  scope: 'cart' | 'product' | 'category' | 'delivery';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usageCount: number;
  expiresAt?: string | null;
  active: boolean;
}

export interface PromoValidation {
  valid: boolean;
  promo?: PromoCode | null;
  discount?: number | null;
  message?: string | null;
}

// ── Referrals ───────────────────────────────────────────────

export interface ReferralInfo {
  code: string;
  totalReferrals: number;
  completedReferrals: number;
  totalPointsEarned: number;
}
