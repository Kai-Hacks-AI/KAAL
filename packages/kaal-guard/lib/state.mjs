// Guard's bookkeeping, in its two scopes (guard/F29). Only the lifecycle writes either, and each reader
// refuses a member it does not define, as it does in a declaration.
//   - The installation record, .kaal/state/guard/installation.json, tracked: the surfaces this repository
//     activated through Guard, and the assets it installed, each with its SHA-256 and the version that
//     wrote it. A file is Guard's only while the record registers it.
//   - The checkout state, untracked, in Git's metadata: whether Guard set core.hooksPath, in which
//     configuration scope and to what. Without extensions.worktreeConfig it is shared by every worktree
//     in the common directory; with it, each worktree has its own.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, rmdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { Refusal, SURFACES, undefinedMember } from "./config.mjs";
import { safePath } from "./trusted.mjs";

/** The installation record, from the repository's top level. */
export const RECORD = ".kaal/state/guard/installation.json";

/** Runs Git from `cwd`: { status, out }. */
export function git(cwd, ...args) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  return { status: r.status, out: (r.stdout ?? "").trim() };
}

/** The canonical path of a directory, or undefined when it cannot be read. */
const canonical = (path) => {
  try {
    return realpathSync.native(path);
  } catch {
    return undefined;
  }
};

/**
 * The repository's top-level directory, or undefined outside a Git working tree. It is spelled as `start`
 * spells it where they are the same directory (Windows short names, symlinked temporary directories), so a
 * check sees the working directory its caller gave, and Git's own spelling otherwise.
 */
export function gitRoot(start) {
  const r = git(start, "rev-parse", "--show-toplevel");
  if (r.status !== 0 || !r.out) return undefined;
  const top = resolve(r.out);
  const target = canonical(top);
  for (let dir = resolve(start); target; dir = dirname(dir)) {
    if (canonical(dir) === target) return dir;
    if (dirname(dir) === dir) break;
  }
  return top;
}

/** Reads one of Guard's JSON files: the parsed object, or undefined when there is none. Throws a Refusal. */
function readJson(path, shown) {
  if (!existsSync(path)) return undefined;
  let data;
  try {
    data = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    throw new Refusal(`${shown}: cannot be read as JSON: ${e.message}`, `restore ${shown} from Git, or delete it and run kaal-guard init`);
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Refusal(`${shown}: is not a JSON object`, `restore ${shown} from Git`);
  return data;
}

/** Removes the directories above a removed file that it left empty, up to `stop`. */
export function prune(stop, path) {
  for (let d = dirname(path); d !== stop && d.startsWith(stop) && existsSync(d); d = dirname(d)) {
    if (readdirSync(d).length) return;
    rmdirSync(d);
  }
}

const HASH = /^[0-9a-f]{64}$/;

/**
 * The record: { activated, assets, exists }. `activated` lists the surfaces the consumer activated through
 * Guard (F30), `assets` registers each installed asset by path as { sha256, version }. Without a record,
 * nothing is activated or registered. Throws a Refusal.
 */
export function readRecord(root) {
  const data = readJson(join(root, RECORD), RECORD);
  if (!data) return { activated: [], assets: {}, exists: false };
  for (const member of Object.keys(data)) if (member !== "activated" && member !== "assets") throw undefinedMember(RECORD, member, ["activated", "assets"], "Guard's installation record");
  const { activated = [], assets = {} } = data;
  if (!Array.isArray(activated) || !activated.every((s) => SURFACES.includes(s)) || new Set(activated).size !== activated.length) {
    throw new Refusal(`${RECORD}: activated: is not a list of ${SURFACES.join(", ")}`, `restore ${RECORD} from Git`);
  }
  if (!assets || typeof assets !== "object" || Array.isArray(assets)) throw new Refusal(`${RECORD}: assets: is not a map of paths`, `restore ${RECORD} from Git`);
  for (const [path, entry] of Object.entries(assets)) {
    const at = `${RECORD}: assets: ${path}`;
    if (!safePath(path)) throw new Refusal(`${at}: is not a path inside the repository`, `restore ${RECORD} from Git`);
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new Refusal(`${at}: is not a map`, `restore ${RECORD} from Git`);
    for (const member of Object.keys(entry)) if (member !== "sha256" && member !== "version") throw undefinedMember(at, member, ["sha256", "version"], "an asset of the installation record");
    if (!HASH.test(entry.sha256 ?? "")) throw new Refusal(`${at}: sha256: is not a SHA-256`, `restore ${RECORD} from Git`);
    if (typeof entry.version !== "string" || !entry.version) throw new Refusal(`${at}: version: is not a version`, `restore ${RECORD} from Git`);
  }
  return { activated: [...activated], assets: { ...assets }, exists: true };
}

/** Writes the record: the activated surfaces in their order, and the assets in path order. */
export function writeRecord(root, { activated, assets }) {
  const path = join(root, RECORD);
  const sorted = Object.fromEntries(Object.keys(assets).sort().map((p) => [p, { sha256: assets[p].sha256, version: assets[p].version }]));
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify({ activated: SURFACES.filter((s) => activated.includes(s)), assets: sorted }, null, 2) + "\n");
}

/** Deletes the record and the directories its removal empties. */
export function deleteRecord(root) {
  const path = join(root, RECORD);
  if (!existsSync(path)) return;
  rmSync(path);
  prune(root, path);
}

/**
 * Where Guard keeps core.hooksPath in this checkout: the configuration scope it writes and the state file
 * that records it, both resolved through Git. { scope: "local" | "worktree", path, metadata }.
 */
export function checkout(root) {
  const worktree = git(root, "config", "--bool", "--get", "extensions.worktreeConfig").out === "true";
  if (worktree) {
    const path = resolve(root, git(root, "rev-parse", "--git-path", "kaal/guard/state.json").out);
    return { scope: "worktree", path, metadata: dirname(dirname(dirname(path))) };
  }
  const common = resolve(root, git(root, "rev-parse", "--git-common-dir").out);
  return { scope: "local", path: join(common, "kaal", "guard", "state.json"), metadata: common };
}

/** The checkout state: { "core.hooksPath", scope }, or undefined when Guard set nothing here. Throws a Refusal. */
export function readState(at) {
  const data = readJson(at.path, at.path.split("\\").join("/"));
  if (!data) return undefined;
  const shown = at.path.split("\\").join("/");
  for (const member of Object.keys(data)) if (member !== "core.hooksPath" && member !== "scope") throw undefinedMember(shown, member, ["core.hooksPath", "scope"], "Guard's checkout state");
  if (typeof data["core.hooksPath"] !== "string" || !["local", "worktree"].includes(data.scope)) {
    throw new Refusal(`${shown}: does not name the core.hooksPath Guard set and its scope`, `delete ${shown}; Guard then leaves core.hooksPath alone`);
  }
  return data;
}

/** Records that Guard set core.hooksPath to `value` in the checkout's scope. */
export function writeState(at, value) {
  mkdirSync(dirname(at.path), { recursive: true });
  writeFileSync(at.path, JSON.stringify({ "core.hooksPath": value, scope: at.scope }, null, 2) + "\n");
}

/** Deletes the checkout state and the directories it empties in Git's metadata. */
export function deleteState(at) {
  if (!existsSync(at.path)) return;
  rmSync(at.path);
  prune(at.metadata, at.path);
}
