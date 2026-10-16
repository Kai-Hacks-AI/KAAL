import spawn from "cross-spawn";
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

/** A host operation refused: before anything was written, or, for a read, before anything was returned. */
export class HostingError extends Error {
  constructor(
    message: string,
    readonly code: "INVALID_PATH" | "COLLISION" | "EXISTS" | "NOT_EMPTY" | "UNFAITHFUL" | "NOT_FILE" | "MISSING",
  ) {
    super(message);
    this.name = "HostingError";
  }
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
const rm = (path: string) => promisify(gfs.rm)(path, { recursive: true, force: true });
const stat = (path: string) => promisify(gfs.stat)(path);
const lstat = (path: string) => promisify(gfs.lstat)(path);
const realpath = (path: string) => promisify(gfs.realpath)(path);

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
