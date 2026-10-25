import spawn from "cross-spawn";
import gfs from "graceful-fs";
import lockfile from "proper-lockfile";
import { createHash } from "node:crypto";
import type { Dirent, Stats } from "node:fs";
import { basename, dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

/** Files keyed by `/`-separated relative path. */
export type Files = Record<string, Buffer>;

/** A change to publish: `files` placed under the new directory `prefix`, all or nothing. */
export interface Change {
  prefix: string;
  files: Files;
}

/** A failed precondition of `reconcile`: what the caller expected at a path, and what was there. */
export interface Stale {
  path: string;
  expected: string;
  found: string;
}

/** A directory `reconcile` staged or kept aside that the host would not let it remove, and the host's error. */
export interface Leftover {
  path: string;
  error: unknown;
}

/**
 * A host operation refused: before anything was written, or, for a read,
 * before anything was returned. The one exception is `UNRESTORED`: a
 * reconciliation failed and so did its rollback, and what it displaced is
 * kept at `kept`.
 */
export class HostingError extends Error {
  constructor(
    message: string,
    readonly code: "INVALID_PATH" | "COLLISION" | "EXISTS" | "NOT_EMPTY" | "UNFAITHFUL" | "NOT_FILE" | "MISSING" | "STALE" | "UNRESTORED",
    /** For `STALE`, every failed precondition, in path order. */
    readonly findings: Stale[] = [],
    /** For `UNRESTORED`, the failure that started the rollback, and where the displaced files are kept. */
    recovery?: { cause: unknown; kept: string },
  ) {
    super(message, recovery && { cause: recovery.cause });
    this.name = "HostingError";
    this.kept = recovery?.kept;
  }

  /** For `UNRESTORED`, the directory beside the root holding every displaced file not put back, at its own relative path. */
  readonly kept?: string;

  /** For a reconciliation, what it staged or kept aside and could not remove, in path order; absent when nothing is left. */
  leftovers?: Leftover[];
}

// graceful-fs patches the callback API (on Windows, rename retries through
// antivirus and indexer locks), so every call goes through it, looked up at
// call time.
const readdir = (path: string) => promisify(gfs.readdir)(path, { withFileTypes: true }) as Promise<Dirent[]>;
const readBytes = (path: string) => promisify(gfs.readFile)(path) as Promise<Buffer>;
const writeFile = (path: string, data: Uint8Array) => promisify(gfs.writeFile)(path, data);
const mkdir = (path: string) => promisify(gfs.mkdir)(path, { recursive: true });
const mkdtemp = (prefix: string) => promisify(gfs.mkdtemp)(prefix);
const rename = (from: string, to: string) => promisify(gfs.rename)(from, to);
const rm = (path: string, options: { maxRetries?: number } = {}) => promisify(gfs.rm)(path, { recursive: true, force: true, ...options });
const rmdir = (path: string) => promisify(gfs.rmdir)(path);
const chmod = (path: string, mode: number) => promisify(gfs.chmod)(path, mode);
const stat = (path: string) => promisify(gfs.stat)(path);
const lstat = (path: string) => promisify(gfs.lstat)(path);
const realpath = (path: string) => promisify(gfs.realpath)(path);
const realpathNative = (path: string) => promisify(gfs.realpath.native)(path);

function missing(e: unknown): boolean {
  return (e as NodeJS.ErrnoException).code === "ENOENT";
}

// Nothing is at a path whose parent is a file: Windows says ENOENT, the
// others ENOTDIR, and Hosting says the same on every host.
function absent(e: unknown): boolean {
  return missing(e) || (e as NodeJS.ErrnoException).code === "ENOTDIR";
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch (e) {
    if (missing(e)) return false;
    throw e;
  }
}

/**
 * Every file under `root`, and every directory, by relative path. A link to a
 * file reads as that file; a link to a directory is refused, since Hosting
 * neither reads nor writes through one.
 */
async function walk(root: string, rel: string, files: Files, dirs: string[] = []): Promise<void> {
  let entries: Dirent[];
  try {
    entries = await readdir(rel ? join(root, rel) : root);
  } catch (e) {
    if (missing(e)) return;
    throw e;
  }
  for (const entry of entries) {
    const path = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      dirs.push(path);
      await walk(root, path, files, dirs);
      continue;
    }
    let target: Stats;
    try {
      target = await stat(join(root, path));
    } catch (e) {
      if (missing(e)) continue;
      throw e;
    }
    if (target.isDirectory()) throw new HostingError(`${path} is a link to a directory; Hosting does not follow one`, "INVALID_PATH");
    // Defined, not assigned: a file named `__proto__` is a file like any other.
    if (target.isFile()) Object.defineProperty(files, path, { value: await readBytes(join(root, path)), enumerable: true, writable: true, configurable: true });
  }
}

