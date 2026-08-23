import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CookieConsent } from '@/components/ui/cookie-consent';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('CookieConsent', () => {
  it('shows banner when no consent given', () => {
    localStorageMock.clear();
    render(<CookieConsent />);
    expect(screen.getByText(/we value your privacy/i)).toBeInTheDocument();
  });

  it('does not show when already accepted', () => {
    localStorageMock.clear();
    localStorageMock.setItem('cookie-consent', 'accepted');
    const { container } = render(<CookieConsent />);
    expect(container.innerHTML).toBe('');
  });

  it('does not show when already rejected', () => {
    localStorageMock.clear();
    localStorageMock.setItem('cookie-consent', 'rejected');
    const { container } = render(<CookieConsent />);
    expect(container.innerHTML).toBe('');
  });

  it('has accept and reject buttons', () => {
    localStorageMock.clear();
    render(<CookieConsent />);
    expect(screen.getByRole('button', { name: /accept all/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reject non-essential/i })).toBeInTheDocument();
  });

  it('has a privacy policy link', () => {
    localStorageMock.clear();
    render(<CookieConsent />);
    const link = screen.getByRole('link', { name: /privacy policy/i });
    expect(link).toHaveAttribute('href', '/privacy');
  });
});
