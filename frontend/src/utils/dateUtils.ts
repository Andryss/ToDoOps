import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

/**
 * `due_date`: API ISO ↔ &lt;input type="datetime-local"&gt; value (local wall time, no timezone in the string).
 * Only the shapes produced by that input are parsed when sending to the backend.
 */

const DATETIME_LOCAL = [
  'YYYY-MM-DDTHH:mm:ss.SSS',
  'YYYY-MM-DDTHH:mm:ss',
  'YYYY-MM-DDTHH:mm',
] as const;

function parseDatetimeLocal(s: string): dayjs.Dayjs | null {
  for (const fmt of DATETIME_LOCAL) {
    const d = dayjs(s, fmt, true);
    if (d.isValid()) return d;
  }
  return null;
}

/** API `due_date` → `value` for &lt;input type="datetime-local"&gt; (local wall time). */
export function apiDueDateToDatetimeLocal(iso: string | null | undefined): string {
  if (!iso?.trim()) return '';
  const d = dayjs(iso);
  return d.isValid() ? d.format('YYYY-MM-DDTHH:mm') : '';
}

/** datetime-local string → ISO date-time (UTC) for JSON (same instant). */
export function datetimeLocalToOffsetIso(value: string): string | null {
  const t = value.trim();
  if (!t) return null;
  const d = parseDatetimeLocal(t);
  return d?.toISOString() ?? null;
}