/**
 * Read a directory tree: every file, keyed by `/`-separated relative path.
 * A missing directory reads as empty.
 */
export async function read(dir: string): Promise<Files> {
  const files: Files = {};
  await walk(resolve(dir), "", files);
  return files;
}

/**
 * Read one file: its exact bytes. A link to a file reads as that file, as
 * in `read`. A directory, a link to one, a cycle of links, or anything else
 * that is not a file is refused with `NOT_FILE`; a missing path, a dangling link
 * included, with `MISSING`, since a single file has no empty reading.
 */
export async function readFile(path: string): Promise<Buffer> {
  const at = resolve(path);
  try {
    const target = await stat(at);
    if (target.isDirectory()) throw new HostingError(`${path} is a directory, or a link to one; Hosting does not follow one`, "NOT_FILE");
    if (!target.isFile()) throw new HostingError(`${path} is not a file`, "NOT_FILE");
    return await readBytes(at);
  } catch (e) {
    if (absent(e)) throw new HostingError(`${path} does not exist`, "MISSING");
    if ((e as NodeJS.ErrnoException).code === "ELOOP") throw new HostingError(`${path} is a link that never reaches a file`, "NOT_FILE");
    throw e;
  }
}

/** What `kind` finds at a path. */
export type Kind = "directory" | "file" | "missing" | "other";

/**
 * What is at a path, following links as `read` and `readFile` do: a link to a
 * directory, a junction included, is `directory`, and a link to a file is
 * `file`. Nothing, a path below a file, and a dangling link are `missing`, as
 * `readFile` reports them. Anything that exists but is neither, a cycle of
 * links or a socket, pipe or device, is `other`. Any other failure to look,
 * a denied permission among them, is thrown as the host reports it, never
 * taken for an answer. Like `read`, it takes no lock.
 */
export async function kind(path: string): Promise<Kind> {
  let target: Stats;
  try {
    target = await stat(resolve(path));
  } catch (e) {
    if (absent(e)) return "missing";
    if ((e as NodeJS.ErrnoException).code === "ELOOP") return "other";
    throw e;
  }
  if (target.isDirectory()) return "directory";
  if (target.isFile()) return "file";
  return "other";
}

/**
 * Whether `candidate` lies within `root`: the host's native canonical path of
 * `root` (links, junctions, `..` and the host's own spelling resolved) is the
 * candidate's own, or an exact prefix of its path segments. Segments are
 * compared exactly, with no case folding and no string prefix, so `/repo2`
 * is not within `/repo`. Both paths must exist: a missing path, a dangling
 * link or a cycle of links is refused with `MISSING`, never answered `false`.
 * Any other failure to resolve is thrown as the host reports it.
 *
 * This is canonical-path containment, not physical-object containment: a
 * bind mount, a hard link or another alias can reach the same object from
 * outside `root`. It is a check, not a lock: a link changed between this
 * check and a later read is not prevented.
 */
export async function within(root: string, candidate: string): Promise<boolean> {
  const outer = segments(await resolved(root));
  const inner = segments(await resolved(candidate));
  return outer.length <= inner.length && outer.every((s, i) => s === inner[i]);
}

async function resolved(path: string): Promise<string> {
  try {
    return await realpathNative(resolve(path));
  } catch (e) {
    if (absent(e)) throw new HostingError(`${path} does not exist`, "MISSING");
    if ((e as NodeJS.ErrnoException).code === "ELOOP") throw new HostingError(`${path} is a link that never resolves`, "MISSING");
    throw e;
  }
}

