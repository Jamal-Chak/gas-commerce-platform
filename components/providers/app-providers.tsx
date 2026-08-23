'use client';

import { ReactNode } from 'react';
import { BusinessConfigProvider } from './business-config-provider';
import { CartProvider } from './cart-provider';
import { I18nProvider } from '@/lib/i18n';

/**
 * Composes the application-wide providers:
 *  - I18nProvider: multi-language support (EN, AF, ZU, XH).
 *  - BusinessConfigProvider: centralized, configurable branding.
 *  - CartProvider: client-side shopping cart UI state.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <BusinessConfigProvider>
        <CartProvider>{children}</CartProvider>
      </BusinessConfigProvider>
    </I18nProvider>
  );
}
