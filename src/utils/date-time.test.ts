import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { formatTime, formatMessageTime } from './date-time';

describe('date-time utils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatTime', () => {
    it('returns empty string for undefined timestamp', () => {
      expect(formatTime(undefined)).toBe('');
    });

    it('returns empty string for timestamp 0', () => {
      expect(formatTime(0)).toBe('');
    });

    it('returns time for today', () => {
      const today = new Date('2026-01-15T09:30:00').getTime();
      expect(formatTime(today)).toBe('09:30');
    });

    it('returns weekday for dates within last 7 days', () => {
      // 2026-01-12 is Monday (пн) - 3 days before 2026-01-15
      const threeDaysAgo = new Date('2026-01-12T10:00:00').getTime();
      const result = formatTime(threeDaysAgo);
      expect(result).toBe('пн');
    });

    it('returns date for older messages', () => {
      const twoWeeksAgo = new Date('2026-01-01T10:00:00').getTime();
      const result = formatTime(twoWeeksAgo);
      expect(result).toBe('1 янв.');
    });

    it('returns weekday for exactly 6 days ago', () => {
      // 2026-01-09 is Friday (пт) - 6 days before 2026-01-15
      const sixDaysAgo = new Date('2026-01-09T10:00:00').getTime();
      const result = formatTime(sixDaysAgo);
      expect(result).toBe('пт');
    });

    it('returns date for exactly 7 days ago', () => {
      // 2026-01-08 is Thursday - 7 days before 2026-01-15
      const sevenDaysAgo = new Date('2026-01-08T10:00:00').getTime();
      const result = formatTime(sevenDaysAgo);
      expect(result).toBe('8 янв.');
    });
  });

  describe('formatMessageTime', () => {
    it('formats timestamp to HH:MM', () => {
      const timestamp = new Date('2026-01-15T14:35:00').getTime();
      expect(formatMessageTime(timestamp)).toBe('14:35');
    });

    it('pads single digit hours and minutes', () => {
      const timestamp = new Date('2026-01-15T09:05:00').getTime();
      expect(formatMessageTime(timestamp)).toBe('09:05');
    });

    it('handles midnight', () => {
      const midnight = new Date('2026-01-15T00:00:00').getTime();
      expect(formatMessageTime(midnight)).toBe('00:00');
    });

    it('handles end of day', () => {
      const endOfDay = new Date('2026-01-15T23:59:00').getTime();
      expect(formatMessageTime(endOfDay)).toBe('23:59');
    });
  });
});
