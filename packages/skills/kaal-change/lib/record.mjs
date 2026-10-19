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
