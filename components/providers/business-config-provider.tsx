'use client';

import { createContext, useContext, useMemo } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { BusinessConfig } from '@/lib/domain/types';
import { getBusinessConfig } from '@/lib/config/business';

const BusinessConfigContext = createContext<BusinessConfig | null>(null);

export function useBusinessConfig(): BusinessConfig {
  const config = useContext(BusinessConfigContext);
  if (!config) {
    throw new Error('useBusinessConfig must be used within <BusinessConfigProvider>');
  }
  return config;
}

/**
 * Provides the centralized business identity to every component that needs
 * branding (header, footer, contact info, currency, …).
 *
 * The brand is loaded from `getBusinessConfig()` (environment variables with
 * a temporary demo fallback; later the `business_settings` table). When the
 * client provides the real identity, it replaces the demo values WITHOUT
 * changing any component code.
 *
 * Brand colors are injected as CSS variables so the whole theme re-tints
 * through the existing Tailwind tokens.
 */
export function BusinessConfigProvider({ children }: { children: ReactNode }) {
  const config = useMemo(() => getBusinessConfig(), []);

  const themeStyle = useMemo(() => {
    const style: CSSProperties = {};
    if (config.primaryColor) {
      (style as Record<string, string>)['--primary'] = config.primaryColor;
    }
    if (config.secondaryColor) {
      (style as Record<string, string>)['--secondary'] = config.secondaryColor;
    }
    return style;
  }, [config.primaryColor, config.secondaryColor]);

  return (
    <BusinessConfigContext.Provider value={config}>
      <div style={themeStyle} className="flex min-h-full flex-col">
        {children}
      </div>
    </BusinessConfigContext.Provider>
  );
}
