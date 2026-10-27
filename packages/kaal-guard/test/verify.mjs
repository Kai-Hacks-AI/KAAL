// The consumer's verification of the installed package (guard/A18, guard/F31–guard/F36): what
// `npm explore @kaihacksai/kaal-guard -- npm test` runs. It checks the prerequisites, the installed
// files against the shipped manifest (test/verify.json) and the consumer, runs the delivered outer
// acceptance cases (test/acceptance/) against the installed copy, and ends in exactly one result:
// verified (exit 0), failed (1) or cannot verify (2). It realizes Testing's consumer-verification
// semantics (testing/C9) in Guard's own code, imports nothing from lib/, so a broken runtime cannot
// mask itself, and uses only Node's built-ins (guard/N13).
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, lstatSync, readdirSync, readFileSync, readlinkSync, realpathSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { run } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

/** The installed copy: the package directory this entry ships in, as the file system resolves it. */
export const PACKAGE = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), ".."));

/** The shipped manifest, relative to the package: the delivered cases' inventory and every other shipped file's SHA-256. */
export const MANIFEST = "test/verify.json";

/** The exit status of each result (guard/F33). */
export const EXIT = { verified: 0, failed: 1, "cannot verify": 2 };

/** Files larger than this are compared by size and modification time instead of by content. */
const LARGE = 64 * 1024 * 1024;

const WINDOWS = process.platform === "win32";

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

const slash = (p) => p.split(sep).join("/");

/** Every file under a directory, relative to it, with forward slashes, sorted. */
export function files(base) {
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else out.push(slash(relative(base, p)));
    }
  };
  walk(base);
  return out.sort();
}

/**
 * The SHA-256 of every file in the installed copy except the manifest itself, by path. The copy's own
 * node_modules is the package manager's (pnpm links `.bin` there), not shipped content.
 */
export function hashes(base = PACKAGE) {
  return Object.fromEntries(files(base).filter((f) => f !== MANIFEST && !f.startsWith("node_modules/")).map((f) => [f, sha256(readFileSync(join(base, f)))]));
}

/** One digest over a set of file hashes, so one value names the installed bytes. */
export const digest = (map) => sha256(Object.keys(map).sort().map((f) => `${f}\0${map[f]}\n`).join(""));

/** A case's name: its file in the package, then each enclosing suite, then the test, joined by " > ". */
export const key = (file, path) => [slash(relative(PACKAGE, file)), ...path].join(" > ");

/**
 * Runs the delivered cases and accounts for each leaf test by its name. `onCase` sees each outcome as
 * it arrives. A file that fails outside any test counts as a failure under the file's own name.
 */
export async function execute(caseFiles, onCase = () => {}) {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const stacks = new Map();
  const outcomes = [];
  for await (const e of run({ files: caseFiles, concurrency: true, env })) {
    const d = e.data ?? {};
    if (e.type === "test:start") {
      const stack = stacks.get(d.file) ?? [];
      stack.length = d.nesting;
      stack.push(d.name);
      stacks.set(d.file, stack);
      continue;
    }
    if (e.type !== "test:pass" && e.type !== "test:fail") continue;
    const whole = d.nesting === 0 && d.file && resolve(d.name) === resolve(d.file);
    if (whole && e.type === "test:pass") continue;
    if (!whole && d.details?.type !== "test") continue;
    const name = whole ? key(d.file, []) : key(d.file, [...(stacks.get(d.file) ?? []).slice(0, d.nesting), d.name]);
    const status = d.skip !== undefined && d.skip !== false ? "skipped" : d.todo !== undefined && d.todo !== false ? "todo" : e.type === "test:pass" ? "passed" : "failed";
    const error = d.details?.error;
    const outcome = { name, status, message: status === "failed" ? String(error?.cause?.message ?? error?.message ?? "failed").split(/\r?\n/)[0] : undefined };
    outcomes.push(outcome);
    onCase(outcome);
  }
  return outcomes;
}

/** The consumer: the directory that holds the outermost node_modules the installed copy is in, when it is an npm project. */
export function consumerOf(location) {
  const parts = location.split(sep);
  const at = parts.indexOf("node_modules");
  if (at < 1) return { error: `this copy of the package is not installed under a node_modules directory (${location}): it is linked or a source checkout`, next: "install the package into the consumer from the registry or a packed tarball, then run the command again from the consumer" };
  const root = parts.slice(0, at).join(sep) || sep;
  if (!existsSync(join(root, "package.json"))) return { error: `the directory holding node_modules (${root}) has no package.json, so it is not an npm consumer project`, next: "install the package as a dependency of an npm project and run the command from that project" };
  return { root };
}

/**
 * The consumer's content: every path under it, node_modules directories excepted, with its content's
 * SHA-256 (a link's target; a directory's presence). Git's object store and very large files are taken
 * by size and modification time.
 */
