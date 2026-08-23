import { SkipForward } from 'lucide-react';
import Link from 'next/link';

/**
 * Skip to main content link for keyboard/screen reader users.
 * WCAG 2.1 Level A requirement — provides a way to bypass repeated content.
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="bg-primary text-primary-foreground focus:ring-ring absolute top-4 left-4 z-[100] -translate-y-20 rounded px-4 py-2 font-medium transition-transform focus:translate-y-0 focus:ring-2 focus:outline-none"
    >
      <SkipForward className="mr-2 inline size-4" aria-hidden="true" />
      Skip to main content
    </a>
  );
}
