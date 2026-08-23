'use client';

import { Globe } from 'lucide-react';
import { useTranslation, LANGUAGES, type Locale } from '@/lib/i18n';

/**
 * Language switcher dropdown component.
 * Place in the site header or footer.
 */
export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();

  return (
    <div className="relative flex items-center gap-1.5">
      <Globe className="text-muted-foreground size-4" aria-hidden="true" />
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="bg-transparent text-muted-foreground cursor-pointer rounded border-0 p-0 text-xs focus:ring-0 focus:outline-none"
        aria-label="Select language"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeLabel}
          </option>
        ))}
      </select>
    </div>
  );
}
