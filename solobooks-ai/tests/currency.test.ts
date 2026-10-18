import { describe, it, expect } from 'vitest';
import {
  toMinorUnits,
  fromMinorUnits,
  formatCurrency,
  parseCurrencyInput,
} from '../src/lib/currency';

describe('Currency and Minor-Unit Math Suite', () => {
  it('converts standard decimals to integer minor units correctly', () => {
    expect(toMinorUnits(120.50)).toBe(12050);
    expect(toMinorUnits(49.99)).toBe(4999);
    expect(toMinorUnits(0.1 + 0.2)).toBe(30); // Eliminates 0.30000000000000004 floating-point drift!
    expect(toMinorUnits(0)).toBe(0);
    expect(toMinorUnits(-15.25)).toBe(-1525);
  });

  it('converts integer minor units back to standard decimals', () => {
    expect(fromMinorUnits(12050)).toBe(120.5);
    expect(fromMinorUnits(4999)).toBe(49.99);
    expect(fromMinorUnits(30)).toBe(0.3);
    expect(fromMinorUnits(0)).toBe(0);
  });

  it('formats currency with correct locale and symbols', () => {
    const formattedInr = formatCurrency(125000, 'INR');
    expect(formattedInr).toContain('1,250');

    const formattedUsd = formatCurrency(4999, 'USD');
    expect(formattedUsd).toContain('49.99');
  });

  it('parses noisy currency strings safely', () => {
    expect(parseCurrencyInput('$1,250.50')).toBe(125050);
    expect(parseCurrencyInput('₹ 4,500')).toBe(450000);
    expect(parseCurrencyInput('12.99')).toBe(1299);
    expect(parseCurrencyInput('')).toBe(0);
    expect(parseCurrencyInput('invalid')).toBe(0);
  });
});
