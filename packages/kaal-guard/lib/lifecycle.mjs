// The lifecycle: init, upgrade and remove, realizing the package's installation contract (contract.json).
// It owns exactly the assets the installation record registers (state.mjs), each only while its SHA-256
// is the registered one, and the core.hooksPath its checkout state records. A file at a managed path that
// the record does not register is not Guard's, even with Guard's bytes: it is reported and left alone.
// It writes only content the contract's catalogue holds, and reads the adapter templates as files, never
// importing them.
import { createHash } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { shown } from "./config.mjs";
import { deleteState, git, prune, writeRecord, writeState } from "./state.mjs";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** The installation contract this version realizes, and this version. */
export const CONTRACT = JSON.parse(readFileSync(join(PACKAGE, "contract.json"), "utf8"));
export const VERSION = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8")).version;

const asset = (role) => CONTRACT.assets.find((a) => a.role === role);
const HOOK = asset("hook").path;
const WORKFLOW = asset("workflow").path;
const HOOKS_PATH = dirname(HOOK);

/** The line a pre-existing hook adds to run Guard's own: it runs kaal-guard run --local with the push's facts. */
const HOOK_LINE = `sh node_modules/@kaihacksai/kaal-guard/${CONTRACT.assets.find((a) => a.role === "hook").sources.hook} "$@" || exit 1`;
const ADD_HOOK_LINE = [
  `  ${HOOK_LINE}`,
  "  It runs kaal-guard run --local with the push's facts, reading the push's lines on standard input.",
];

export const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const lf = (text) => text.replace(/\r\n/g, "\n");

/** Every content this version installs, by asset path and source name. */
export function sources() {
  return Object.fromEntries(CONTRACT.assets.map((a) => [a.path, Object.fromEntries(Object.entries(a.sources).map(([name, file]) => [name, lf(readFileSync(join(PACKAGE, file), "utf8"))]))]));
}

/**
 * The repository's own declarations, read with verify's rule (F17): those in a file the record registers
 * are Guard's, not the repository's, and do not count.
 */
const theirs = (declared, assets) => declared.filter((d) => !assets[d.file]);

/**
 * What each asset holds for this repository: the hook always; the workflow with Guard's verify job unless
 * another workflow declares verify, without it while a ci check is left that no job of the repository
 * runs, and not at all when nothing is left (F17).
 */
function wanted(list, declared) {
  const all = sources();
  const names = new Set(declared.filter((d) => !d.verify && !d.rest).map((d) => d.name));
  const rest = declared.some((d) => d.rest);
  const left = !rest && Object.keys(list.checks).some((n) => list.checks[n].runs.includes("ci") && !names.has(n));
  const verify = declared.some((d) => d.verify);
  const files = { [HOOK]: all[HOOK].hook };
  if (!verify) files[WORKFLOW] = all[WORKFLOW]["with verify"];
  else if (left) files[WORKFLOW] = all[WORKFLOW]["without verify"];
  return files;
}

/** Writes catalogued content where no file is, and returns its registration. Throws when the catalogue lacks it. */
function install(root, path, text) {
  const hash = sha256(Buffer.from(text));
  if (!(CONTRACT.catalogue[path] ?? []).includes(hash)) throw new Error(`kaal-guard ${VERSION} would write ${path} with content its catalogue does not hold; the package is inconsistent`);
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), text);
  const mode = CONTRACT.assets.find((a) => a.path === path)?.mode;
  if (mode) chmodSync(join(root, path), parseInt(mode, 8));
  return { sha256: hash, version: VERSION };
}

/** The registered asset as it is now: "unmodified", "modified" or "missing". */
function condition(root, path, entry) {
  if (!existsSync(join(root, path))) return "missing";
  return sha256(readFileSync(join(root, path))) === entry.sha256 ? "unmodified" : "modified";
}

/** core.hooksPath in every Git configuration scope, as [scope, value] pairs. */
function hooksPaths(root) {
  const r = git(root, "config", "--show-scope", "--get-all", "core.hooksPath");
  return r.status === 0 ? r.out.split(/\r?\n/).filter(Boolean).map((l) => l.split(/\t/)) : [];
}

/** Git's default hooks directory, where hooks run while core.hooksPath is unset, as Git names it from the root. */
const hooksDir = (root) => (git(root, "rev-parse", "--git-path", "hooks").out || ".git/hooks").split("\\").join("/");

