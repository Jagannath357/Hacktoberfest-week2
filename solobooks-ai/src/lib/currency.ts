/**
 * Currency and minor-unit financial arithmetic helpers.
 * All financial amounts are stored internally as integer minor units (e.g. paise / cents)
 * to prevent floating-point rounding bugs.
 */

export const SUPPORTED_CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar' },
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]['code'];

/**
 * Convert standard decimal monetary value to integer minor units (e.g. 49.99 -> 4999).
 */
export function toMinorUnits(amount: number): number {
  if (isNaN(amount)) return 0;
  return Math.round(amount * 100);
}

/**
 * Convert integer minor units to standard decimal (e.g. 4999 -> 49.99).
 */
export function fromMinorUnits(minorUnits: number): number {
  if (!Number.isFinite(minorUnits)) return 0;
  return minorUnits / 100;
}

/**
 * Format integer minor units into a localized currency string.
 */
export function formatCurrency(minorUnits: number, currencyCode: string = 'INR'): string {
  const amount = fromMinorUnits(minorUnits);
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode.toUpperCase(),
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    const symbol = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode)?.symbol || currencyCode;
    return `${symbol}${amount.toFixed(2)}`;
  }
}

/**
 * Safely parse a currency input string (e.g. "$1,250.50" or "1250.50") into minor units.
 */
export function parseCurrencyInput(input: string | number): number {
  if (typeof input === 'number') {
    return toMinorUnits(input);
  }
  if (!input) return 0;
  // Remove currency symbols, commas, and whitespace
  const sanitized = input.toString().replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(sanitized);
  return isNaN(parsed) ? 0 : toMinorUnits(parsed);
}
