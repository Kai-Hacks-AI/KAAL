import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

/**
 * A seal closes a unit: a directory whose files must not change once sealed.
 * Units form a named chain in an order the using system decides; each seal
 * records the bytes of every file in its unit and the previous seal of the
 * chain, so changing any sealed unit breaks its own seal and every seal after
 * it. The chain's head, kept at the root, records how far the chain is sealed,
 * so removing trailing seals is noticed too.
 */
export type Seal = {
  unit: string;
  previous: string | null;
  files: { path: string; sha256: string }[];
  seal: string;
};

export const SEAL_FILE = "seal.json";

/** Kept at the root: for each chain, its last sealed unit and that unit's seal. */
export const HEADS_FILE = "seals.json";

export type Head = { unit: string; seal: string };

const sha256 = (data: string | Buffer) => crypto.createHash("sha256").update(data).digest("hex");

const posix = (p: string) => p.split(path.sep).join("/");

export function sealPath(root: string, unit: string): string {
  return path.join(root, unit, SEAL_FILE);
}

export function isSealed(root: string, unit: string): boolean {
  return fs.existsSync(sealPath(root, unit));
}

/**
 * Every file in a unit except its seal, by path within the unit, with its hash.
 * Symlinks are listed as such: a seal can only vouch for bytes it holds.
 */
function contents(root: string, unit: string): { files: Seal["files"]; symlinks: string[] } {
  const dir = path.join(root, unit);
  const files: Seal["files"] = [];
  const symlinks: string[] = [];
  if (!fs.existsSync(dir)) return { files, symlinks };
  for (const entry of fs.readdirSync(dir, { recursive: true, withFileTypes: true })) {
    const full = path.join(entry.parentPath, entry.name);
    const relative = posix(path.relative(dir, full));
    if (entry.isSymbolicLink()) symlinks.push(relative);
    else if (entry.isFile() && relative !== SEAL_FILE)
      files.push({ path: relative, sha256: sha256(fs.readFileSync(full)) });
  }
  files.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  return { files, symlinks: symlinks.sort() };
}

function sealHash({ unit, previous, files }: Omit<Seal, "seal">): string {
  return sha256(JSON.stringify({ unit, previous, files }));
}

const isHash = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f]{64}$/.test(v);

function isSeal(value: unknown): value is Seal {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const seal = value as Record<string, unknown>;
  return (
    typeof seal.unit === "string" &&
    (seal.previous === null || isHash(seal.previous)) &&
    isHash(seal.seal) &&
    Array.isArray(seal.files) &&
    seal.files.every(
      (f: unknown) =>
        typeof f === "object" &&
        f !== null &&
        typeof (f as Record<string, unknown>).path === "string" &&
        isHash((f as Record<string, unknown>).sha256),
    )
  );
}

/** Reads a unit's seal, refusing anything that is not structurally a seal. */
export function readSeal(root: string, unit: string): Seal {
  const seal: unknown = JSON.parse(fs.readFileSync(sealPath(root, unit), "utf8"));
  if (!isSeal(seal)) throw new Error("not a seal");
  return seal;
}

function isHead(value: unknown): value is Head {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const head = value as Record<string, unknown>;
  return typeof head.unit === "string" && isHash(head.seal);
}

/** Reads every chain's head, refusing anything that is not structurally a set of heads. */
export function readHeads(root: string): Record<string, Head> {
  const file = path.join(root, HEADS_FILE);
  if (!fs.existsSync(file)) return {};
  const heads: unknown = JSON.parse(fs.readFileSync(file, "utf8"));
  if (typeof heads !== "object" || heads === null || Array.isArray(heads) || !Object.values(heads).every(isHead)) {
    throw new Error("not a set of chain heads");
  }
  return heads as Record<string, Head>;
}