function segments(path: string): string[] {
  return path.split(sep).filter((s) => s !== "");
}

// Names Windows cannot hold: reserved characters, a trailing dot or space,
// and device names, with or without an extension.
const RESERVED_CHARS = /[<>:"|?*\u0000-\u001f\\]/;
const DEVICE = /^(con|prn|aux|nul|com[1-9¹²³]|lpt[1-9¹²³])(\..*)?$/i;

// Case folding as case-insensitive hosts apply it: upper- then lowercasing
// folds what lowercasing alone keeps apart (final sigma and sigma, ß and ss).
// Where hosts differ, the stricter reading is refused everywhere.
function key(path: string): string {
  return path.normalize("NFC").toUpperCase().toLowerCase().normalize("NFC");
}

function prefixes(path: string): string[] {
  const segments = path.split("/");
  return segments.map((_, i) => segments.slice(0, i + 1).join("/"));
}

/**
 * Refuse paths that would not be held faithfully on every supported host
 * (Linux, Windows, macOS): invalid segments, and distinct paths that collapse
 * into one where names are compared without case or Unicode normalization.
 * The rule is the same on every host, so content written on one stays
 * portable to the others.
 */
function checkPortable(paths: string[], existing: string[] = []): void {
  const seen = new Map<string, string>();
  for (const path of existing) for (const p of prefixes(path)) seen.set(key(p), p);
  for (const path of paths) {
    const segments = path.split("/");
    if (path.startsWith("/") || segments.some((s) => s === "" || s === "." || s === ".."))
      throw new HostingError(`${path} is not a relative path`, "INVALID_PATH");
    const bad = segments.find((s) => RESERVED_CHARS.test(s) || /[. ]$/.test(s) || DEVICE.test(s));
    if (bad !== undefined) throw new HostingError(`${path}: "${bad}" is not a portable name on Windows, macOS and Linux`, "INVALID_PATH");
    for (const p of prefixes(path)) {
      const other = seen.get(key(p));
      if (other !== undefined && other !== p)
        throw new HostingError(`${p} and ${other} are the same name where case or Unicode normalization is ignored`, "COLLISION");
      seen.set(key(p), p);
    }
  }
}

async function writeAll(dir: string, files: Files): Promise<void> {
  for (const [path, bytes] of Object.entries(files)) {
    await mkdir(dirname(join(dir, path)));
    await writeFile(join(dir, path), bytes);
  }
}

/** The staged tree must read back exactly as intended, or nothing is published. */
async function checkFaithful(staging: string, files: Files): Promise<void> {
  const back: Files = {};
  await walk(staging, "", back);
  const want = Object.keys(files).sort();
  const got = Object.keys(back).sort();
  if (want.length !== got.length || want.some((p, i) => p !== got[i] || !files[p].equals(back[p])))
    throw new HostingError("this host did not hold the files exactly as given; nothing was published", "UNFAITHFUL");
}

/**
 * Stage `files` beside the directory and hand the staged tree to `publish`.
 * Staging never sits inside the directory, so the directory only ever holds
 * published content. The staged tree is removed whatever happens.
 */
async function staged(at: string, files: Files, publish: (staging: string) => Promise<void>): Promise<void> {
  const staging = await mkdtemp(`${at}.staging-`);
  try {
    await writeAll(staging, files);
    await checkFaithful(staging, files);
    await publish(staging);
  } finally {
    await rm(staging);
  }
}

// One directory has one lock, whatever path names it: the lock sits beside
// the directory's canonical path, with symlinks resolved.
async function canonical(dir: string): Promise<string> {
  try {
    return await realpath(dir);
  } catch (e) {
    if (!missing(e)) throw e;
    return join(await realpath(dirname(dir)), basename(dir));
  }
}

async function exclusive<T>(dir: string, fn: (at: string) => Promise<T>): Promise<T> {
  await mkdir(dirname(resolve(dir)));
  const at = await canonical(resolve(dir));
  const release = await lockfile.lock(at, {
    realpath: false,
    lockfilePath: `${at}.lock`,
    fs: gfs,
    stale: 10_000,
    retries: { retries: 100, minTimeout: 20, maxTimeout: 250 },
  });
  try {
    return await fn(at);
  } finally {
    await release();
  }
}

/**
 * The first segment of `prefix` that does not exist yet: publishing creates
 * it, whole, with one rename. Everything above it must be a real directory
 * inside `root`, never a link, so nothing is published elsewhere.
 */
async function newTop(root: string, prefix: string): Promise<string> {
  for (const p of prefixes(prefix)) {
    let entry: Stats;
    try {
      entry = await lstat(join(root, p));
    } catch (e) {
      if (missing(e)) return p;
      throw e;
    }
    if (entry.isSymbolicLink()) throw new HostingError(`${p} is a link; a change is published only inside the directory`, "INVALID_PATH");
    if (!entry.isDirectory()) throw new HostingError(`${p} exists and is not a directory`, "EXISTS");
  }
  throw new HostingError(`${prefix} already exists`, "EXISTS");
}

/**
 * Change a directory as its only writer. Under a lock held across processes,
 * `plan` receives the directory as it is and returns the change to make, or
 * nothing. The change is published all or nothing: its files are staged
 * beside the directory, read back to confirm the host holds them exactly,
 * and renamed into place as the new directory `prefix`, which must not exist
 * yet. Any directories `prefix` needs are part of that one rename, so any
 * failure leaves the directory exactly as it was. The directory must exist
 * (`initialize` creates one), on the same filesystem as its parent.
 */
export async function update<T extends Change | undefined>(dir: string, plan: (current: Files) => T | Promise<T>): Promise<T> {
  return exclusive(dir, async (at) => {
    const current: Files = {};
    const dirs: string[] = [];
    await walk(at, "", current, dirs);
    const change = await plan(current);
    if (!change) return change;
    const paths = Object.keys(change.files).sort();
    if (paths.length === 0) throw new HostingError("a change carries at least one file", "INVALID_PATH");
    checkPortable(
      paths.map((p) => `${change.prefix}/${p}`),
      [...dirs, ...Object.keys(current)],
    );
    const top = await newTop(at, change.prefix);
    const below = change.prefix.slice(top.length + 1);
    const files = Object.fromEntries(Object.entries(change.files).map(([p, bytes]) => [below ? `${below}/${p}` : p, bytes]));
    await staged(at, files, (staging) => rename(staging, join(at, top)));
    return change;
  });
}

/**
 * Populate a missing or empty directory with `files`, as its only writer. A
 * missing directory is staged beside it and renamed into place, so it appears
 * complete or not at all. An existing empty directory is kept, never removed
 * or replaced (it may be the current directory): the staged entries are
 * moved into it, and moved back out if any move fails. Anything else is
 * refused and nothing is written. The directory and its parent must be on
 * one filesystem. Returns the paths written.
 */
export async function initialize(dir: string, files: Files): Promise<string[]> {
  const paths = Object.keys(files).sort();
  checkPortable(paths);
  return exclusive(dir, async (at) => {
    if (!(await exists(at))) {
      await staged(at, files, (staging) => rename(staging, at));
      return paths;
    }
    if (!(await stat(at)).isDirectory()) throw new HostingError(`${dir} exists and is not a directory`, "NOT_EMPTY");
    if ((await readdir(at)).length > 0) throw new HostingError(`${dir} is not empty`, "NOT_EMPTY");
    await staged(at, files, async (staging) => {
      const moved: string[] = [];
      try {
        for (const entry of await readdir(staging)) {
          await rename(join(staging, entry.name), join(at, entry.name));
          moved.push(entry.name);
        }
      } catch (e) {
        for (const name of moved) await rename(join(at, name), join(staging, name));
        throw e;
      }
    });
    return paths;
  });
}

/** One write of a reconciliation: `bytes` at `path`, if what is there now has the SHA-256 `expect`, or is `"absent"`. */
export interface Write {
  path: string;
  expect: string;
  bytes: Uint8Array;
  executable?: boolean;
}

/** One removal of a reconciliation: the file at `path`, if it has the SHA-256 `expect`, or is `"absent"`. */
export interface Removal {
  path: string;
  expect: string;
}

/** The writes and removals `reconcile` applies together. */
export interface Reconciliation {
  write: Write[];
  remove: Removal[];
}

/** What `reconcile` did: every entry's outcome, and the directories its removals emptied, each in path order. */
export interface Reconciled {
  outcomes: { path: string; outcome: "written" | "removed" | "unchanged" }[];
  pruned: string[];
  /** What it staged or kept aside and could not remove, in path order; absent when nothing is left. */
  leftovers?: Leftover[];
}

// Path order: by UTF-16 code unit, the same on every host.
const byPath = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

const sha256 = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");

// Whether a mode is executable, where the host has an executable mode at all.
const modes = process.platform !== "win32";
const executable = (mode: number) => (mode & 0o111) !== 0;

async function names(dir: string): Promise<string[]> {
  try {
    return (await readdir(dir)).map((entry) => entry.name);
  } catch (e) {
    if (absent(e)) return [];
    throw e;
  }
}

/**
 * What is at `path` under `root`, looking at each segment without following
 * it: a link anywhere is refused, as is a non-directory where a directory is
 * needed, and a name that collides with one already present. Returns the
 * file's SHA-256 and whether it is executable, `"absent"`, or `"not a file"`.
 * Against what this reconciliation `removed`, a removed file where a directory
 * is needed, and a directory holding only removed files, count as `"absent"`.
 */
async function present(root: string, path: string, removed: Set<string>): Promise<{ found: string; executable: boolean }> {
  const segments = path.split("/");
  for (let i = 0; i < segments.length; i++) {
    const at = segments.slice(0, i + 1).join("/");
    const other = (await names(join(root, ...segments.slice(0, i)))).find((n) => n !== segments[i] && key(n) === key(segments[i]));
    if (other !== undefined) throw new HostingError(`${at} and ${[...segments.slice(0, i), other].join("/")} are the same name where case or Unicode normalization is ignored`, "COLLISION");
    let entry: Stats;
    try {
      entry = await lstat(join(root, ...segments.slice(0, i + 1)));
    } catch (e) {
      if (absent(e)) return { found: "absent", executable: false };
      throw e;
    }
    if (entry.isSymbolicLink()) throw new HostingError(`${at} is a link; Hosting does not reconcile through one`, "INVALID_PATH");
    if (i < segments.length - 1) {
      if (!entry.isDirectory()) {
        if (removed.has(at)) return { found: "absent", executable: false };
        throw new HostingError(`${at} is not a directory`, "EXISTS");
      }
      continue;
    }
    if (entry.isDirectory() && (await emptied(join(root, ...segments), path, removed))) return { found: "absent", executable: false };
    if (!entry.isFile()) return { found: "not a file", executable: false };
    return { found: sha256(await readBytes(join(root, ...segments))), executable: executable(entry.mode) };
  }
  throw new HostingError(`${path} is not a relative path`, "INVALID_PATH");
}

/** Whether every file under `dir` is removed, and nothing else would stay. */
async function emptied(dir: string, path: string, removed: Set<string>): Promise<boolean> {
  const inside = await names(dir);
  if (inside.length === 0) return false;
  for (const name of inside) {
    const entry = await lstat(join(dir, name));
    if (entry.isFile() ? !removed.has(`${path}/${name}`) : !entry.isDirectory() || !(await emptied(join(dir, name), `${path}/${name}`, removed))) return false;
  }
  return true;
}

/**
 * Bring individual files under `root` to a planned state, as its only Hosting
 * writer. Every write and removal is guarded by `expect`: the SHA-256 of the
 * bytes the caller expects at its path now, or `"absent"`. Under the lock
 * `update` takes, every precondition is checked before anything is touched;
 * if any fails, nothing changes and the refusal (`STALE`) lists them all.
 * Otherwise the new bytes are staged beside `root` and read back, replaced and
 * removed files are kept aside, and everything is put in place by renames. A
 * failure Hosting observes while applying is rolled back and rethrown: every
 * path it touched holds the same kind of entry, the same bytes and the same
 * executable mark as before, and no other metadata is promised. If the host
 * refuses the rollback too, the refusal is `UNRESTORED`, `root` may be partly
 * applied, and every displaced file not put back stays in `kept`, beside
 * `root`, at its own path. Removals prune the directories they empty, never
 * `root`, and come before every write, so one reconciliation can turn a file
 * into a directory (a removal with writes under it) or a directory into a
 * file (a write expecting `"absent"` with removals of everything under it). A write marked `executable` is executable where the host has the
 * mode, and one without it is not.
 *
 * This is rollback on observed failure, not a transaction: the lock excludes
 * Hosting's writers only, readers can see a reconciliation half applied, and
 * a reconciliation cut off by the end of the process is not rolled back.
 */
export async function reconcile(root: string, reconciliation: Reconciliation): Promise<Reconciled> {
  if ((await kind(root)) !== "directory") throw new HostingError(`${root} does not exist or is not a directory`, "MISSING");
  const entries = [
    ...reconciliation.write.map((w) => ({ ...w, bytes: Buffer.from(w.bytes), remove: false })),
    ...reconciliation.remove.map((r) => ({ path: r.path, expect: r.expect, bytes: undefined, executable: false, remove: true })),
  ].sort((a, b) => byPath(a.path, b.path));
  const paths = entries.map((e) => e.path);
  const repeated = paths.find((p, i) => i > 0 && paths[i - 1] === p);
  if (repeated !== undefined) throw new HostingError(`${repeated} appears more than once in one reconciliation`, "INVALID_PATH");
  // Paths nest only where a kind changes: writes expecting "absent" under a
  // removal (a file becomes a directory), or removals under a write expecting
  // "absent" (a directory becomes a file). Anything else under one path is
  // refused before the host is looked at.
  for (const p of entries)
    for (const q of entries) {
      if (!q.path.startsWith(`${p.path}/`)) continue;
      if (q.remove === p.remove) throw new HostingError(`${p.path} and ${q.path} under it are both ${p.remove ? "removed" : "written"} in this reconciliation`, "INVALID_PATH");
      const write = p.remove ? q : p;
      if (write.expect !== "absent") throw new HostingError(`${write.path} must expect "absent" to change ${p.path} from a ${p.remove ? "file into a directory" : "directory into a file"}`, "INVALID_PATH");
    }
  checkPortable(paths);
  return exclusive(root, async (at) => {
    const now = new Map<string, { found: string; executable: boolean }>();
    const removed = new Set(entries.filter((e) => e.remove).map((e) => e.path));
    for (const e of entries) now.set(e.path, await present(at, e.path, removed));
    const findings = entries.filter((e) => now.get(e.path)!.found !== e.expect).map((e) => ({ path: e.path, expected: e.expect, found: now.get(e.path)!.found }));
    if (findings.length > 0) throw new HostingError(`${findings.map((f) => f.path).join(", ")}: not as expected; nothing was changed`, "STALE", findings);

    const outcomes = entries.map((e) => {
      const was = now.get(e.path)!;
      if (e.remove) return { path: e.path, outcome: was.found === "absent" ? ("unchanged" as const) : ("removed" as const) };
      const same = was.found === sha256(e.bytes!) && (!modes || was.executable === !!e.executable);
      return { path: e.path, outcome: same ? ("unchanged" as const) : ("written" as const) };
    });
    const writes = entries.filter((e, i) => !e.remove && outcomes[i].outcome === "written");
    const removals = entries.filter((e, i) => e.remove && outcomes[i].outcome === "removed");
    const aside = [...writes.filter((e) => now.get(e.path)!.found !== "absent"), ...removals];
    if (writes.length === 0 && removals.length === 0) return { outcomes, pruned: [] };

    const staging = await mkdtemp(`${at}.staging-`);
    const kept = await mkdtemp(`${at}.aside-`);
    const undo: (() => Promise<unknown>)[] = [];
    const pruned: string[] = [];
    let restored = true;
    let failed = false;
    let failure: unknown;
    try {
      for (const [i, e] of writes.entries()) {
        await writeFile(join(staging, String(i)), e.bytes!);
        if (e.executable) {
          const mode = (await stat(join(staging, String(i)))).mode & 0o777;
          await chmod(join(staging, String(i)), mode | ((mode & 0o444) >> 2));
        }
      }
      for (const [i, e] of writes.entries())
        if (!(await readBytes(join(staging, String(i)))).equals(e.bytes!))
          throw new HostingError("this host did not hold the files exactly as given; nothing was changed", "UNFAITHFUL");
      try {
        for (const e of aside) {
          const target = join(at, ...e.path.split("/"));
          const away = join(kept, ...e.path.split("/"));
          await promisify(gfs.mkdir)(join(away, ".."), { recursive: true });
          await rename(target, away);
          undo.push(() => rename(away, target));
        }
        for (const e of removals) {
          const segments = e.path.split("/");
          for (let j = segments.length - 1; j >= 1; j--) {
            const dir = segments.slice(0, j).join("/");
            if (pruned.includes(dir) || writes.some((w) => w.path.startsWith(`${dir}/`)) || (await names(join(at, ...segments.slice(0, j)))).length > 0) break;
            await rmdir(join(at, ...segments.slice(0, j)));
            pruned.push(dir);
            undo.push(() => promisify(gfs.mkdir)(join(at, ...segments.slice(0, j))));
          }
        }
        for (const [i, e] of writes.entries()) {
          const segments = e.path.split("/");
          for (let j = 1; j < segments.length; j++) {
            const dir = join(at, ...segments.slice(0, j));
            if (await exists(dir)) continue;
            await promisify(gfs.mkdir)(dir);
            undo.push(() => rmdir(dir));
          }
          const target = join(at, ...segments);
          await rename(join(staging, String(i)), target);
          undo.push(() => rename(target, join(staging, String(i))));
        }
      } catch (e) {
        // Restore what was moved, in reverse. A step that cannot be undone
        // leaves the kept-aside files where they are, at their own paths,
        // never deleted, and is reported apart from a rollback that held.
        for (const step of undo.reverse()) {
          try {
            await step();
          } catch {
            restored = false;
          }
        }
        if (!restored)
          throw new HostingError(
            `${root} could not be restored after: ${(e as Error).message}; the files it replaced or removed and could not put back are kept in ${kept}`,
            "UNRESTORED",
            [],
            { cause: e, kept },
          );
        throw e;
      }
    } catch (e) {
      failed = true;
      failure = e;
    }
    // The outcome is settled; removing what was staged or kept aside never
    // changes it. What the host will not let go of is reported, never lost.
    const leftovers: Leftover[] = [];
    for (const dir of restored ? [kept, staging] : [staging])
      await rm(dir, { maxRetries: 3 }).catch((error: unknown) => leftovers.push({ path: dir, error }));
    leftovers.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
    if (failed) {
      if (leftovers.length > 0 && typeof failure === "object" && failure !== null) Object.assign(failure, { leftovers });
      throw failure;
    }
    const report: Reconciled = { outcomes, pruned: pruned.sort(byPath) };
    if (leftovers.length > 0) report.leftovers = leftovers;
    return report;
  });
}

/** What a command did: its exit status and everything it wrote. */
export interface Execution {
  status: number;
  stdout: string;
  stderr: string;
}

/**
 * Run an installed command, by name on the PATH or by path, with `args`
 * passed exactly as given, and collect what it writes. However the host
 * realizes the command (an executable, or on Windows a `.cmd` shim such as
 * npm installs), the caller only names it: no shell interprets the
 * arguments. A command that runs and fails resolves with its status; one
 * that cannot be started rejects.
 */
export function execute(command: string, args: string[], options: { cwd: string; env?: NodeJS.ProcessEnv }): Promise<Execution> {
  return new Promise((done, fail) => {
    const child = spawn(command, args, { cwd: options.cwd, env: options.env ?? process.env, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout!.setEncoding("utf8").on("data", (s: string) => (stdout += s));
    child.stderr!.setEncoding("utf8").on("data", (s: string) => (stderr += s));
    child.on("error", fail);
    child.on("close", (status, signal) =>
      status === null ? fail(new Error(`${command} was ended by ${signal}`)) : done({ status, stdout, stderr }),
    );
  });
}

/** Hosting's own contribution: its Extension Node, as carried in this package. */
export async function contribution(): Promise<Files> {
  return { "Hosting.md": await readBytes(fileURLToPath(new URL("../payload/Hosting.md", import.meta.url))) };
}