/** The hooks a repository already runs from Git's default directory: any file there but Git's samples. */
function ownHooks(root) {
  const dir = resolve(root, hooksDir(root));
  return existsSync(dir) ? readdirSync(dir).filter((n) => !n.endsWith(".sample")).sort() : [];
}

/** Said after every init: installing files shows nothing runs, nor that anything is required. */
const NOT_PROOF = [
  "init writes files and configuration only. It does not show that Git runs the hook, that CI runs these jobs, or that a merge requires them.",
  "kaal-guard verify shows declared integration only; that CI ran a check is its job's evidence, and that a merge requires it is the repository's branch protection.",
];

const section = (title, items) => [title, ...(items.length ? items : ["nothing"]).map((i) => `  ${i}`)];

/** The report of the repository's declarations that Guard executes and does not manage. */
const executed = (declared) => declared.map((d) => (d.rest ? `every ci check no job names, in job ${d.job} of ${d.file}` : `${d.name} in job ${d.job} of ${d.file}`));

/**
 * Creates the configuration directory where it is missing, writes each wanted asset where no file
 * exists, and sets core.hooksPath only where it is unset in every scope, the hook there is Guard's
 * registered one, and Git runs no hooks of the repository's own that setting it would turn off. The
 * context is what the command read and validated: { dir, list, record, state, at, declared }.
 * Returns { lines }: what Guard installed, what it left untouched, and what is still to do.
 */
export function init(root, { dir, list, record, state, at, declared }) {
  const assets = { ...record };
  const own = theirs(declared, assets);
  const installed = [];
  const untouched = [];
  const todo = [];
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    installed.push(`${shown(root, dir)}/, where each check is declared as <name>.md`);
    todo.push(`Declare each check as ${shown(root, dir)}/<name>.md, with type: Guard/Check, command and runs in its frontmatter; see the package's README.`);
  }
  const files = wanted(list, own);
  if (!files[WORKFLOW] && !assets[WORKFLOW]) untouched.push(`${WORKFLOW}: not installed; the repository's own workflows declare every ci check and verify`);
  for (const [path, text] of Object.entries(files)) {
    if (assets[path]) untouched.push(`${path}: Guard installed it before (${assets[path].version}); kaal-guard upgrade updates it`);
    else if (existsSync(join(root, path))) {
      untouched.push(`${path}: it was there before Guard, so it is not Guard's`);
      if (path === HOOK) todo.push(`To run Guard's local checks from ${HOOK}, add this line before it ends:`, ...ADD_HOOK_LINE);
      else todo.push(`For each ci check, give a job in ${path} or another workflow the step "- run: npx --no kaal-guard run --check <name> --github", then run kaal-guard verify.`);
    } else {
      assets[path] = install(root, path, text);
      installed.push(path);
    }
  }
  const set = hooksPaths(root);
  const ours = assets[HOOK] && condition(root, HOOK, assets[HOOK]) === "unmodified";
  const hooks = ownHooks(root);
  if (set.length) {
    const [scope, value] = set[set.length - 1];
    const guards = state && state.scope === scope && state["core.hooksPath"] === value;
    untouched.push(`core.hooksPath = ${value} in the ${scope} configuration${guards ? ": Guard set it" : ": Guard did not set it, and leaves it"}`);
    if (value !== HOOKS_PATH || !ours) todo.push(`To run Guard's local checks, add this line to ${value}/pre-push:`, ...ADD_HOOK_LINE);
  } else if (!ours) {
    untouched.push(`core.hooksPath: unset; Guard sets it only to run a ${HOOK} it installed`);
    todo.push(`Once ${HOOK} runs Guard's line, enable it with: git config core.hooksPath ${HOOKS_PATH}`);
  } else if (hooks.length) {
    untouched.push(`core.hooksPath: unset, so Git runs ${hooks.join(", ")} from ${hooksDir(root)}; setting it would turn them off`);
    todo.push(`To run Guard's local checks, add this line to ${hooksDir(root)}/pre-push, or move those hooks to ${HOOKS_PATH} and run git config core.hooksPath ${HOOKS_PATH}:`, ...ADD_HOOK_LINE);
  } else {
    if (git(root, "config", `--${at.scope}`, "core.hooksPath", HOOKS_PATH).status !== 0) throw new Error(`git config --${at.scope} core.hooksPath could not be set`);
    writeState(at, HOOKS_PATH);
    installed.push(`core.hooksPath = ${HOOKS_PATH} in the ${at.scope} configuration`);
  }
  todo.push("If a merge should depend on Guard's jobs, make them required checks in branch protection.");
  writeRecord(root, assets);
  return {
    lines: [
      ...section("installed by Guard:", installed),
      ...section("left untouched:", untouched),
      ...(own.length ? section("executed by Guard, not managed:", executed(own)) : []),
      ...section("still to do in this repository:", todo),
      ...NOT_PROOF,
    ],
  };
}

