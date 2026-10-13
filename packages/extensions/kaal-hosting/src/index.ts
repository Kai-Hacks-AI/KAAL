import gfs from "graceful-fs";
import lockfile from "proper-lockfile";
import type { Dirent, Stats } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

/** Files keyed by `/`-separated relative path. */
export type Files = Record<string, Buffer>;

/** A change to publish: `files` placed under the new directory `prefix`, all or nothing. */
export interface Change {
  prefix: string;
  files: Files;
}

/** A host operation refused before anything was written. */
export class HostingError extends Error {
  constructor(
    message: string,
    readonly code: "INVALID_PATH" | "COLLISION" | "EXISTS" | "NOT_EMPTY" | "UNFAITHFUL",
  ) {
    super(message);
    this.name = "HostingError";
  }
}

// graceful-fs patches the callback API (on Windows, rename retries through
// antivirus and indexer locks), so every call goes through it.
const readdir = promisify(gfs.readdir) as (path: string, options: { withFileTypes: true }) => Promise<Dirent[]>;
const readFile = promisify(gfs.readFile) as (path: string) => Promise<Buffer>;
const writeFile = promisify(gfs.writeFile) as (path: string, data: Uint8Array) => Promise<void>;
const mkdir = promisify(gfs.mkdir) as (path: string, options: { recursive: true }) => Promise<string | undefined>;
const mkdtemp = promisify(gfs.mkdtemp) as (prefix: string) => Promise<string>;
const rename = promisify(gfs.rename) as (from: string, to: string) => Promise<void>;
const rm = promisify(gfs.rm) as (path: string, options: { recursive: true; force: true }) => Promise<void>;
const stat = promisify(gfs.stat) as (path: string) => Promise<Stats>;
const lstat = promisify(gfs.lstat) as (path: string) => Promise<Stats>;
const realpath = promisify(gfs.realpath) as (path: string) => Promise<string>;

const STAGING = ".staging-";

function isStaging(entry: Dirent): boolean {
  return entry.isDirectory() && entry.name.startsWith(STAGING);
}

function missing(e: unknown): boolean {
  return (e as NodeJS.ErrnoException).code === "ENOENT";
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

async function walk(root: string, rel: string, files: Files, dirs: string[] = []): Promise<void> {
  let entries: Dirent[];
  try {
    entries = await readdir(rel ? join(root, rel) : root, { withFileTypes: true });
  } catch (e) {
    if (missing(e)) return;
    throw e;
  }
  for (const entry of entries) {
    if (!rel && isStaging(entry)) continue;
    const path = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      dirs.push(path);
      await walk(root, path, files, dirs);
      continue;
    }
    try {
      if ((await stat(join(root, path))).isFile()) files[path] = await readFile(join(root, path));
    } catch (e) {
      if (!missing(e)) throw e;
    }
  }
}

/**
 * Read a directory tree: every file, keyed by `/`-separated relative path.
 * Staging directories of Hosting's own writes are not part of it. A missing
 * directory reads as empty.
 */
export async function read(dir: string): Promise<Files> {
  const files: Files = {};
  await walk(resolve(dir), "", files);
  return files;
}

