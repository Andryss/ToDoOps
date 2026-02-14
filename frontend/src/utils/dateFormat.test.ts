import { formatDateTime } from './dateFormat';

describe('formatDateTime', () => {
  it('returns empty string for null', () => {
    expect(formatDateTime(null)).toBe('');
  });

  it('formats ISO date as HH:MM DD.MM in local time', () => {
    const result = formatDateTime('2025-02-10T14:30:00.000Z');
    expect(result).toMatch(/\d{1,2}:\d{2} \d{1,2}\.\d{1,2}/);
  });

  it('returns NaN-style string for invalid date', () => {
    const result = formatDateTime('not-a-date');
    expect(result).toMatch(/NaN/);
  });
});
