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

/**
 * The file operations sealing and checking use. Tests replace members to
 * simulate I/O failures (unreadable files, full disks) that cannot be
 * produced portably on every platform.
 */
export const io = {
  lstatSync: fs.lstatSync,
  readFileSync: fs.readFileSync,
  readdirSync: fs.readdirSync,
  writeFileSync: fs.writeFileSync,
  renameSync: fs.renameSync,
};

export const SEAL_FILE = "seal.json";

/** Kept at the root: for each chain, its last sealed unit and that unit's seal. */
export const HEADS_FILE = "seals.json";

/**
 * Held at the root while a chain is sealed. Every chain's head shares one
 * file, so two sealings under the same root at once would each rewrite it
 * from the same old state and one head would be lost; the lock refuses the
 * second instead.
 */
export const LOCK_FILE = "seals.json.lock";

export type Head = { unit: string; seal: string };

const sha256 = (data: string | Buffer) => crypto.createHash("sha256").update(data).digest("hex");

const posix = (p: string) => p.split(path.sep).join("/");

export function sealPath(root: string, unit: string): string {
  return path.join(root, unit, SEAL_FILE);
}

/** A unit is sealed when anything occupies its seal path, even a dangling symlink: whatever it is gets checked. */
export function isSealed(root: string, unit: string): boolean {
  return io.lstatSync(sealPath(root, unit), { throwIfNoEntry: false }) !== undefined;
}

/**
 * Reads a file only if it is a regular file: a symlink could point anywhere,
 * and a FIFO or device would block or never end.
 */
function readRegularFile(file: string): string {
  const stat = fs.lstatSync(file);
  if (!stat.isFile()) throw new Error("not a regular file");
  return io.readFileSync(file, "utf8");
}

/** What a directory entry is, as far as sealing is concerned. */
export type EntryKind = "file" | "directory" | "symlink" | "special file";

/**
 * A seal can only vouch for bytes it holds: regular files are hashed and
 * directories are walked, while symlinks and special files (FIFOs, sockets,
 * devices) can be neither, so they are named rather than silently skipped.
 */
export function entryKind(entry: { isFile(): boolean; isDirectory(): boolean; isSymbolicLink(): boolean }): EntryKind {
  if (entry.isSymbolicLink()) return "symlink";
  if (entry.isFile()) return "file";
  if (entry.isDirectory()) return "directory";
  return "special file";
}

/** Every file in a unit except its seal, by path within the unit, with its hash; and every entry that cannot be sealed. */
function contents(
  root: string,
  unit: string,
): { files: Seal["files"]; unsealable: { path: string; kind: EntryKind }[] } {
  const dir = path.join(root, unit);
  const files: Seal["files"] = [];
  const unsealable: { path: string; kind: EntryKind }[] = [];
  if (!fs.existsSync(dir)) return { files, unsealable };
  // Walked one directory at a time: a recursive readdir would follow a
  // directory symlink out of the unit before it could be refused.
  const pending = [dir];
  for (let current = pending.pop(); current !== undefined; current = pending.pop()) {
    for (const entry of io.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      const relative = posix(path.relative(dir, full));
      const kind = entryKind(entry);
      if (kind === "file") {
        if (relative !== SEAL_FILE) files.push({ path: relative, sha256: sha256(io.readFileSync(full)) });
      } else if (kind === "directory") pending.push(full);
      else unsealable.push({ path: relative, kind });
    }
  }
  const byPath = (a: { path: string }, b: { path: string }) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  return { files: files.sort(byPath), unsealable: unsealable.sort(byPath) };
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
  const seal: unknown = JSON.parse(readRegularFile(sealPath(root, unit)));
  if (!isSeal(seal)) throw new Error("not a seal");
  return seal;
}

function isHead(value: unknown): value is Head {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const head = value as Record<string, unknown>;
  return typeof head.unit === "string" && isHash(head.seal);
}

/**
 * Reads every chain's head, refusing anything that is not structurally a set
 * of heads. The heads are a Map, so a chain named like an Object property
 * ("constructor") never finds an inherited value as its head.
 */
export function readHeads(root: string): Map<string, Head> {
  const file = path.join(root, HEADS_FILE);
  if (!fs.lstatSync(file, { throwIfNoEntry: false })) return new Map();
  const heads: unknown = JSON.parse(readRegularFile(file));
  if (typeof heads !== "object" || heads === null || Array.isArray(heads) || !Object.values(heads).every(isHead)) {
    throw new Error("not a set of chain heads");
  }
  return new Map(Object.entries(heads as Record<string, Head>));
}

