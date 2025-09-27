import { formatDate, parseDate } from './dateFormat';

describe('dateFormat', () => {
  describe('formatDate', () => {
    it('should format ISO date string to DD.MM.YYYY', () => {
      expect(formatDate('2024-03-12')).toBe('12.03.2024');
      expect(formatDate('2023-01-01')).toBe('01.01.2023');
      expect(formatDate('2022-12-31')).toBe('31.12.2022');
    });

    it('should format Date object to DD.MM.YYYY', () => {
      const date = new Date(2024, 2, 12); // March 12, 2024 (month is 0-indexed)
      expect(formatDate(date)).toBe('12.03.2024');
    });

    it('should handle single digit days and months', () => {
      expect(formatDate('2024-01-05')).toBe('05.01.2024');
      expect(formatDate('2024-09-03')).toBe('03.09.2024');
    });
  });

  describe('parseDate', () => {
    it('should parse DD.MM.YYYY back to Date', () => {
      const result = parseDate('12.03.2024');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
      expect(result?.getMonth()).toBe(2); // March is index 2
      expect(result?.getDate()).toBe(12);
    });

    it('should parse 01.01.2023 correctly', () => {
      const result = parseDate('01.01.2023');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2023);
      expect(result?.getMonth()).toBe(0); // January is index 0
      expect(result?.getDate()).toBe(1);
    });

    it('should return null for invalid date strings', () => {
      expect(parseDate('invalid')).toBeNull();
      expect(parseDate('32.13.2024')).toBeNull();
      expect(parseDate('')).toBeNull();
    });

    it('should round-trip correctly', () => {
      const originalDate = '2024-03-12';
      const formatted = formatDate(originalDate);
      const parsed = parseDate(formatted);
      const reformatted = parsed ? formatDate(parsed) : null;
      
      expect(formatted).toBe('12.03.2024');
      expect(reformatted).toBe('12.03.2024');
    });
  });
});