/**
 * Format date input to DD.MM.YYYY format with validation
 * @param value - The input value
 * @returns Formatted date string
 */
export function formatDateInput(value: string): string {
  // Remove all non-digit characters
  const digitsOnly = value.replace(/\D/g, '');
  
  // Apply DD.MM.YYYY format
  if (digitsOnly.length <= 2) {
    return digitsOnly;
  } else if (digitsOnly.length <= 4) {
    return `${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2)}`;
  } else {
    return `${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2, 4)}.${digitsOnly.slice(4, 8)}`;
  }
}

/**
 * Validate and constrain date components
 * @param value - The formatted date string (DD.MM.YYYY)
 * @returns Valid date string with constrained values
 */
export function validateDateComponents(value: string): string {
  const parts = value.split('.');
  
  if (parts.length === 1) {
    // Day only - constrain to 01-31
    const day = parseInt(parts[0]) || 0;
    return Math.min(Math.max(day, 1), 31).toString().padStart(2, '0');
  } else if (parts.length === 2) {
    // Day and month - constrain both
    const day = parseInt(parts[0]) || 0;
    const month = parseInt(parts[1]) || 0;
    const constrainedDay = Math.min(Math.max(day, 1), 31).toString().padStart(2, '0');
    const constrainedMonth = Math.min(Math.max(month, 1), 12).toString().padStart(2, '0');
    return `${constrainedDay}.${constrainedMonth}`;
  } else if (parts.length === 3) {
    // Full date - constrain all components
    const day = parseInt(parts[0]) || 0;
    const month = parseInt(parts[1]) || 0;
    const year = parseInt(parts[2]) || 0;
    
    const constrainedDay = Math.min(Math.max(day, 1), 31).toString().padStart(2, '0');
    const constrainedMonth = Math.min(Math.max(month, 1), 12).toString().padStart(2, '0');
    const constrainedYear = Math.min(Math.max(year, 1825), 2030).toString();
    
    return `${constrainedDay}.${constrainedMonth}.${constrainedYear}`;
  }
  
  return value;
}

/**
 * Complete date input handler with formatting and validation
 * @param value - Raw input value
 * @returns Properly formatted and validated date string
 */
export function handleDateInput(value: string): string {
  const formatted = formatDateInput(value);
  return validateDateComponents(formatted);
}