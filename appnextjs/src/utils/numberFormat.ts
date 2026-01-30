/**
 * Formats a value with thousand separators and 2 decimal digits.
 * Example: 1234.5 -> "1,234.50"
 */
export const formatNumeric = (value: string | number | undefined | null): string => {
  if (value === '' || value === undefined || value === null) return '';
  
  // Robust cleaning: keep only digits, dots, and hyphens (removes commas, currency symbols, etc.)
  const cleanValue = value.toString().replace(/[^0-9.-]/g, '');
  const numericValue = parseFloat(cleanValue);
  
  if (isNaN(numericValue)) return typeof value === 'string' ? value : '';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
};

/**
 * Removes thousand separators (commas) from a value and returns a float number.
 */
export const parseNumeric = (value: string | number | undefined | null): number => {
  if (value === undefined || value === null || value === '') return 0;
  if (typeof value === 'number') return value;
  
  // Robust cleaning: keep only digits, dots, and hyphens (removes commas, currency symbols, etc.)
  const cleanValue = value.toString().replace(/[^0-9.-]/g, '');
  return parseFloat(cleanValue) || 0;
};


/**
 * Validates if the input key is allowed for numeric entry (numbers, comma, period).
 */
export const isNumericKey = (key: string): boolean => {
  return /^[0-9,.]+$/.test(key);
};
