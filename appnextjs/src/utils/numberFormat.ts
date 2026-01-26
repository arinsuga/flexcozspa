/**
 * Formats a value with thousand separators and 2 decimal digits.
 * Example: 1234.5 -> "1,234.50"
 */
export const formatNumeric = (value: string | number | undefined | null): string => {
  if (value === '' || value === undefined || value === null) return '';
  
  // Remove existing commas before parsing
  const cleanValue = typeof value === 'string' ? value.replace(/,/g, '') : value.toString();
  const numericValue = parseFloat(cleanValue);
  
  if (isNaN(numericValue)) return typeof value === 'string' ? value : '';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
};

/**
 * Removes thousand separators (commas) from a string to make it a valid number string.
 */
export const parseNumeric = (value: string): string => {
  return value.replace(/,/g, '');
};

/**
 * Validates if the input key is allowed for numeric entry (numbers, comma, period).
 */
export const isNumericKey = (key: string): boolean => {
  return /^[0-9,.]+$/.test(key);
};
