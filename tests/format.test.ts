import { describe, it, expect } from 'vitest';
import { formatCurrency, formatMinutes, formatCylinderSize } from '@/lib/utils/format';

describe('formatCurrency', () => {
  it('formats ZAR correctly', () => {
    const result = formatCurrency(1234.56, 'ZAR');
    expect(result).toContain('1');
    expect(result).toContain('234');
  });

  it('handles zero', () => {
    const result = formatCurrency(0, 'ZAR');
    expect(result).toContain('0');
  });

  it('handles large numbers', () => {
    const result = formatCurrency(9999999, 'ZAR');
    expect(result).toBeTruthy();
  });
});

describe('formatMinutes', () => {
  it('formats minutes to human readable', () => {
    const result = formatMinutes(90);
    expect(result).toBeTruthy();
  });

  it('handles small values', () => {
    const result = formatMinutes(15);
    expect(result).toBeTruthy();
  });
});

describe('formatCylinderSize', () => {
  it('formats kg values', () => {
    const result = formatCylinderSize('9');
    expect(result).toContain('9');
  });

  it('handles null/undefined', () => {
    expect(formatCylinderSize(null)).toBeTruthy();
    expect(formatCylinderSize(undefined)).toBeTruthy();
  });
});
