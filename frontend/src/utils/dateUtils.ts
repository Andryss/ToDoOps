/**
 * Backend expects ISO-8601 instant (Jackson OffsetDateTime), e.g. "2025-12-31T23:59:59Z".
 * <input type="datetime-local"> yields "YYYY-MM-DDTHH:mm" (no timezone, often no seconds).
 * Naive values are converted to UTC …Z; strings that already end with Z or ±offset are kept.
 */

const DATETIME_LOCAL_RE =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d{1,9}))?$/;

/** UTC ISO for JSON: `…Z`, trimming redundant `.000` to match API examples. */
function formatUtcZForBackend(d: Date): string | null {
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().replace(/\.000Z$/, 'Z');
}

function hasExplicitOffset(iso: string): boolean {
  const t = iso.trim();
  return /Z$/i.test(t) || /[+-]\d{2}:\d{2}$/.test(t) || /[+-]\d{4}$/.test(t);
}

/** Convert API due_date to value for datetime-local (user's local wall time). */
export function apiDueDateToDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Interpret datetime-local as local wall time and return UTC ISO (`…Z`) for the same instant.
 */
export function datetimeLocalToOffsetIso(localValue: string): string | null {
  const t = localValue.trim();
  if (!t) return null;

  const m = t.match(DATETIME_LOCAL_RE);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const d = Number(m[3]);
    const h = Number(m[4]);
    const min = Number(m[5]);
    const sec = m[6] !== undefined ? Number(m[6]) : 0;
    let ms = 0;
    if (m[7] !== undefined) {
      ms = Number(m[7].padEnd(3, '0').slice(0, 3));
    }
    const date = new Date(y, mo, d, h, min, sec, ms);
    return formatUtcZForBackend(date);
  }

  const d = new Date(t);
  return formatUtcZForBackend(d);
}

/**
 * Coerce due_date for POST/PUT: naive strings become UTC …Z; values that already have Z or ±hh:mm
 * (e.g. from the API) are unchanged.
 */
export function ensureApiDueDateIso(
  value: string | null | undefined,
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value.trim() === '') return null;
  const t = value.trim();
  if (hasExplicitOffset(t)) return t;
  return datetimeLocalToOffsetIso(t) ?? null;
}