export function snapshot(root) {
  const out = {};
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      const rel = slash(relative(root, p));
      if (e.isSymbolicLink()) out[rel] = `link:${readlinkSync(p)}`;
      else if (e.isDirectory()) {
        if (e.name === "node_modules") continue;
        out[rel] = "dir";
        walk(p);
      } else {
        const s = lstatSync(p);
        out[rel] = rel.startsWith(".git/objects/") || s.size > LARGE ? `stat:${s.size}:${s.mtimeMs}` : sha256(readFileSync(p));
      }
    }
  };
  walk(root);
  return out;
}

/** The paths whose entry differs between two snapshots. */
export function changed(before, after) {
  return [...new Set([...Object.keys(before), ...Object.keys(after)])].filter((p) => before[p] !== after[p]).sort();
}

/** The lockfile's integrity for the installed copy, where npm recorded it in node_modules/.package-lock.json; else unknown. */
function lockfile(consumer) {
  const path = join(consumer, "node_modules", ".package-lock.json");
  if (!existsSync(path)) return { integrity: null, resolved: null, source: null, unknown: "no node_modules/.package-lock.json: npm did not record this installation's integrity" };
  try {
    const entry = JSON.parse(readFileSync(path, "utf8")).packages?.[slash(relative(consumer, PACKAGE))];
    if (!entry?.integrity) return { integrity: null, resolved: entry?.resolved ?? null, source: "node_modules/.package-lock.json", unknown: "node_modules/.package-lock.json records no integrity for this copy" };
    return { integrity: entry.integrity, resolved: entry.resolved ?? null, source: "node_modules/.package-lock.json" };
  } catch (e) {
    return { integrity: null, resolved: null, source: null, unknown: `node_modules/.package-lock.json cannot be read: ${e.message}` };
  }
}

/** The prerequisites the delivered cases need (guard/F32): Node 24 or later, Git and npm on PATH. */
function prerequisites() {
  const missing = [];
  const major = Number(process.versions.node.split(".")[0]);
  if (major < 24) missing.push({ cause: `Node ${process.versions.node} is older than the required 24`, next: "run the command with Node 24 or later" });
  const has = (file) => spawnSync(file, ["--version"], { encoding: "utf8", shell: WINDOWS && file === "npm" }).status === 0;
  if (!has("git")) missing.push({ cause: "git is not on PATH", next: "install Git or put it on PATH, then run the command again" });
  if (!has("npm")) missing.push({ cause: "npm is not on PATH", next: "put npm on PATH, then run the command again" });
  return missing;
}