/**
 * Moves each registered, unmodified asset to this version's content and registers this version for it;
 * installs a wanted asset the repository does not have (F13); reports and keeps everything else.
 * Returns { lines }, one per managed path.
 */
export function upgrade(root, { list, record, declared }) {
  const assets = { ...record };
  const own = theirs(declared, assets);
  const files = wanted(list, own);
  const lines = [];
  for (const { path } of CONTRACT.assets) {
    const entry = assets[path];
    const text = files[path];
    if (!entry) {
      if (existsSync(join(root, path))) lines.push(`left alone ${path}: not Guard's; the installation record does not register it`);
      else if (text !== undefined) {
        assets[path] = install(root, path, text);
        lines.push(`installed ${path}: ${VERSION}; the repository did not have it`);
      }
      continue;
    }
    const now = condition(root, path, entry);
    if (now === "missing") lines.push(`missing ${path}: registered by Guard ${entry.version}, but deleted; Guard does not reinstall it (kaal-guard remove drops it from the record)`);
    else if (now === "modified") lines.push(`kept ${path}: modified since Guard ${entry.version} wrote it, so it keeps that registered version`);
    else if (text === undefined) lines.push(`kept ${path}: ${entry.version}; the repository's own workflows now declare everything it runs, so delete it if it is no longer wanted`);
    else if (sha256(Buffer.from(text)) === entry.sha256) {
      lines.push(entry.version === VERSION ? `current ${path}: ${VERSION}` : `current ${path}: unchanged from ${entry.version} to ${VERSION}`);
      assets[path] = { sha256: entry.sha256, version: VERSION };
    } else {
      assets[path] = install(root, path, text);
      lines.push(`upgraded ${path}: from ${entry.version} to ${VERSION}`);
    }
  }
  writeRecord(root, assets);
  if (own.length) lines.push(...section("executed by Guard, not managed:", executed(own)));
  return { lines };
}

/**
 * Deletes each registered, unmodified asset and the directories that empties, unsets core.hooksPath only
 * in the scope the checkout state records and only while it still holds the value Guard set, then deletes
 * the record and the state. Declarations stay: they are the repository's own. Returns { lines }.
 */
export function remove(root, { dir, record, state, at }) {
  const lines = [];
  for (const { path } of CONTRACT.assets) {
    const entry = record[path];
    if (!entry) {
      if (existsSync(join(root, path))) lines.push(`left alone ${path}: not Guard's; the installation record does not register it`);
      continue;
    }
    const now = condition(root, path, entry);
    if (now === "missing") lines.push(`missing ${path}: registered by Guard ${entry.version}, but already deleted`);
    else if (now === "modified") lines.push(`kept ${path}: modified since Guard ${entry.version} wrote it, so it is yours`);
    else {
      rmSync(join(root, path));
      prune(root, join(root, path));
      lines.push(`removed ${path}`);
    }
  }
  writeRecord(root, {});
  if (state) {
    const value = state["core.hooksPath"];
    if (git(root, "config", `--${state.scope}`, "--get", "core.hooksPath").out === value) {
      git(root, "config", `--${state.scope}`, "--unset", "core.hooksPath");
      lines.push(`unset core.hooksPath in the ${state.scope} configuration`);
    } else lines.push(`left core.hooksPath: changed since Guard set it to ${value}`);
    deleteState(at);
  } else if (hooksPaths(root).length) lines.push("left core.hooksPath: Guard did not set it in this checkout");
  if (existsSync(dir) && readdirSync(dir).length === 0) {
    rmSync(dir, { recursive: true });
    prune(root, dir);
  }
  return { lines };
}

