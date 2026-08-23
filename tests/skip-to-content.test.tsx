import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkipToContent } from '@/components/ui/skip-to-content';

describe('SkipToContent', () => {
  it('renders skip link', () => {
    render(<SkipToContent />);
    const link = screen.getByRole('link', { name: /skip to main content/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#main-content');
  });
});
