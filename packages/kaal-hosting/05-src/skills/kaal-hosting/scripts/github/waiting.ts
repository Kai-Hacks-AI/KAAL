// Waiting on GitHub (hosting/F108 to hosting/F111, hosting/A48): what a refused read is, how long to wait, and a bounded
// retry over a read the caller supplies. Pure but for `retryRead`'s clock; it holds no grant, reads nothing and sends nothing.

export type WaitingErrorCode = "INVALID_WAIT" | "READ_REFUSED";
export class WaitingError extends Error {
  constructor(message: string, readonly code: WaitingErrorCode, readonly attempts?: number) {
    super(message);
    this.name = "WaitingError";
  }
}

export interface Refusal { refused: boolean; wait?: number }
export interface RefusalOptions { now?: () => number }
export interface RetryOptions { attempts?: number; sleep?: (seconds: number) => Promise<void>; now?: () => number }

const FIRST = 20;
const LONGEST = 120;
const SHORTEST = 1;
const DEFAULT_ATTEMPTS = 5;
const MOST_ATTEMPTS = 10;
const RETRY_OPTION_KEYS = ["attempts", "sleep", "now"];

const invalid = (why: string): never => { throw new WaitingError(`the wait is invalid: ${why}`, "INVALID_WAIT"); };
const positive = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n) && n >= 1;

/** The wait in seconds before read n + 1 of a poll: 20 s for the first three reads, then 10 s longer each time up to 120 s. */
export function pollSchedule(n: number): number {
  if (!positive(n)) return invalid("the read number is not a positive integer");
  return n <= 3 ? FIRST : Math.min(LONGEST, FIRST + (n - 3) * 10);
}

/** The wait before the next attempt: 20 s doubling to 120 s, or the time GitHub asked for; never over 120 s, never under 1 s. */
export function retryWait(attempt: number, wait?: number): number {
  if (!positive(attempt)) return invalid("the attempt is not a positive integer");
  if (wait !== undefined && (typeof wait !== "number" || !Number.isFinite(wait) || wait < 0)) return invalid("what GitHub asked for is not a number of seconds");
  return Math.max(SHORTEST, Math.min(LONGEST, wait ?? FIRST * 2 ** (attempt - 1)));
}

type Headers_ = Record<string, unknown> | { get(name: string): string | null };
function header(headers: unknown, name: string): string | undefined {
  if (typeof headers !== "object" || headers === null) return undefined;
  if (typeof (headers as { get?: unknown }).get === "function") return (headers as { get(n: string): string | null }).get(name) ?? undefined;
  const found = Object.entries(headers as Record<string, unknown>).find(([k]) => k.toLowerCase() === name);
  return found === undefined || found[1] == null ? undefined : String(found[1]);
}
const seconds = (text: string | undefined): number | undefined => (text !== undefined && /^\s*\d+\s*$/.test(text) ? Number(text) : undefined);

/**
 * Whether a failure is GitHub refusing a read, and what it asked to wait. A failure is a status with headers, the text a command
 * printed, or an error holding either. Refused: 429, 5xx, and a 403 that shows the rate limit (used up, a retry-after, or said in
 * words). A 403 about a permission is not refused: waiting does not cure it.
 */
export function refusalOf(failure: unknown, options: RefusalOptions = {}): Refusal {
  let status: number | undefined;
  let headers: Headers_ | undefined;
  let text = "";
  if (typeof failure === "string") text = failure;
  else if (typeof failure === "object" && failure !== null && !Array.isArray(failure)) {
    const f = failure as { status?: unknown; headers?: Headers_; stderr?: unknown; message?: unknown };
    if (typeof f.status === "number") status = f.status;
    headers = f.headers;
    text = [f.stderr, f.message].filter((t): t is string => typeof t === "string").join("\n");
  }
  if (status === undefined) { const m = /\bHTTP (\d{3})\b/.exec(text); if (m) status = Number(m[1]); }
  const rate = /rate limit/i.test(text);
  const used = header(headers, "x-ratelimit-remaining") === "0";
  const asked = seconds(header(headers, "retry-after"));
  const refused = status === 429 || (status !== undefined && status >= 500 && status < 600) || (status === 403 && (rate || used || header(headers, "retry-after") !== undefined)) || (status === undefined && rate);
  if (!refused) return { refused: false };
  if (asked !== undefined) return { refused: true, wait: asked };
  const reset = seconds(header(headers, "x-ratelimit-reset"));
  if (used && reset !== undefined) return { refused: true, wait: Math.max(0, Math.ceil(reset - (options.now ?? Date.now)() / 1000)) };
  return { refused: true };
}

/**
 * Calls `read(attempt)`; a refusal waits and calls again, up to `attempts` (1 to 10, default 5, no wait after the last), and any
 * other failure is rethrown at once and unchanged. The caller's read decides what is read and with which authority.
 */
export async function retryRead<T>(read: (attempt: number) => Promise<T>, options: RetryOptions = {}): Promise<T> {
  if (typeof read !== "function") return invalid("the read is not a function");
  if (typeof options !== "object" || options === null) return invalid("the options are not an object");
  const stray = Object.keys(options).find((k) => !RETRY_OPTION_KEYS.includes(k));
  if (stray) return invalid(`${stray} is not an option`);
  const attempts = options.attempts ?? DEFAULT_ATTEMPTS;
  if (!Number.isInteger(attempts) || attempts < 1 || attempts > MOST_ATTEMPTS) return invalid(`attempts is not an integer from 1 to ${MOST_ATTEMPTS}`);
  const sleep = options.sleep ?? ((s: number) => new Promise<void>((done) => setTimeout(done, s * 1000)));
  for (let attempt = 1; ; attempt++) {
    try { return await read(attempt); } catch (failure) {
      const refusal = refusalOf(failure, { now: options.now });
      if (!refusal.refused) throw failure;
      if (attempt >= attempts) throw new WaitingError(`the read was refused ${attempt} times and is not retried again`, "READ_REFUSED", attempt);
      await sleep(retryWait(attempt, refusal.wait));
    }
  }
}
