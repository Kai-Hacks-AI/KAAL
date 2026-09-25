import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

/**
 * A seal closes a unit: a directory whose files must not change once sealed.
 * Units form a chain in an order the using system decides; each seal records
 * the bytes of every file in its unit and the previous seal of the chain, so
 * changing any sealed unit breaks its own seal and every seal after it.
 */
export type Seal = {
  unit: string;
  previous: string | null;
  files: { path: string; sha256: string }[];
  seal: string;
};

export const SEAL_FILE = "seal.json";

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

/**
 * Checks the unit list itself before anything is read or written: every unit
 * is a canonical relative path that stays beneath the root without passing
 * through a symlink, and no unit is listed twice or contains another.
 */
export function unitErrors(root: string, units: string[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const unit of units) {
    const segments = unit.split("/");
    if (!/^[^/\\:]+(\/[^/\\:]+)*$/.test(unit) || segments.some((x) => x === "." || x === "..")) {
      errors.push(`${unit}: unit must be a relative path beneath the root, with "/" separators and no "." or ".."`);
      continue;
    }
    if (seen.has(unit)) errors.push(`${unit}: unit listed twice`);
    seen.add(unit);
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
  const canonical = [...seen];
  for (const outer of canonical) {
    for (const inner of canonical) {
      if (inner.startsWith(`${outer}/`)) errors.push(`${outer}: unit contains unit ${inner}`);
    }
  }
  return errors;
}

/**
 * Checks a chain of units, oldest first. The unit list must be safe first (see
 * unitErrors); then every sealed unit still holds exactly
 * the files it was sealed with, every seal matches its own content and chains
 * to the seal before it, and no open unit precedes a sealed one.
 */
export function checkChain(root: string, units: string[]): string[] {
  // An unsafe unit list is reported on its own: nothing under it is read.
  const errors = unitErrors(root, units);
  if (errors.length) return errors;
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
  return errors;
}

/**
 * Seals every open unit of a chain, oldest first, each chained to the seal
 * before it. Refuses a chain whose seals are broken, an empty unit, and a unit
 * holding symlinks. Returns the units it sealed; a fully sealed chain is left
 * as it is.
 */
export function sealChain(root: string, units: string[]): string[] {
  const errors = checkChain(root, units);
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
  return seals.map((s) => s.unit);
}
