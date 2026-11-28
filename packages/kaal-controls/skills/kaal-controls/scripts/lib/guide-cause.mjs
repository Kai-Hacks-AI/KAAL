const KINDS = ['rate-limited', 'forbidden', 'not-found', 'network', 'setting', 'other'];
export const isFailure = (f) => f !== null && typeof f === 'object' && KINDS.includes(f.kind) && typeof f.asked === 'string' && f.asked !== '' && typeof f.place === 'string' && f.place !== '';
const clean = (t) => (typeof t === 'string' ? t.replace(/\b(?:gh[pousr]_|github_pat_)[A-Za-z0-9_]{12,}/g, '[redacted]').replace(/\b(Bearer|Basic)\s+[^\s"',;]+/gi, '$1 [redacted]').replace(/(Authorization:\s*)[^\n"']+/gi, '$1[redacted]').replace(/(x-access-token:)[^@\s]+(@)/gi, '$1[redacted]$2') : t);
const text = (v) => typeof v === 'string';
const num = (v) => typeof v === 'number' && Number.isFinite(v);
export function safeCause(cause) {
  if (!cause || typeof cause !== 'object') return null;
  const out = {};
  if (text(cause.kind)) out.kind = cause.kind;
  for (const k of ['asked', 'place', 'platformMessage', 'message']) if (text(cause[k])) out[k] = clean(cause[k]);
  if (['answer', 'text', 'budget'].includes(cause.basis)) out.basis = cause.basis;
  if (cause.ambiguous === true && cause.kind === 'other') out.ambiguous = true;
  if (num(cause.status)) out.status = cause.status;
  if (cause.malformed === true) out.malformed = true;
  if (cause.kind === 'rate-limited' && cause.limit && typeof cause.limit === 'object') {
    const l = {};
    for (const k of ['bucket', 'resetAt']) if (text(cause.limit[k])) l[k] = clean(cause.limit[k]);
    for (const k of ['remaining', 'retryAfterSeconds']) if (num(cause.limit[k])) l[k] = cause.limit[k];
    out.limit = l;
  }
  return out;
}
export function guideCause(cause) {
  if (!cause) return null;
  const said = typeof cause.platformMessage === 'string' ? ` "${cause.platformMessage}"` : '';
  const basis = cause.basis ? ` (from the ${cause.basis})` : '';
  const what = `at ${cause.place} while asking: ${cause.asked}`;
  if (cause.kind === 'check-error') return `the check ended before it judged: ${cause.message}`;
  if (cause.kind === 'rate-limited') { const l = cause.limit ?? {}; return `rate-limited${basis} at ${cause.place} (bucket ${l.bucket ?? 'unknown'}${l.resetAt ? `, resets ${l.resetAt}` : ''}${l.retryAfterSeconds === undefined ? '' : `, retry after ${l.retryAfterSeconds}s`}) while asking: ${cause.asked}`; }
  if (cause.kind === 'forbidden') return `forbidden (${cause.status ?? 'no status'}) ${what}${said}`;
  if (cause.kind === 'not-found') return `not-found ${what}`;
  if (cause.kind === 'network') return `network failure ${what}`;
  if (cause.kind === 'setting') return `the platform reports a repository setting as off${basis} ${what}${said}`;
  if (cause.ambiguous) return `unclear${basis} ${what}${said}: it may be a rate limit, so re-run once and then report`;
  return `${cause.kind}${basis} ${what}${said}`;
}
