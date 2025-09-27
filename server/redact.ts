/**
 * PII Redaction Utility
 * Automatically redacts sensitive information from log strings
 */

// Email pattern - redacts everything except first letter and domain
const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

// Phone number patterns (various formats)
const PHONE_PATTERNS = [
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // US format: 123-456-7890, 123.456.7890, 1234567890
  /\b\+?1?[-.]?\(?[0-9]{3}\)?[-.]?[0-9]{3}[-.]?[0-9]{4}\b/g, // US with optional +1, parentheses
  /\b\+[1-9]\d{1,14}\b/g, // International format: +1234567890
  /\b\(\d{3}\)\s?\d{3}[-.]?\d{4}\b/g, // (123) 456-7890
];

// Passport/ID patterns
const ID_PATTERNS = [
  /\b[A-Z]{1,2}[0-9]{6,9}\b/g, // Common passport pattern: AB1234567
  /\b[0-9]{9,12}\b/g, // Social Security, National ID numbers
  /\bPA[0-9]{7}\b/g, // US Passport pattern
  /\bEK[0-9]{7}\b/g, // Polish passport pattern (from user's system)
];

// Date of birth patterns (various formats)
const DOB_PATTERNS = [
  /\b(0?[1-9]|1[0-2])[\/\-](0?[1-9]|[12]\d|3[01])[\/\-](19|20)\d{2}\b/g, // MM/DD/YYYY, MM-DD-YYYY
  /\b(0?[1-9]|[12]\d|3[01])[\/\-](0?[1-9]|1[0-2])[\/\-](19|20)\d{2}\b/g, // DD/MM/YYYY, DD-MM-YYYY
  /\b(19|20)\d{2}[\/\-](0?[1-9]|1[0-2])[\/\-](0?[1-9]|[12]\d|3[01])\b/g, // YYYY/MM/DD, YYYY-MM-DD
  /\b(0?[1-9]|[12]\d|3[01])\.(0?[1-9]|1[0-2])\.(19|20)\d{2}\b/g, // DD.MM.YYYY (Polish format)
  /\b(19|20)\d{2}\.(0?[1-9]|1[0-2])\.(0?[1-9]|[12]\d|3[01])\b/g, // YYYY.MM.DD (Polish format)
];

// Credit card patterns
const CREDIT_CARD_PATTERN = /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g;

/**
 * Redacts email addresses, keeping first character and domain
 * Example: john.doe@example.com -> j***@example.com
 */
function redactEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 1) {
    return `*@${domain}`;
  }
  return `${localPart[0]}***@${domain}`;
}

/**
 * Redacts phone numbers, keeping country code if present
 * Example: +1-555-123-4567 -> +1-***-***-****
 */
function redactPhone(phone: string): string {
  // Keep country code if present
  if (phone.startsWith('+')) {
    const match = phone.match(/^\+(\d{1,3})/);
    const countryCode = match ? match[1] : '';
    return `+${countryCode}-***-***-****`;
  }
  return '***-***-****';
}

/**
 * Redacts ID/passport numbers, keeping first character
 * Example: AB1234567 -> A*******
 */
function redactId(id: string): string {
  if (id.length <= 1) {
    return '*'.repeat(id.length);
  }
  return id[0] + '*'.repeat(id.length - 1);
}

/**
 * Redacts dates, keeping year
 * Example: 01/15/1990 -> XX/XX/1990
 */
function redactDate(date: string): string {
  // Extract year if present
  const yearMatch = date.match(/(19|20)\d{2}/);
  const year = yearMatch ? yearMatch[0] : '****';
  return `XX/XX/${year}`;
}

/**
 * Main PII redaction function
 * @param str - Input string that may contain sensitive information
 * @returns String with PII redacted
 */
export function redactPII(str: string): string {
  if (typeof str !== 'string') {
    return str;
  }

  let redacted = str;

  // Redact emails
  redacted = redacted.replace(EMAIL_PATTERN, (match) => redactEmail(match));

  // Redact phone numbers
  PHONE_PATTERNS.forEach(pattern => {
    redacted = redacted.replace(pattern, (match) => redactPhone(match));
  });

  // Redact ID/passport patterns
  ID_PATTERNS.forEach(pattern => {
    redacted = redacted.replace(pattern, (match) => redactId(match));
  });

  // Redact date patterns
  DOB_PATTERNS.forEach(pattern => {
    redacted = redacted.replace(pattern, (match) => redactDate(match));
  });

  // Redact credit card numbers
  redacted = redacted.replace(CREDIT_CARD_PATTERN, (match) => {
    // Keep first 4 and last 4 digits
    if (match.length >= 8) {
      return match.slice(0, 4) + '*'.repeat(match.length - 8) + match.slice(-4);
    }
    return '*'.repeat(match.length);
  });

  return redacted;
}

/**
 * Redacts PII from objects and arrays recursively
 * @param obj - Object that may contain sensitive information
 * @returns Object with PII redacted in string values
 */
export function redactPIIFromObject(obj: any): any {
  if (typeof obj === 'string') {
    return redactPII(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => redactPIIFromObject(item));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const redactedObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      redactedObj[key] = redactPIIFromObject(value);
    }
    return redactedObj;
  }
  
  return obj;
}