import { CylinderSize, ServiceType } from '../domain/types';

export interface CartLine {
  productId: string;
  name: string;
  slug: string;
  cylinderSize?: CylinderSize | null;
  serviceType: ServiceType;
  unitPrice: number | null;
  salePrice: number | null;
  imageUrl?: string | null;
  quantity: number;
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
}
