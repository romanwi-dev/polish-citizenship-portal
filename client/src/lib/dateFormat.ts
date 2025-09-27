// Note: Using built-in Date parsing for better compatibility

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

export function parseDate(str: string): Date | null {
  // expects DD.MM.YYYY
  const [dd, mm, yyyy] = str.split(".");
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Polish date utility - converts date to DD.MM.YYYY format
 * This is the unified date formatter for the Polish Citizenship Agent
 */
export const plDate = (d?: string | Date): string => {
  if (!d) return '—';
  try {
    return formatDate(d);
  } catch {
    return '—';
  }
};

/**
 * Polish date formatting utilities for case editing
 * Required by the case editing specification
 */
export const formatPL = (d?: Date | string): string => {
  if (!d) return '';
  try {
    return formatDate(d);
  } catch {
    return '';
  }
};

export const parsePL = (s: string): Date | null => {
  if (!s) return null;
  return parseDate(s);
};