/**
 * Polish date formatting utilities for SPRINT A
 * Required by the case editing specification - DD.MM.YYYY format
 */

export const formatPL = (d?: string | number | Date) =>
  d ? new Intl.DateTimeFormat('pl-PL', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  }).format(new Date(d)) : '—';

export const parsePL = (s: string) => {
  // expects DD.MM.YYYY
  const [dd, mm, yyyy] = s.trim().split('.');
  const dt = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  return isNaN(dt.getTime()) ? null : dt;
};