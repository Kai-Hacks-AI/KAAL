// The Change Record path syntax: <root>/<capability>/YY/MM/DD/CC/.
// The consuming context chooses the root; KAAL's own repository uses
// .kaal/changes, the default here. Syntax only. Whether a path exists, and
// reading or writing it, is Hosting's.

export const DEFAULT_ROOT = ".kaal/changes";
const CAPABILITY = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const TWO = /^\d{2}$/;

/** A record root's segments. A root is repository-relative, in forward slashes, with no empty, "." or ".." segment. */
function rootParts(root) {
  const parts = typeof root === "string" ? root.replace(/\/$/, "").split("/") : [];
  if (parts.length === 0 || root.includes("\\") || parts.some((part) => part === "" || part === "." || part === "..")) {
    throw new Error(`${root} is not a record root: a repository-relative folder in forward slashes`);
  }
  return parts;
}

/**
 * Reads a repository-relative record path under `root`. Returns the record's
 * address, `{ capability, date, number }` with `date` as `YYYY-MM-DD`, or
 * `{ finding }` naming the first way the path breaks the syntax. A trailing
 * slash is optional.
 */
export function readRecordPath(path, { root = DEFAULT_ROOT } = {}) {
  const base = rootParts(root);
  const ROOT = base.join("/");
  if (typeof path !== "string") return { finding: "a record path is a string" };
  if (path.includes("\\")) return { finding: `${path}: use forward slashes` };
  const parts = path.replace(/\/$/, "").split("/");
  if (parts.slice(0, base.length).join("/") !== ROOT) return { finding: `${path}: a record lies under ${ROOT}/` };
  if (parts.length !== base.length + 5) return { finding: `${path}: a record is ${ROOT}/<capability>/YY/MM/DD/CC/` };
  const [capability, yy, mm, dd, cc] = parts.slice(base.length);
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

/** The record path for an address under `root`, the inverse of readRecordPath. */
export function recordPath({ capability, date, number }, { root = DEFAULT_ROOT } = {}) {
  const [year, mm, dd] = date.split("-");
  const path = `${rootParts(root).join("/")}/${capability}/${year.slice(2)}/${mm}/${dd}/${String(number).padStart(2, "0")}/`;
  const read = readRecordPath(path, { root });
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

/** The record under `root` a repository-relative file lies in, or `{ finding }`. A file lies inside the CC folder, never at it. */
export function recordOf(path, { root = DEFAULT_ROOT } = {}) {
  const depth = rootParts(root).length + 5;
  const parts = typeof path === "string" ? path.split("/") : [];
  const read = readRecordPath(parts.slice(0, depth).join("/"), { root });
  if (read.finding) return read;
  if (parts.length <= depth || parts.slice(depth).some((part) => part === "")) return { finding: `${path}: a record's files lie inside its CC folder` };
  return { record: `${parts.slice(0, depth).join("/")}/`, ...read };
}

function records(paths, root) {
  const prefix = `${rootParts(root).join("/")}/`;
  return new Set([...paths].filter((p) => p.startsWith(prefix)).map((p) => recordOf(p, { root }).record).filter(Boolean));
}

/** The next free record path under `root` for a capability's day, given the files at the collector's tip. */
export function nextRecordPath({ capability, date }, collector, { root = DEFAULT_ROOT } = {}) {
  let top = 0;
  for (const record of records(collector, root)) {
    const read = readRecordPath(record, { root });
    if (read.capability === capability && read.date === date) top = Math.max(top, read.number);
  }
  if (top === 99) throw new Error(`${capability} has no record number left on ${date}`);
  return recordPath({ capability, date, number: top + 1 }, { root });
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
 * updates its references and is checked again. `root` is where the
 * repository keeps its records. `required` is the repository's choice of
 * strictness: when true, the default and KAAL's own choice, a substantive
 * Change that claims no record is a finding; when false, a substantive
 * Change may claim one record or none. Returns `{ claimed, findings }`.
 */
export function checkClaim({ kind, changed, collector, root = DEFAULT_ROOT, required = true }) {
  const ROOT = rootParts(root).join("/");
  if (kind !== "substantive" && kind !== "synchronization") {
    return { claimed: [], findings: [`a Change is substantive or a synchronization, not ${kind}`] };
  }
  const findings = [];
  const claimed = new Set();
  for (const path of changed) {
    if (!path.startsWith(`${ROOT}/`)) continue;
    const read = recordOf(path, { root });
    if (read.finding) findings.push(read.finding);
    else claimed.add(read.record);
  }
  if (kind === "synchronization" && claimed.size > 0) findings.push(`a synchronization carries accepted records and claims none, not ${[...claimed].join(", ")}`);
  if (kind === "substantive" && required && claimed.size === 0) findings.push(`a substantive Change claims exactly one record under ${ROOT}/, and this one claims none`);
  if (kind === "substantive" && claimed.size > 1) findings.push(`a substantive Change claims ${required ? "exactly" : "at most"} one record, not ${[...claimed].join(", ")}`);
  const occupied = records(collector, root);
  for (const record of claimed) {
    const { capability, date } = readRecordPath(record, { root });
    let next;
    try {
      next = nextRecordPath({ capability, date }, collector, { root });
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
