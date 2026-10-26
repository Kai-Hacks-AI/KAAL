// The lifecycle: init, upgrade and remove, realizing the package's installation contract (contract.json).
// init prepares Guard and activates nothing; init --hook and init --ci each activate one surface, and
// remove --hook and remove --ci undo them, never touching a declaration (F30). It owns exactly the assets the installation record registers (state.mjs), each only while its SHA-256
// is the registered one, and the core.hooksPath its checkout state records. A file at a managed path that
// the record does not register is not Guard's, even with Guard's bytes: it is reported and left alone.
// It writes only content the contract's catalogue holds, and reads the adapter templates as files, never
// importing them. contract.json is an instance of Core's Installation Contract format, and the one list
// of Guard's assets: each asset's source in the package, its target in the repository, its kind and, for
// the hook and the workflow, its surface. An asset with no surface, the Skill, is part of every init.
import { createHash } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CONFIG, shown, SURFACES } from "./config.mjs";
import { declarations, step, uncovered } from "./github.mjs";
import { deleteRecord, deleteState, git, prune, RECORD, writeRecord, writeState } from "./state.mjs";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** The installation contract this version realizes, and this version. */
export const CONTRACT = JSON.parse(readFileSync(join(PACKAGE, "contract.json"), "utf8"));
export const VERSION = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8")).version;

const asset = (name) => CONTRACT.assets.find((a) => a.name === name);
const HOOK = asset("hook").target;
const WORKFLOW = asset("workflow").target;
const HOOKS_PATH = dirname(HOOK);
/** Each of Guard's .gitattributes, by the one asset of Guard's it keeps byte for byte (F27): installed only beside that asset. */
const COVERS = { [asset("hook-attributes").target]: HOOK, [asset("workflow-attributes").target]: WORKFLOW };

/** The line a pre-existing hook adds to run Guard's own: it runs kaal-guard run --hook with the push's facts. */
const HOOK_LINE = `sh node_modules/@kaihacksai/kaal-guard/${asset("hook").source} "$@" || exit 1`;
const ADD_HOOK_LINE = [
  `  ${HOOK_LINE}`,
  "  It runs kaal-guard run --hook with the push's facts, reading the push's lines on standard input.",
];

export const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const lf = (text) => text.replace(/\r\n/g, "\n");

/** Every file under `dir`, by path relative to it with forward slashes. */
const walk = (dir, prefix = "") =>
  readdirSync(join(dir, prefix), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(dir, `${prefix}${e.name}/`) : [`${prefix}${e.name}`])).sort();

/**
 * Every file this version installs, in the contract's order: its repository path, its content, and its
 * asset's surface (none for an asset every init installs) and executable bit. A directory asset installs
 * each file under its source.
 */
export function files() {
  return CONTRACT.assets.flatMap((a) => {
    const one = (path, file) => ({ path, text: lf(readFileSync(join(PACKAGE, file), "utf8")), surface: a.surface, executable: a.executable === true });
    return a.kind === "directory" ? walk(join(PACKAGE, a.source)).map((f) => one(`${a.target}/${f}`, `${a.source}/${f}`)) : [one(a.target, a.source)];
  });
}

/** Every content this version installs, by repository path. */
export const sources = () => Object.fromEntries(files().map((f) => [f.path, f.text]));

/** The files of the assets of one surface, or of the assets every init installs when `surface` is undefined (F30). */
const of = (surface) => files().filter((f) => f.surface === surface);

/**
 * The repository's own declarations, read with verify's rule (F17): those in a file the record registers
 * are Guard's, not the repository's, and do not count.
 */
const theirs = (declared, assets) => declared.filter((d) => !assets[d.file]);

/**
 * The directory assets that already hold a file of the repository's own, one the record does not
 * register: Guard installs none of their other files beside it, so the directory stays the repository's.
 */
function occupied(root, assets) {
  const own = files().filter((f) => !assets[f.path] && existsSync(join(root, f.path)));
  return CONTRACT.assets.filter((a) => a.kind === "directory" && own.some((f) => f.path.startsWith(`${a.target}/`))).map((a) => a.target);
}
const inside = (targets, path) => targets.some((t) => path.startsWith(`${t}/`));

