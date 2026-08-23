import { ServiceType } from '../domain/types';

/**
 * Formats a monetary amount using the business currency. Used only for
 * DISPLAY — prices shown to customers are never treated as authoritative;
 * the server/database remains the source of truth for order totals.
 */
export function formatCurrency(amount: number | null | undefined, currency = 'USD'): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return '—';
  }
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
    }).format(amount);
  } catch {
    return `${amount}`;
  }
}

export function formatServiceLabel(serviceType: ServiceType): string {
  switch (serviceType) {
    case ServiceType.REFILL:
      return 'Gas Refill';
    case ServiceType.EXCHANGE:
      return 'Cylinder Exchange';
    case ServiceType.NEW_CYLINDER:
      return 'New Cylinder';
    default:
      return serviceType;
  }
}

export function formatServiceShortLabel(serviceType: ServiceType): string {
  switch (serviceType) {
    case ServiceType.REFILL:
      return 'Refill';
    case ServiceType.EXCHANGE:
      return 'Exchange';
    case ServiceType.NEW_CYLINDER:
      return 'New cylinder';
    default:
      return serviceType;
  }
}

export function formatCylinderSize(size: string | null | undefined): string {
  return size ?? '—';
}

export function formatMinutes(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) return '—';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
  return `${hours} hr ${mins} min`;
}
