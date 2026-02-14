/**
 * Formats an ISO date-time string as "HH:MM DD.MM" (24h time, day.month).
 */
export function formatDateTime(iso: string | null): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${hours}:${minutes} ${day}.${month}`;
  } catch {
    return iso;
  }
}
