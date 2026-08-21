import { z } from 'zod';
import { CylinderSize, ServiceType } from '../domain/types';

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  cylinderSize: z.nativeEnum(CylinderSize).optional(),
  serviceType: z.nativeEnum(ServiceType),
  price: z.number().nullable().optional(),
  salePrice: z.number().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  inventoryTracked: z.boolean().optional(),
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
