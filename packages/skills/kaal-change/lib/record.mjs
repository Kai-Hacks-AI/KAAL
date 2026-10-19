// The Change Record path syntax: .kaal/changes/<capability>/YY/MM/DD/CC/.
// Syntax only. Whether a path exists, and reading or writing it, is Hosting's.

const ROOT = ".kaal/changes";
const CAPABILITY = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const TWO = /^\d{2}$/;

/**
 * Reads a repository-relative record path. Returns the record's address,
 * `{ capability, date, number }` with `date` as `YYYY-MM-DD`, or `{ finding }`
 * naming the first way the path breaks the syntax. A trailing slash is optional.
 */
export function readRecordPath(path) {
  if (typeof path !== "string") return { finding: "a record path is a string" };
  if (path.includes("\\")) return { finding: `${path}: use forward slashes` };
  const parts = path.replace(/\/$/, "").split("/");
  if (parts.slice(0, 2).join("/") !== ROOT) return { finding: `${path}: a record lies under ${ROOT}/` };
  if (parts.length !== 7) return { finding: `${path}: a record is ${ROOT}/<capability>/YY/MM/DD/CC/` };
  const [, , capability, yy, mm, dd, cc] = parts;
  if (!CAPABILITY.test(capability)) return { finding: `${path}: ${capability} is not a capability name: lowercase letters, digits and single hyphens` };
  if (![yy, mm, dd].every((s) => TWO.test(s))) return { finding: `${path}: the day is YY/MM/DD, two digits each` };
  const year = 2000 + Number(yy);
  const day = new Date(Date.UTC(year, Number(mm) - 1, Number(dd)));
  if (day.getUTCFullYear() !== year || day.getUTCMonth() !== Number(mm) - 1 || day.getUTCDate() !== Number(dd)) {
    return { finding: `${path}: ${yy}/${mm}/${dd} is not a day` };
  }
  if (!TWO.test(cc) || cc === "00") return { finding: `${path}: ${cc} is not a record number from 01 to 99` };
  return { capability, date: `${year}-${mm}-${dd}`, number: Number(cc) };
}

/** The record path for an address, the inverse of readRecordPath. */
export function recordPath({ capability, date, number }) {
  const [year, mm, dd] = date.split("-");
  const path = `${ROOT}/${capability}/${year.slice(2)}/${mm}/${dd}/${String(number).padStart(2, "0")}/`;
  const read = readRecordPath(path);
  if (read.finding || read.date !== date || read.number !== number) throw new Error(read.finding ?? `${date} or ${number} has no record path`);
  return path;
}

// Numbering. A Change claims the record folder its pull request adds; the
// number is provisional until the Change is accepted into its collector, so
// a pull request closed without merging consumes none. Listing the files at
// the fork point and at the collector's tip is Hosting's; running the check
// at merge time, fresh against the tip, is Engineering's Branching.

/** The record a repository-relative file lies in, or `{ finding }`. */
export function recordOf(path) {
  const parts = typeof path === "string" ? path.split("/") : [];
  const read = readRecordPath(parts.slice(0, 7).join("/"));
  return read.finding ? read : { record: `${parts.slice(0, 7).join("/")}/`, ...read };
}

function records(paths) {
  return new Set([...paths].filter((p) => p.startsWith(`${ROOT}/`)).map((p) => recordOf(p).record).filter(Boolean));
}

/** The next free record path for a capability's day, given the files at the collector's tip. */
export function nextRecordPath({ capability, date }, collector) {
  let top = 0;
  for (const record of records(collector)) {
    const read = readRecordPath(record);
    if (read.capability === capability && read.date === date) top = Math.max(top, read.number);
  }
  if (top === 99) throw new Error(`${capability} has no record number left on ${date}`);
  return recordPath({ capability, date, number: top + 1 });
}

/**
 * Checks a Change's claim against its collector. `added` are the files the
 * pull request adds, `base` the files at its fork point and `collector` the
 * files at the collector's current tip. A Change claims the records it adds
 * that its fork point did not hold, and at most one. A claim collides when
 * the collector already holds that record: the Change renames its folder to
 * the next free number, updates its references and is checked again.
 * Returns `{ claimed, findings }`.
 */
export function checkClaim({ added, base, collector }) {
  const findings = [];
  const held = records(base);
  const claimed = new Set();
  for (const path of added) {
    if (!path.startsWith(`${ROOT}/`)) continue;
    const read = recordOf(path);
    if (read.finding) findings.push(read.finding);
    else if (!held.has(read.record)) claimed.add(read.record);
  }
  if (claimed.size > 1) findings.push(`a Change claims one record, not ${[...claimed].join(", ")}`);
  const occupied = records(collector);
  for (const record of claimed) {
    if (!occupied.has(record)) continue;
    const { capability, date } = readRecordPath(record);
    findings.push(`${record} is already taken in the collector: rename the folder to ${nextRecordPath({ capability, date }, collector)}, update its references and check again`);
  }
  return { claimed: [...claimed], findings };
}