/** Writes catalogued content where no file is, and returns its registration. Throws when the catalogue lacks it. */
function install(root, path, text) {
  const hash = sha256(Buffer.from(text));
  if (!(CONTRACT.catalogue[path] ?? []).includes(hash)) throw new Error(`kaal-guard ${VERSION} would write ${path} with content its catalogue does not hold; the package is inconsistent`);
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), text);
  if (files().find((f) => f.path === path)?.executable) chmodSync(join(root, path), 0o755);
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
const executed = (declared) => declared.map((d) => (d.every ? `every ci check, in job ${d.job} of ${d.file}` : `${d.name} in job ${d.job} of ${d.file}`));

/**
 * Prepares Guard: creates the configuration directory where it is missing and the installation record,
 * and activates only the surfaces asked for (F30). With `hook`, it writes Guard's hook where no file is and
 * sets core.hooksPath only where it is unset in every scope, the hook there is Guard's registered one, and
 * Git runs no hooks of the repository's own that setting it would turn off. With `ci`, it writes Guard's
 * workflow only where no file is and no workflow of the repository declares a check or verify (F17).
 * Without them it reports how to activate each surface, and each ci check no job runs with the step to
 * add. The context is what the command read and validated: { dir, list, record, state, at, declared,
 * hook, ci }. Returns { lines }: what Guard installed, what it left untouched, and what is still to do.
 */
export function init(root, { dir, list, record, state, at, declared, hook = false, ci = false }) {
  const assets = { ...record.assets };
  const activated = new Set(record.activated);
  const own = theirs(declared, assets);
  const installed = [];
  const untouched = [];
  const todo = [];
  const config = shown(root, dir);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    installed.push(`${config}/, where each check is declared as <name>.md`);
    todo.push(`Declare each check as ${config}/<name>.md, with type: Guard/Check, command and runs in its frontmatter; see the package's README.`);
  }
  if (!record.exists) installed.push(`${RECORD}, Guard's installation record`);
  const wanted = [...of(undefined)];
  if (hook) wanted.push(...of("hook"));
  if (ci) {
    if (own.length) untouched.push(`${WORKFLOW}: not installed; your workflows already run Guard (${executed(own).join("; ")}), and Guard's workflow would run those checks a second time`);
    else wanted.push(...of("ci"));
  }
  const theirsDirs = occupied(root, assets);
  for (const { path, surface, text } of wanted) {
    if (assets[path] && !existsSync(join(root, path))) {
      // A registered asset the repository lost is reinstalled (F8): no file of the consumer's is there.
      assets[path] = install(root, path, text);
      installed.push(`${path}: reinstalled; Guard registered it, and the repository no longer had it`);
      if (surface) activated.add(surface);
    } else if (!assets[path] && !existsSync(join(root, path)) && inside(theirsDirs, path)) {
      untouched.push(`${path}: not installed; ${theirsDirs.find((t) => path.startsWith(`${t}/`))}/ holds files of the repository's own`);
    } else if (!assets[path] && COVERS[path] && !assets[COVERS[path]]) {
      untouched.push(`${path}: not installed; it would keep ${COVERS[path]}, which is not Guard's`);
    } else if (assets[path]) {
      untouched.push(`${path}: Guard installed it before (${assets[path].version}); kaal-guard upgrade updates it`);
      if (surface) activated.add(surface);
    } else if (existsSync(join(root, path))) {
      untouched.push(`${path}: it was there before Guard, so it is not Guard's`);
      if (path === HOOK) todo.push(`To run Guard's hook checks from ${HOOK}, add this line before it ends:`, ...ADD_HOOK_LINE);
    } else {
      assets[path] = install(root, path, text);
      installed.push(path);
      if (surface) activated.add(surface);
    }
  }
  // A registered file of a surface this init does not name is not reinstalled, but its absence is said (F8).
  const named = { hook: [hook, "the hook"], ci: [ci, "CI"] };
  for (const { path, surface } of [...of("hook"), ...of("ci")]) {
    if (named[surface][0] || !assets[path] || existsSync(join(root, path))) continue;
    todo.push(`${path}: Guard registered it, and the repository no longer has it. Run kaal-guard init --${surface} to reinstall it, or kaal-guard remove --${surface} to deactivate ${named[surface][1]}.`);
  }
  if (hook) hooksPath(root, { assets, state, at, installed, untouched, todo });
  // Where core.fileMode is false, Git records the hook from the index alone, so it would be committed without its executable bit (F27).
  if (hook && assets[HOOK] && git(root, "config", "--bool", "--get", "core.fileMode").out === "false") {
    todo.push(`core.fileMode is false here, so Git will not record ${HOOK} as executable on its own. Before you commit it, run: git add --chmod=+x ${HOOK}`);
  }
  else if (!activated.has("hook")) todo.push(`The hook is not activated. Run kaal-guard init --hook to install Guard's ${HOOK}, or add this line to a pre-push hook of your own:`, ...ADD_HOOK_LINE);
  const mine = declarations(root);
  const missing = uncovered(list, mine);
  if (missing.length) {
    todo.push(`No workflow job runs these ci checks, and Guard does not run them in CI on its own. Give a job of your own workflow a step for each:`, ...missing.map((name) => `  ${step(name, config)}`));
    if (!activated.has("ci") && !own.length) todo.push("  or run kaal-guard init --ci to install Guard's workflow, which runs every ci check in one job and kaal-guard verify.");
  }
  if (!mine.some((d) => d.verify) && Object.values(list.checks).some((c) => c.runs.includes("ci"))) {
    todo.push(`No workflow job runs kaal-guard verify, which shows that a job declares each ci check. Give a job the step:`, `  - run: npx --no kaal-guard verify --config ${config} --github`);
  }
  if (activated.size) todo.push("If a merge should depend on Guard's jobs, make them required checks in branch protection.");
  writeRecord(root, { activated: [...activated], assets });
  return {
    lines: [
      ...section("installed by Guard:", installed),
      ...section("left untouched:", untouched),
      ...(own.length ? section("executed by Guard, not managed:", executed(own)) : []),
      ...section("the kaal-guard Skill:", [
        `${asset("skill").target}/: an agent reaches it through the reminder kaal-guard prints after a fail or cannot judge, so no instruction file needs to point at it`,
      ]),
      ...section("still to do in this repository:", todo),
      ...NOT_PROOF,
    ],
  };
}

