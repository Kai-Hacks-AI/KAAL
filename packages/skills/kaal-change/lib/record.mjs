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

// Numbering. Every pull request into a collector is a Change. A substantive
// Change claims the one record folder it changes; a synchronization carries
// accepted records and claims none. The number is provisional until the Change is accepted into its
// collector, so a pull request closed without merging consumes none. A
// record the collector holds belongs to the Change accepted with it, so no
// later pull request changes it, rebased or not. Listing the files is
// Hosting's; running the check at merge, fresh against the tip, is
// Engineering's Branching.

/** The record a repository-relative file lies in, or `{ finding }`. A file lies inside the CC folder, never at it. */
export function recordOf(path) {
  const parts = typeof path === "string" ? path.split("/") : [];
  const read = readRecordPath(parts.slice(0, 7).join("/"));
  if (read.finding) return read;
  if (parts.length < 8 || parts.slice(7).some((part) => part === "")) return { finding: `${path}: a record's files lie inside its CC folder` };
  return { record: `${parts.slice(0, 7).join("/")}/`, ...read };
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
 * Checks a Change's claim against its collector. Every pull request into a
 * collector is a Change. `kind` says which: a "substantive" Change brings new
 * work and claims exactly one record; a "synchronization" carries work
 * already accepted, with the records it was accepted with, and claims none.
 * `changed` are the files the Change adds, modifies or deletes, less any it
 * carries unchanged from where they were already accepted, and `collector`
 * the files at the collector's current tip. A claim must be the next free
 * number for its capability's day: when the collector already holds it, or
 * it skips ahead, the Change renames its folder to the next free number,
 * updates its references and is checked again. Returns
 * `{ claimed, findings }`.
 */
export function checkClaim({ kind, changed, collector }) {
  if (kind !== "substantive" && kind !== "synchronization") {
    return { claimed: [], findings: [`a Change is substantive or a synchronization, not ${kind}`] };
  }
  const findings = [];
  const claimed = new Set();
  for (const path of changed) {
    if (!path.startsWith(`${ROOT}/`)) continue;
    const read = recordOf(path);
    if (read.finding) findings.push(read.finding);
    else claimed.add(read.record);
  }
  if (kind === "synchronization" && claimed.size > 0) findings.push(`a synchronization carries accepted records and claims none, not ${[...claimed].join(", ")}`);
  if (kind === "substantive" && claimed.size === 0) findings.push(`a substantive Change claims exactly one record under ${ROOT}/, and this one claims none`);
  if (kind === "substantive" && claimed.size > 1) findings.push(`a substantive Change claims exactly one record, not ${[...claimed].join(", ")}`);
  const occupied = records(collector);
  for (const record of claimed) {
    const { capability, date } = readRecordPath(record);
    let next;
    try {
      next = nextRecordPath({ capability, date }, collector);
    } catch {
      findings.push(`${record}: ${capability} has no record number left on ${date} in the collector`);
      continue;
    }
    if (record === next) continue;
    const why = occupied.has(record) ? "is already taken in the collector" : "is not the next free number in the collector";
    findings.push(`${record} ${why}: rename the folder to ${next}, update its references and check again`);
  }
  return { claimed: [...claimed], findings };
}