// Names Windows cannot hold: reserved characters, a trailing dot or space,
// and device names, with or without an extension.
const RESERVED_CHARS = /[<>:"|?*\u0000-\u001f\\]/;
const DEVICE = /^(con|prn|aux|nul|com[1-9¹²³]|lpt[1-9¹²³])(\..*)?$/i;

function key(path: string): string {
  return path.normalize("NFC").toLowerCase();
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
    await mkdir(dirname(join(dir, path)), { recursive: true });
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

async function exclusive<T>(dir: string, fn: () => Promise<T>): Promise<T> {
  await mkdir(dirname(dir), { recursive: true });
  const at = await canonical(dir);
  const release = await lockfile.lock(at, {
    realpath: false,
    lockfilePath: `${at}.lock`,
    fs: gfs,
    stale: 10_000,
    retries: { retries: 100, minTimeout: 20, maxTimeout: 250 },
  });
  try {
    return await fn();
  } finally {
    await release();
  }
}

/** Refuse a prefix reached through a symlink, which would publish outside `root`. */
async function checkContained(root: string, prefix: string): Promise<void> {
  for (const p of prefixes(prefix)) {
    let entry: Stats;
    try {
      entry = await lstat(join(root, p));
    } catch (e) {
      if (missing(e)) return;
      throw e;
    }
    if (entry.isSymbolicLink()) throw new HostingError(`${p} is a symbolic link; a change is published only inside the directory`, "INVALID_PATH");
  }
}

/**
 * Change a directory as its only writer. Under a lock held across processes,
 * `plan` receives the directory as it is and returns the change to make, or
 * nothing. The change is published all or nothing: its files are staged,
 * read back to confirm the host holds them exactly, and renamed into place
 * as the new directory `prefix`, which must not exist yet. Any failure leaves
 * the directory as it was.
 */
export async function update<T extends Change | undefined>(dir: string, plan: (current: Files) => T | Promise<T>): Promise<T> {
  const root = resolve(dir);
  return exclusive(root, async () => {
    const current: Files = {};
    const dirs: string[] = [];
    await walk(root, "", current, dirs);
    const change = await plan(current);
    if (!change) return change;
    const paths = Object.keys(change.files).sort();
    if (paths.length === 0) throw new HostingError("a change carries at least one file", "INVALID_PATH");
    checkPortable(
      paths.map((p) => `${change.prefix}/${p}`),
      [...dirs, ...Object.keys(current)],
    );
    await checkContained(root, change.prefix);
    const target = join(root, change.prefix);
    if (await exists(target)) throw new HostingError(`${change.prefix} already exists`, "EXISTS");
    const staging = await mkdtemp(join(root, STAGING));
    try {
      await writeAll(staging, change.files);
      await checkFaithful(staging, change.files);
      await mkdir(dirname(target), { recursive: true });
      await rename(staging, target);
    } catch (e) {
      await rm(staging, { recursive: true, force: true });
      throw e;
    }
    return change;
  });
}

/**
 * Populate a missing or empty directory with `files`, as its only writer. A
 * missing directory is staged beside it and renamed into place, so it appears
 * complete or not at all. An existing empty directory is kept, never removed
 * or replaced (it may be the current directory): the staged files are moved
 * into it, and moved back out if any move fails. Anything else is refused and
 * nothing is written. Returns the paths written.
 */
export async function initialize(dir: string, files: Files): Promise<string[]> {
  const root = resolve(dir);
  const paths = Object.keys(files).sort();
  checkPortable(paths);
  return exclusive(root, async () => {
    if (!(await exists(root))) {
      const staging = await mkdtemp(join(dirname(root), STAGING));
      try {
        await writeAll(staging, files);
        await checkFaithful(staging, files);
        await rename(staging, root);
      } catch (e) {
        await rm(staging, { recursive: true, force: true });
        throw e;
      }
      return paths;
    }
    if (!(await stat(root)).isDirectory()) throw new HostingError(`${dir} exists and is not a directory`, "NOT_EMPTY");
    if ((await readdir(root, { withFileTypes: true })).length > 0) throw new HostingError(`${dir} is not empty`, "NOT_EMPTY");
    const staging = await mkdtemp(join(root, STAGING));
    const moved: string[] = [];
    try {
      await writeAll(staging, files);
      await checkFaithful(staging, files);
      for (const entry of await readdir(staging, { withFileTypes: true })) {
        await rename(join(staging, entry.name), join(root, entry.name));
        moved.push(entry.name);
      }
    } catch (e) {
      for (const name of moved) await rename(join(root, name), join(staging, name));
      throw e;
    } finally {
      await rm(staging, { recursive: true, force: true });
    }
    return paths;
  });
}

/** Hosting's own contribution: its Extension Node, as carried in this package. */
export async function contribution(): Promise<Files> {
  return { "Hosting.md": await readFile(fileURLToPath(new URL("../payload/Hosting.md", import.meta.url))) };
}