/** Sets core.hooksPath to Guard's hook directory where that is safe, and records it in the checkout state; reports otherwise. */
function hooksPath(root, { assets, state, at, installed, untouched, todo }) {
  const set = hooksPaths(root);
  const ours = assets[HOOK] && condition(root, HOOK, assets[HOOK]) === "unmodified";
  const hooks = ownHooks(root);
  if (set.length) {
    const [scope, value] = set[set.length - 1];
    const guards = state && state.scope === scope && state["core.hooksPath"] === value;
    untouched.push(`core.hooksPath = ${value} in the ${scope} configuration${guards ? ": Guard set it" : ": Guard did not set it, and leaves it"}`);
    if (value !== HOOKS_PATH || !ours) todo.push(`To run Guard's hook checks, add this line to ${value}/pre-push:`, ...ADD_HOOK_LINE);
  } else if (!ours) {
    untouched.push(`core.hooksPath: unset; Guard sets it only to run a ${HOOK} it installed`);
    todo.push(`Once ${HOOK} runs Guard's line, enable it with: git config core.hooksPath ${HOOKS_PATH}`);
  } else if (hooks.length) {
    untouched.push(`core.hooksPath: unset, so Git runs ${hooks.join(", ")} from ${hooksDir(root)}; setting it would turn them off`);
    todo.push(`To run Guard's hook checks, add this line to ${hooksDir(root)}/pre-push, or move those hooks to ${HOOKS_PATH} and run git config core.hooksPath ${HOOKS_PATH}:`, ...ADD_HOOK_LINE);
  } else {
    if (git(root, "config", `--${at.scope}`, "core.hooksPath", HOOKS_PATH).status !== 0) throw new Error(`git config --${at.scope} core.hooksPath could not be set`);
    writeState(at, HOOKS_PATH);
    installed.push(`core.hooksPath = ${HOOKS_PATH} in the ${at.scope} configuration`);
  }
}

/**
 * Moves each registered, unmodified asset to this version's content and registers this version for it;
 * installs an asset this version adds only to a surface the record shows activated (F13), and never
 * activates one (F30); reports and keeps everything else. Returns { lines }, one per managed path.
 */
