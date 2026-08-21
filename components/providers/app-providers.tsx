'use client';

import { ReactNode } from 'react';
import { BusinessConfigProvider } from './business-config-provider';
import { CartProvider } from './cart-provider';

/**
 * Composes the application-wide providers:
 *  - BusinessConfigProvider: centralized, configurable branding.
 *  - CartProvider: client-side shopping cart UI state.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BusinessConfigProvider>
      <CartProvider>{children}</CartProvider>
    </BusinessConfigProvider>
  );
}
