'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { en, type TranslationKeys } from './translations/en';
import { af } from './translations/af';
import { zu } from './translations/zu';
import { xh } from './translations/xh';

export type Locale = 'en' | 'af' | 'zu' | 'xh';

export interface LanguageOption {
  code: Locale;
  label: string;
  nativeLabel: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'af', label: 'Afrikaans', nativeLabel: 'Afrikaans' },
  { code: 'zu', label: 'Zulu', nativeLabel: 'isiZulu' },
  { code: 'xh', label: 'Xhosa', nativeLabel: 'isiXhosa' },
];

const translations: Record<Locale, TranslationKeys> = { en, af, zu, xh };

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKeys;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  setLocale: () => {},
  t: en,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('locale') as Locale | null;
      if (saved && translations[saved]) return saved;
    }
    return 'en';
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
      document.documentElement.lang = newLocale;
    }
  }, []);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Hook to access translations.
 * Usage: const { t, locale, setLocale } = useTranslation();
 * Then: t.hero.title, t.nav.home, etc.
 */
export function useTranslation() {
  return useContext(I18nContext);
}