/** Runs the verification and prints its output; returns the exit status. */
export async function main(log = (line) => console.log(line)) {
  const manifest = JSON.parse(readFileSync(join(PACKAGE, MANIFEST), "utf8"));
  const pkg = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
  const declared = [...manifest.cases];
  const failures = [];
  const causes = [];
  const add = (into, cause, next) => into.push({ cause, next });

  log(`kaal-guard verification: ${pkg.name}@${pkg.version}, the installed package only, not this repository's integration`);
  log(`location: ${PACKAGE}`);

  const installed = hashes();
  const expected = manifest.files;
  const mismatched = Object.keys(expected).filter((f) => f in installed && installed[f] !== expected[f]).sort();
  const absent = Object.keys(expected).filter((f) => !(f in installed)).sort();
  const extra = Object.keys(installed).filter((f) => !(f in expected)).sort();
  const filesDigest = digest(installed);
  if (mismatched.length + absent.length + extra.length === 0) log(`installed files: ${Object.keys(installed).length} match the shipped manifest, digest ${filesDigest} (consistency evidence: the manifest ships in the package, so this is not independent provenance)`);
  else {
    for (const f of mismatched) add(causes, `an installed file differs from the shipped manifest: ${f}`, "reinstall the package (npm ci, or npm install) and run the command again");
    for (const f of absent) add(causes, `a shipped file is missing from the installed copy: ${f}`, "reinstall the package and run the command again");
    for (const f of extra) add(causes, `the installed copy holds a file the manifest does not ship: ${f}`, "reinstall the package and run the command again");
    log(`installed files: digest ${filesDigest}; ${mismatched.length} differ, ${absent.length} missing, ${extra.length} not shipped`);
  }

  const consumer = consumerOf(PACKAGE);
  const lock = consumer.root ? lockfile(consumer.root) : { integrity: null, resolved: null, source: null, unknown: "no consumer" };
  log(`consumer: ${consumer.root ?? "not identified"}`);
  log(`lockfile integrity: ${lock.integrity ?? `unknown (${lock.unknown})`}`);

  const blockers = prerequisites();
  if (consumer.error) blockers.push({ cause: consumer.error, next: consumer.next });

  let outcomes = [];
  let unchanged = null;
  let changes = [];
  if (blockers.length === 0) {
    const before = snapshot(consumer.root);
    const packageBefore = snapshot(PACKAGE);
    const caseFiles = [...new Set(declared.map((c) => c.split(" > ")[0]))].map((f) => join(PACKAGE, f));
    const onDisk = existsSync(join(PACKAGE, "test", "acceptance")) ? files(join(PACKAGE, "test", "acceptance")).filter((f) => f.endsWith(".test.mjs")).map((f) => join(PACKAGE, "test", "acceptance", f)) : [];
    const runFiles = [...new Set([...caseFiles.filter((f) => existsSync(f)), ...onDisk])];
    log(`running ${declared.length} delivered cases from ${runFiles.length} files against the installed copy`);
    outcomes = runFiles.length ? await execute(runFiles, (o) => log(`${o.status === "passed" ? "pass" : o.status === "failed" ? "FAIL" : o.status}: ${o.name}${o.message ? `: ${o.message}` : ""}`)) : [];
    changes = [...changed(before, snapshot(consumer.root)), ...changed(packageBefore, snapshot(PACKAGE)).map((p) => slash(relative(consumer.root, join(PACKAGE, p))))];
    unchanged = changes.length === 0;
  } else causes.unshift(...blockers);

  const by = (status) => outcomes.filter((o) => o.status === status).map((o) => o.name);
  const ran = new Set(outcomes.map((o) => o.name));
  const passed = by("passed");
  const failed = by("failed");
  const skipped = by("skipped");
  const todo = by("todo");
  const executed = passed.length + failed.length;
  const missing = blockers.length ? [] : declared.filter((c) => !ran.has(c));
  const undeclared = outcomes.filter((o) => o.status !== "failed" && !declared.includes(o.name)).map((o) => o.name);

  for (const f of failed) add(failures, `a delivered case failed: ${f}`, "report it with this output to the package's maintainers; the installed package does not behave as it intends");
  if (unchanged === false) add(failures, `the consumer changed during the run: ${changes.join(", ")}`, "restore those paths from version control and report this output to the package's maintainers");
  if (blockers.length === 0) {
    if (executed === 0) add(causes, "no case executed", "reinstall the package; its delivered cases did not run");
    for (const s of skipped) add(causes, `a delivered case was skipped: ${s}`, "a skipped case is not verified; report this output to the package's maintainers");
    for (const t of todo) add(causes, `a delivered case is marked todo: ${t}`, "a todo case is not verified; report this output to the package's maintainers");
    for (const m of missing) add(causes, `a declared case was not executed: ${m}`, "reinstall the package and run the command again");
    for (const u of undeclared) add(causes, `a case executed that the manifest does not declare: ${u}`, "reinstall the package and run the command again");
  }

  const result = failures.length ? "failed" : causes.length ? "cannot verify" : "verified";
  log(`cases: ${declared.length} declared, ${executed} executed, ${passed.length} passed, ${failed.length} failed, ${skipped.length} skipped, ${todo.length} todo`);
  if (unchanged === true) log(`consumer unchanged: ${consumer.root}`);
  else if (unchanged === false) log(`consumer changed: ${changes.join(", ")}`);
  else log("consumer: not compared, because the cases did not run");
  log("integration: this run judges the package only. For this repository's integration of Guard, run `npx kaal-guard verify` in it.");
  log("This result is your own observation of this run; it is not KAAL release evidence.");
  for (const { cause, next } of [...failures, ...causes]) log(`${result === "failed" && causes.some((c) => c.cause === cause) ? "also cannot verify" : result}: ${cause}; do: ${next}`);
  log(result === "verified" ? `verified: every declared case executed and passed against ${pkg.name}@${pkg.version} installed at ${PACKAGE}` : `${result}: ${[...failures, ...causes].length} cause(s) above`);

  const summary = {
    result,
    exit: EXIT[result],
    package: { name: pkg.name, version: pkg.version, location: PACKAGE },
    consumer: { root: consumer.root ?? null, unchanged, changed: changes },
    lockfile: lock,
    files: { digest: filesDigest, mismatched, missing: absent, extra, sha256: installed },
    cases: { declared: declared.length, executed, passed: passed.length, failed: failed.length, skipped: skipped.length, todo: todo.length, failures: failed, skips: skipped, todos: todo, missing, undeclared },
    causes: [...failures, ...causes].map((c) => c.cause),
  };
  log(`kaal-guard-verification ${JSON.stringify(summary)}`);
  return EXIT[result];
}

if (process.argv[1] && pathToFileURL(realpathSync(process.argv[1])).href === import.meta.url) {
  delete process.env.NODE_TEST_CONTEXT;
  main().then(
    (status) => {
      process.exitCode = status;
    },
    (e) => {
      console.log(`cannot verify: the verification itself could not complete: ${e?.message ?? e}; do: reinstall the package and run the command again`);
      console.log(`kaal-guard-verification ${JSON.stringify({ result: "cannot verify", exit: 2, causes: [`the verification itself could not complete: ${e?.message ?? e}`] })}`);
      process.exitCode = 2;
    },
  );
}