export function upgrade(root, { record, declared }) {
  const assets = { ...record.assets };
  const own = theirs(declared, assets);
  const lines = [];
  let changed = false;
  const theirsDirs = occupied(root, assets);
  for (const { path, surface, text } of files()) {
    const entry = assets[path];
    if (!entry) {
      if (existsSync(join(root, path))) lines.push(`left alone ${path}: not Guard's; the installation record does not register it`);
      else if (inside(theirsDirs, path)) lines.push(`left alone ${path}: not installed; ${theirsDirs.find((t) => path.startsWith(`${t}/`))}/ holds files of the repository's own`);
      else if (COVERS[path] && !assets[COVERS[path]]) continue;
      else if (!surface || record.activated.includes(surface)) {
        assets[path] = install(root, path, text);
        changed = true;
        lines.push(surface ? `installed ${path}: ${VERSION}; the activated ${surface} surface did not have it` : `installed ${path}: ${VERSION}; every init installs it`);
      }
      continue;
    }
    const now = condition(root, path, entry);
    if (now === "missing" && (!surface || record.activated.includes(surface))) {
      // A registered asset of an activated surface that the repository lost is reinstalled (F13).
      assets[path] = install(root, path, text);
      changed = true;
      lines.push(`reinstalled ${path}: ${VERSION}; Guard registered it, and the repository no longer had it`);
    } else if (now === "missing") lines.push(`missing ${path}: registered by Guard ${entry.version}, but deleted, and the ${surface} surface is not activated (kaal-guard remove --${surface} drops it from the record)`);
    else if (now === "modified") lines.push(`kept ${path}: modified since Guard ${entry.version} wrote it, so it keeps that registered version`);
    else if (sha256(Buffer.from(text)) === entry.sha256) {
      lines.push(entry.version === VERSION ? `current ${path}: ${VERSION}` : `current ${path}: unchanged from ${entry.version} to ${VERSION}`);
      if (entry.version !== VERSION) changed = true;
      assets[path] = { sha256: entry.sha256, version: VERSION };
    } else {
      assets[path] = install(root, path, text);
      changed = true;
      lines.push(`upgraded ${path}: from ${entry.version} to ${VERSION}`);
    }
  }
  if (record.exists || changed) writeRecord(root, { activated: record.activated, assets });
  if (own.length) lines.push(...section("executed by Guard, not managed:", executed(own)));
  return { lines };
}

/**
 * Deactivates the surfaces asked for, or both: deletes each of their registered, unmodified assets and
 * the directories that empties, and drops them from the record; for the hook, unsets core.hooksPath only
 * in the scope the checkout state records and only while it still holds the value Guard set. Without a
 * surface named, it then deletes the record, the state and the default configuration directory where it
 * is empty. Declarations and Test Cases stay: they are the repository's own (F30). Returns { lines }.
 */
export function remove(root, { dir, record, state, at, hook = false, ci = false }) {
  const all = !hook && !ci;
  const surfaces = SURFACES.filter((s) => all || (s === "hook" ? hook : ci));
  const assets = { ...record.assets };
  const lines = [];
  for (const { path } of files().filter((f) => (f.surface ? surfaces.includes(f.surface) : all))) {
    const entry = assets[path];
    if (!entry) {
      if (existsSync(join(root, path))) lines.push(`left alone ${path}: not Guard's; the installation record does not register it`);
      continue;
    }
    delete assets[path];
    const now = condition(root, path, entry);
    if (now === "missing") lines.push(`missing ${path}: registered by Guard ${entry.version}, but already deleted`);
    else if (now === "modified") lines.push(`kept ${path}: modified since Guard ${entry.version} wrote it, so it is yours`);
    else {
      rmSync(join(root, path));
      prune(root, join(root, path));
      lines.push(`removed ${path}`);
    }
  }
  if (surfaces.includes("hook")) {
    if (state) {
      const value = state["core.hooksPath"];
      if (git(root, "config", `--${state.scope}`, "--get", "core.hooksPath").out === value) {
        git(root, "config", `--${state.scope}`, "--unset", "core.hooksPath");
        lines.push(`unset core.hooksPath in the ${state.scope} configuration`);
      } else lines.push(`left core.hooksPath: changed since Guard set it to ${value}`);
      deleteState(at);
    } else if (hooksPaths(root).length) lines.push("left core.hooksPath: Guard did not set it in this checkout");
  }
  for (const s of surfaces) if (record.activated.includes(s)) lines.push(`deactivated ${s}`);
  if (all) {
    deleteRecord(root);
    // Only the default configuration directory is Guard's to delete, and only while empty: one named with --config never is (F8).
    if (resolve(dir) === resolve(root, CONFIG) && existsSync(dir) && readdirSync(dir).length === 0) {
      rmSync(dir, { recursive: true });
      prune(root, dir);
    }
  } else if (record.exists) writeRecord(root, { activated: record.activated.filter((s) => !surfaces.includes(s)), assets });
  lines.push("declarations and Test Cases: kept; they are the repository's own");
  return { lines };
}
