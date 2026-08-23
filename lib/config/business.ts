import { BusinessConfig } from '../domain/types';

/**
 * Temporary/demo business identity used ONLY until the client provides the
 * real company name, logo, colors, and contact details.
 *
 * Every value here is overridable through environment variables (see
 * `.env.example`). Nothing is hard-coded into page components — always go
 * through `getBusinessConfig()` so branding stays centralized.
 *
 * IMPORTANT: process.env is accessed with literal property names (not
 * dynamic bracket notation) so Next.js can inline NEXT_PUBLIC_* values
 * into the client bundle at compile time.
 */
export const demoBusinessConfig: BusinessConfig = {
  companyName: 'Ember Gas',
  logoUrl: null,
  tagline: 'Gas refills, cylinder exchanges and new cylinders — delivered to your door.',
  primaryColor: '#f97316',
  secondaryColor: '#1e293b',
  phone: null,
  email: null,
  address: null,
  currency: 'USD',
  whatsapp: null,
  socialLinks: null,
};

// Loads business configuration from environment variables or returns nulls.
export function loadBusinessConfigFromEnv(): BusinessConfig {
  return {
    companyName: process.env.NEXT_PUBLIC_BIZ_NAME?.trim() || null,
    logoUrl: process.env.NEXT_PUBLIC_BIZ_LOGO?.trim() || null,
    tagline: process.env.NEXT_PUBLIC_BIZ_TAGLINE?.trim() || null,
    primaryColor: process.env.NEXT_PUBLIC_BIZ_PRIMARY_COLOR?.trim() || null,
    secondaryColor: process.env.NEXT_PUBLIC_BIZ_SECONDARY_COLOR?.trim() || null,
    phone: process.env.NEXT_PUBLIC_BIZ_PHONE?.trim() || null,
    email: process.env.NEXT_PUBLIC_BIZ_EMAIL?.trim() || null,
    address: process.env.NEXT_PUBLIC_BIZ_ADDRESS?.trim() || null,
    currency: process.env.NEXT_PUBLIC_BIZ_CURRENCY?.trim() || null,
    whatsapp: process.env.NEXT_PUBLIC_BIZ_WHATSAPP?.trim() || null,
    socialLinks: null,
  };
}

/**
 * Merges environment overrides with the temporary demo identity so the app
 * always has a complete, coherent brand. When the real client identity is
 * provided it is supplied via environment variables (or later the
 * `business_settings` table) and automatically replaces the demo values.
 */
export function getBusinessConfig(): BusinessConfig {
  const fromEnv = loadBusinessConfigFromEnv();
  const merged: BusinessConfig = { ...demoBusinessConfig };
  for (const key of Object.keys(fromEnv) as (keyof BusinessConfig)[]) {
    const value = fromEnv[key];
    if (value !== null && value !== undefined && value !== '') {
      (merged as Record<string, unknown>)[key] = value;
    }
  }
  return merged;
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000';
