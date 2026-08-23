'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { Product } from '@/lib/domain/types';
import { CartLine } from '@/lib/cart/types';

const STORAGE_KEY = 'ember-gas.cart';

export interface CartContextValue {
  lines: CartLine[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeLine: (productId: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within <CartProvider>');
  }
  return ctx;
}

function effectivePrice(line: Pick<CartLine, 'salePrice' | 'unitPrice'>): number {
  return line.salePrice ?? line.unitPrice ?? 0;
}

/**
 * Client-side cart. It is a pure UI concern:
 *  - persistence is best-effort `localStorage`,
 *  - totals shown here are NEVER trusted at checkout — the order service
 *    must recalculate everything from the database.
 */
function getInitialLines(): CartLine[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as CartLine[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(getInitialLines);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Best-effort persistence.
    }
  }, [lines]);

  const addToCart = useCallback((product: Product, quantity: number) => {
    setLines((current) => {
      const existing = current.find((line) => line.productId === product.id);
      if (existing) {
        return current.map((line) =>
          line.productId === product.id
            ? { ...line, quantity: Math.min(99, line.quantity + quantity) }
            : line
        );
      }
      const newLine: CartLine = {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        cylinderSize: product.cylinderSize,
        serviceType: product.serviceType,
        unitPrice: product.price ?? null,
        salePrice: product.salePrice ?? null,
        imageUrl: product.imageUrl ?? null,
        quantity,
      };
      return [...current, newLine];
    });
    setIsOpen(true);
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setLines((current) =>
      quantity <= 0
        ? current.filter((line) => line.productId !== productId)
        : current.map((line) =>
            line.productId === productId ? { ...line, quantity: Math.min(99, quantity) } : line
          )
    );
  }, []);

  const removeLine = useCallback((productId: string) => {
    setLines((current) => current.filter((line) => line.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const { itemCount, subtotal } = useMemo(() => {
    const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
    const subtotal = lines.reduce((sum, line) => sum + effectivePrice(line) * line.quantity, 0);
    return { itemCount, subtotal };
  }, [lines]);

  return (
    <CartContext.Provider
      value={{
        lines,
        isOpen,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeLine,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