function writeHead(root: string, chain: string, head: Head): void {
  const heads = readHeads(root).set(chain, head);
  const sorted = Object.fromEntries([...heads].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
  // Written beside the head file and renamed over it: a rename replaces the
  // path itself and never writes through a link to somewhere else.
  const file = path.join(root, HEADS_FILE);
  const temporary = `${file}.${process.pid}.${Date.now()}.tmp`;
  io.writeFileSync(temporary, `${JSON.stringify(sorted, null, 2)}\n`, { flag: "wx" });
  try {
    io.renameSync(temporary, file);
  } catch (e) {
    fs.rmSync(temporary, { force: true });
    throw e;
  }
}

/**
 * A unit is a path of portable segments: letters, digits, "_" and "-", with
 * single dots only between them. This rules out, on every platform, every
 * spelling that Windows or macOS would resolve to another directory: "." and
 * "..", trailing dots and spaces, separators, drive and stream colons, and
 * non-ASCII characters whose normalization differs.
 */
const PORTABLE_SEGMENT = /^[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)*$/;

/** Windows reserves these device names, with or without an extension, in any case. */
const RESERVED = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;

const UNIT_RULE =
  'unit must be a relative path of portable segments separated by "/": letters, digits, "_", "-", and dots only between them';

/**
 * Checks the unit list itself before anything is read or written: every unit
 * is a canonical relative path that stays beneath the root, passing only
 * through directories (never a symlink or a file), and no unit is listed twice
 * or contains another.
 */
export function unitErrors(root: string, units: string[]): string[] {
  const errors: string[] = [];
  // Keyed case-insensitively: on Windows and macOS, "one" and "ONE" are the
  // same directory, so they must never count as two units.
  const seen = new Map<string, string>();
  for (const unit of units) {
    const segments = unit.split("/");
    if (!segments.every((segment) => PORTABLE_SEGMENT.test(segment))) {
      errors.push(`${unit}: ${UNIT_RULE}`);
      continue;
    }
    const reserved = segments.find((segment) => RESERVED.test(segment));
    if (reserved) {
      errors.push(`${unit}: unit segment "${reserved}" is reserved on Windows`);
      continue;
    }
    const key = unit.toLowerCase();
    const first = seen.get(key);
    if (first === unit) errors.push(`${unit}: unit listed twice`);
    else if (first !== undefined)
      errors.push(`${unit}: unit is the same directory as ${first} on case-insensitive filesystems`);
    else seen.set(key, unit);
    let current = path.resolve(root);
    for (const segment of segments) {
      current = path.join(current, segment);
      let stat: fs.Stats | undefined;
      try {
        stat = io.lstatSync(current, { throwIfNoEntry: false });
      } catch (e) {
        errors.push(`${unit}: unreadable unit path (${e instanceof Error ? e.message : String(e)})`);
        break;
      }
      if (!stat) break;
      if (stat.isSymbolicLink()) {
        errors.push(`${unit}: unit path passes through a symlink`);
        break;
      }
      if (!stat.isDirectory()) {
        errors.push(
          `${unit}: unit path passes through ${path.relative(root, current).split(path.sep).join("/")}, which is not a directory`,
        );
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
    head = readHeads(root).get(chain);
  } catch (e) {
    return [`${HEADS_FILE}: unreadable chain heads (${e instanceof Error ? e.message : String(e)})`];
  }
  // Whether each unit is sealed, probed once. A unit that cannot be probed is
  // reported and then left out: neither sealed nor open.
  const sealed = new Set<string>();
  const unknown = new Set<string>();
  for (const unit of units) {
    try {
      if (isSealed(root, unit)) sealed.add(unit);
    } catch (e) {
      errors.push(`${unit}: unreadable unit (${e instanceof Error ? e.message : String(e)})`);
      unknown.add(unit);
    }
  }
  // The seal the next sealed unit must chain to; undefined after a unit that
  // could not be probed, whose seal is unknown.
  let previous: string | null | undefined = null;
  let open: string | undefined;
  for (const unit of units) {
    if (unknown.has(unit)) {
      previous = undefined;
      continue;
    }
    if (!sealed.has(unit)) {
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
    if (previous !== undefined && seal.previous !== previous)
      errors.push(`${unit}: seal does not chain to the previous seal`);
    let inspected: ReturnType<typeof contents>;
    try {
      inspected = contents(root, unit);
    } catch (e) {
      errors.push(`${unit}: unreadable unit contents (${e instanceof Error ? e.message : String(e)})`);
      previous = seal.seal;
      continue;
    }
    const { files, unsealable } = inspected;
    for (const entry of unsealable) errors.push(`${unit}/${entry.path}: ${entry.kind} in sealed unit`);
    const recorded = new Map(seal.files.map((f) => [f.path, f.sha256]));
    const now = new Map(files.map((f) => [f.path, f.sha256]));
    for (const [file, hash] of now) {
      if (!recorded.has(file)) errors.push(`${unit}/${file}: added after sealing`);
      else if (recorded.get(file) !== hash) errors.push(`${unit}/${file}: changed after sealing`);
    }
    for (const file of recorded.keys()) {
      if (!now.has(file)) errors.push(`${unit}/${file}: removed after sealing`);
    }
    previous = seal.seal;
  }
  if (!head) {
    if (sealed.size) errors.push(`${chain}: chain has seals but no head in ${HEADS_FILE}`);
    return errors;
  }
  const last = units.indexOf(head.unit);
  if (last < 0) {
    errors.push(`${chain}: head names unit ${head.unit}, which is not in the chain`);
    return errors;
  }
  units.forEach((unit, i) => {
    if (unknown.has(unit)) return;
    if (i <= last && !sealed.has(unit)) errors.push(`${unit}: seal removed after sealing`);
    if (i > last && sealed.has(unit)) errors.push(`${unit}: sealed beyond the chain's head`);
  });
  try {
    if (sealed.has(head.unit) && readSeal(root, head.unit).seal !== head.seal) {
      errors.push(`${chain}: head does not match the seal of ${head.unit}`);
    }
  } catch {
    // An unreadable seal is already reported above.
  }
  return errors;
}

/**
 * Seals every open unit of a named chain, oldest first, each chained to the seal
 * before it, then moves the chain's head to the newest seal. Refuses to seal a
 * unit inside, or containing, a unit already sealed by any chain. Refuses a chain whose seals are broken, an empty unit, and a unit
 * holding symlinks or special files, and sealing while another sealing holds
 * the root's lock. Returns the units it sealed; a fully sealed chain is left
 * as it is.
 */
export function sealChain(root: string, chain: string, units: string[]): string[] {
  const lock = path.join(root, LOCK_FILE);
  try {
    // "wx" refuses an existing lock, even a symlink: only one sealing at a time.
    io.writeFileSync(lock, `${process.pid}\n`, { flag: "wx" });
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
    throw new Error(`${LOCK_FILE}: another sealing holds this root; if none is running, remove the lock`);
  }
  try {
    return sealLocked(root, chain, units);
  } finally {
    fs.rmSync(lock, { force: true });
  }
}

function sealLocked(root: string, chain: string, units: string[]): string[] {
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
    const { files, unsealable } = contents(root, unit);
    // Units of different chains must not nest either: a seal written inside
    // another sealed unit would break that unit's seal.
    const segments = unit.split("/");
    for (let i = 1; i < segments.length; i++) {
      const outer = segments.slice(0, i).join("/");
      if (isSealed(root, outer)) throw new Error(`${unit}: refusing to seal a unit inside sealed unit ${outer}`);
    }
    const inner = files.find((f) => f.path.endsWith(`/${SEAL_FILE}`));
    if (inner) {
      const sealedInner = `${unit}/${inner.path.slice(0, -SEAL_FILE.length - 1)}`;
      throw new Error(`${unit}: refusing to seal a unit containing sealed unit ${sealedInner}`);
    }
    if (unsealable.length) {
      const listed = unsealable.map((e) => `${e.path} (${e.kind})`).join(", ");
      throw new Error(`${unit}: refusing to seal entries that are not regular files: ${listed}`);
    }
    if (!files.length) throw new Error(`${unit}: refusing to seal an empty unit`);
    const content = { unit, previous, files };
    const seal: Seal = { ...content, seal: sealHash(content) };
    seals.push(seal);
    previous = seal.seal;
  }
  // If any write fails, the seals this call wrote are removed again, so a
  // failure leaves the chain as it was. Every seal is new ("wx"), so nothing
  // that existed before is ever removed.
  const written: string[] = [];
  try {
    for (const seal of seals) {
      const file = sealPath(root, seal.unit);
      // "wx" refuses to overwrite: a seal is as immutable as what it closes.
      io.writeFileSync(file, `${JSON.stringify(seal, null, 2)}\n`, { flag: "wx" });
      written.push(file);
    }
    const newest = seals.at(-1);
    // The head moves forward only once every new seal is written.
    if (newest) writeHead(root, chain, { unit: newest.unit, seal: newest.seal });
  } catch (e) {
    for (const file of written) fs.rmSync(file, { force: true });
    throw e;
  }
  return seals.map((s) => s.unit);
}
