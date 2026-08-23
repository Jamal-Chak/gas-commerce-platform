'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import type { Product } from '@/lib/domain/types';

interface WishlistButtonProps {
  product: Product;
}

/**
 * Heart toggle button for product cards/detail pages.
 * Uses localStorage to persist wishlist across sessions.
 */
export function WishlistButton({ product }: WishlistButtonProps) {
  const [isWished, setIsWished] = useState(() => {
    if (typeof window === 'undefined') return false;
    const list = JSON.parse(localStorage.getItem('wishlist') ?? '[]') as string[];
    return list.includes(product.id);
  });

  const toggle = () => {
    const list = JSON.parse(localStorage.getItem('wishlist') ?? '[]') as string[];
    const next = isWished ? list.filter((id) => id !== product.id) : [...list, product.id];
    localStorage.setItem('wishlist', JSON.stringify(next));
    setIsWished(!isWished);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-full p-2 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        className={`size-5 transition-colors ${
          isWished ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
        }`}
      />
    </button>
  );
}

/**
 * Get wishlist product IDs from localStorage.
 */
export function getWishlistIds(): string[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('wishlist') ?? '[]') as string[];
}
