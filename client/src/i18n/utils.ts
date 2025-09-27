import i18n from './index';

/**
 * Format date using current i18n language with proper Polish/English localization
 */
export const formatDate = (
  date: string | Date | number,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const currentLanguage = i18n.language || 'en';
  const locale = currentLanguage === 'pl' ? 'pl-PL' : 'en-US';
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  try {
    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
  } catch (error) {
    console.warn('Date formatting error:', error);
    // Fallback to simple format
    return dateObj.toLocaleDateString();
  }
};

/**
 * Format date and time using current i18n language
 */
export const formatDateTime = (
  date: string | Date | number,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };
  
  return formatDate(date, defaultOptions);
};

/**
 * Format relative time (e.g., "2 days ago", "2 dni temu")
 */
export const formatRelativeTime = (
  date: string | Date | number
): string => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const currentLanguage = i18n.language || 'en';
  const locale = currentLanguage === 'pl' ? 'pl-PL' : 'en-US';
  
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  try {
    // Use Intl.RelativeTimeFormat if available
    if (typeof Intl.RelativeTimeFormat === 'function') {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
      
      if (diffDays === 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours === 0) {
          const diffMinutes = Math.floor(diffMs / (1000 * 60));
          return rtf.format(-diffMinutes, 'minute');
        }
        return rtf.format(-diffHours, 'hour');
      }
      
      return rtf.format(-diffDays, 'day');
    } else {
      // Fallback for older browsers
      if (diffDays === 0) {
        return currentLanguage === 'pl' ? 'dzisiaj' : 'today';
      } else if (diffDays === 1) {
        return currentLanguage === 'pl' ? 'wczoraj' : 'yesterday';
      } else {
        return currentLanguage === 'pl' 
          ? `${diffDays} dni temu` 
          : `${diffDays} days ago`;
      }
    }
  } catch (error) {
    console.warn('Relative time formatting error:', error);
    return formatDate(date, { month: 'short', day: 'numeric' });
  }
};

/**
 * Format numbers using current i18n language (Polish uses space as thousands separator)
 */
export const formatNumber = (
  number: number,
  options: Intl.NumberFormatOptions = {}
): string => {
  if (typeof number !== 'number' || isNaN(number)) return '';
  
  const currentLanguage = i18n.language || 'en';
  const locale = currentLanguage === 'pl' ? 'pl-PL' : 'en-US';
  
  try {
    return new Intl.NumberFormat(locale, options).format(number);
  } catch (error) {
    console.warn('Number formatting error:', error);
    return number.toString();
  }
};

/**
 * Format currency using current i18n language
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD'
): string => {
  const currentLanguage = i18n.language || 'en';
  
  // For Polish context, default to PLN if no currency specified
  const defaultCurrency = currentLanguage === 'pl' ? 'PLN' : currency;
  
  return formatNumber(amount, {
    style: 'currency',
    currency: defaultCurrency
  });
};

/**
 * Format percentage using current i18n language
 */
export const formatPercentage = (
  decimal: number,
  minimumFractionDigits: number = 0,
  maximumFractionDigits: number = 1
): string => {
  return formatNumber(decimal, {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits
  });
};