function writeHead(root: string, chain: string, head: Head): void {
  const heads = { ...readHeads(root), [chain]: head };
  const sorted = Object.fromEntries(Object.entries(heads).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
  fs.writeFileSync(path.join(root, HEADS_FILE), `${JSON.stringify(sorted, null, 2)}\n`);
}

/**
 * Checks the unit list itself before anything is read or written: every unit
 * is a canonical relative path that stays beneath the root without passing
 * through a symlink, and no unit is listed twice or contains another.
 */
export function unitErrors(root: string, units: string[]): string[] {
  const errors: string[] = [];
  // Keyed case- and normalization-insensitively: on Windows and macOS, "one"
  // and "ONE" are the same directory, so they must never count as two units.
  const seen = new Map<string, string>();
  for (const unit of units) {
    const segments = unit.split("/");
    if (!/^[^/\\:]+(\/[^/\\:]+)*$/.test(unit) || segments.some((x) => x === "." || x === "..")) {
      errors.push(`${unit}: unit must be a relative path beneath the root, with "/" separators and no "." or ".."`);
      continue;
    }
    const key = unit.normalize("NFC").toLowerCase();
    const first = seen.get(key);
    if (first === unit) errors.push(`${unit}: unit listed twice`);
    else if (first !== undefined)
      errors.push(`${unit}: unit is the same directory as ${first} on case-insensitive filesystems`);
    else seen.set(key, unit);
    let current = path.resolve(root);
    for (const segment of segments) {
      current = path.join(current, segment);
      const stat = fs.lstatSync(current, { throwIfNoEntry: false });
      if (!stat) break;
      if (stat.isSymbolicLink()) {
        errors.push(`${unit}: unit path passes through a symlink`);
        break;
      }
    }
  }
  for (const [outerKey, outer] of seen) {
    for (const [innerKey, inner] of seen) {
      if (innerKey.startsWith(`${outerKey}/`)) errors.push(`${outer}: unit contains unit ${inner}`);
    }
  }
  return errors;
}

/**
 * Checks a named chain of units, oldest first. The unit list must be safe first
 * (see unitErrors); then every sealed unit still holds exactly the files it was
 * sealed with, every seal matches its own content and chains to the seal
 * before it, no open unit precedes a sealed one, and the chain's head agrees:
 * every unit up to the head is still sealed, none beyond it is, and the head's
 * seal is the one its unit holds.
 */
export function checkChain(root: string, chain: string, units: string[]): string[] {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(chain)) {
    return [`${chain}: chain name must be lowercase kebab-case (a-z, 0-9, single hyphens)`];
  }
  // An unsafe unit list is reported on its own: nothing under it is read.
  const errors = unitErrors(root, units);
  if (errors.length) return errors;
  let head: Head | undefined;
  try {
    head = readHeads(root)[chain];
  } catch (e) {
    return [`${HEADS_FILE}: unreadable chain heads (${e instanceof Error ? e.message : String(e)})`];
  }
  let previous: string | null = null;
  let open: string | undefined;
  for (const unit of units) {
    if (!isSealed(root, unit)) {
      open ??= unit;
      continue;
    }
    if (open) errors.push(`${unit}: sealed after open unit ${open}`);
    let seal: Seal;
    try {
      seal = readSeal(root, unit);
    } catch (e) {
      errors.push(`${unit}: unreadable seal (${e instanceof Error ? e.message : String(e)})`);
      continue;
    }
    if (seal.unit !== unit) errors.push(`${unit}: seal belongs to unit ${seal.unit}`);
    if (seal.seal !== sealHash(seal)) errors.push(`${unit}: seal does not match its own content`);
    if (seal.previous !== previous) errors.push(`${unit}: seal does not chain to the previous seal`);
    const { files, symlinks } = contents(root, unit);
    for (const link of symlinks) errors.push(`${unit}/${link}: symlink in sealed unit`);
    const sealed = new Map(seal.files.map((f) => [f.path, f.sha256]));
    const now = new Map(files.map((f) => [f.path, f.sha256]));
    for (const [file, hash] of now) {
      if (!sealed.has(file)) errors.push(`${unit}/${file}: added after sealing`);
      else if (sealed.get(file) !== hash) errors.push(`${unit}/${file}: changed after sealing`);
    }
    for (const file of sealed.keys()) {
      if (!now.has(file)) errors.push(`${unit}/${file}: removed after sealing`);
    }
    previous = seal.seal;
  }
  const sealed = units.filter((unit) => isSealed(root, unit));
  if (!head) {
    if (sealed.length) errors.push(`${chain}: chain has seals but no head in ${HEADS_FILE}`);
    return errors;
  }
  const last = units.indexOf(head.unit);
  if (last < 0) {
    errors.push(`${chain}: head names unit ${head.unit}, which is not in the chain`);
    return errors;
  }
  units.forEach((unit, i) => {
    if (i <= last && !isSealed(root, unit)) errors.push(`${unit}: seal removed after sealing`);
    if (i > last && isSealed(root, unit)) errors.push(`${unit}: sealed beyond the chain's head`);
  });
  try {
    if (isSealed(root, head.unit) && readSeal(root, head.unit).seal !== head.seal) {
      errors.push(`${chain}: head does not match the seal of ${head.unit}`);
    }
  } catch {
    // An unreadable seal is already reported above.
  }
  return errors;
}

/**
 * Seals every open unit of a named chain, oldest first, each chained to the seal
 * before it, then moves the chain's head to the newest seal. Refuses a chain whose seals are broken, an empty unit, and a unit
 * holding symlinks. Returns the units it sealed; a fully sealed chain is left
 * as it is.
 */
export function sealChain(root: string, chain: string, units: string[]): string[] {
  const errors = checkChain(root, chain, units);
  if (errors.length) throw new Error(`refusing to seal a chain with broken seals:\n${errors.join("\n")}`);
  // Every seal is computed before any is written, so a refusal leaves no partly sealed chain.
  const seals: Seal[] = [];
  let previous: string | null = null;
  for (const unit of units) {
    if (isSealed(root, unit)) {
      previous = readSeal(root, unit).seal;
      continue;
    }
    const { files, symlinks } = contents(root, unit);
    if (symlinks.length) throw new Error(`${unit}: refusing to seal symlinks: ${symlinks.join(", ")}`);
    if (!files.length) throw new Error(`${unit}: refusing to seal an empty unit`);
    const content = { unit, previous, files };
    const seal: Seal = { ...content, seal: sealHash(content) };
    seals.push(seal);
    previous = seal.seal;
  }
  for (const seal of seals) {
    // "wx" refuses to overwrite: a seal is as immutable as what it closes.
    fs.writeFileSync(sealPath(root, seal.unit), `${JSON.stringify(seal, null, 2)}\n`, { flag: "wx" });
  }
  const newest = seals.at(-1);
  // The head moves forward only once every new seal is written.
  if (newest) writeHead(root, chain, { unit: newest.unit, seal: newest.seal });
  return seals.map((s) => s.unit);
}
