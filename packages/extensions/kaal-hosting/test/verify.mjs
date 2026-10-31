// Hosting's one test entry (hosting/F20, hosting/A9, hosting/A10): what `npm test` runs, in both places
// the package lives.
//
// In an installation, `npm explore @kaihacksai/kaal-hosting -- npm test` verifies the installed copy
// on the consumer's host (hosting/F21–hosting/F25). It checks the prerequisites and the installed files
// against the shipped manifest (test/verify.json), runs every delivered case against the installed copy
// (all in test/embed/: the outer loops intent, requirements and architecture, one file each, and the
// inner Code loop in every other case file there), compares the
// consumer before and after, judges each identifier docs/ defines, and ends in exactly one result:
// verified (exit 0), failed (1) or cannot verify (2).
//
// In the source workspace, `npm test` is comprehensive: it runs every `test:<name>` suite the package
// declares, once each and in name order, and never itself.
//
// Anywhere else it is cannot verify. It uses only Node's built-ins and imports nothing from dist/, so a
// broken runtime cannot mask itself (hosting/N4).
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, lstatSync, readdirSync, readFileSync, readlinkSync, realpathSync } from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { run } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

/** The copy this entry ships in, as the file system resolves it. */
export const PACKAGE = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), ".."));

/** The shipped manifest, relative to the package. */
export const MANIFEST = "test/verify.json";

/** The summary line's prefix (hosting/F21). */
export const PREFIX = "kaal-hosting-verification ";

/** The exit status of each result (hosting/F21). */
export const EXIT = { verified: 0, failed: 1, "cannot verify": 2 };

/** The loops a delivered case belongs to, by where it lives. */
export const LOOPS = ["intent", "requirements", "architecture", "code"];

const WINDOWS = process.platform === "win32";

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

const slash = (p) => p.split(sep).join("/");

/** Every file under `base`, relative to it, with forward slashes, sorted; `skip(name)` leaves out a directory. */
export function files(base, skip = () => false) {
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) {
        if (!skip(e.name)) walk(p);
      } else out.push(slash(relative(base, p)));
    }
  };
  walk(base);
  return out.sort();
}

/** The SHA-256 of every installed file but the manifest and the copy's own node_modules, by path. */
export function hashes(base = PACKAGE) {
  return Object.fromEntries(files(base, (name) => name === "node_modules").filter((f) => f !== MANIFEST).map((f) => [f, sha256(readFileSync(join(base, f)))]));
}

/** The digest of the installed files: the SHA-256 of one `<path>\0<sha256>\n` line per file, in path order (hosting/F22). */
export const digest = (map) => sha256(Object.keys(map).sort().map((f) => `${f}\0${map[f]}\n`).join(""));

/** A case's name: its file in the package, then each enclosing suite, then the test, joined by " > ". */
export const key = (file, path) => [slash(relative(PACKAGE, file)), ...path].join(" > ");

/** The loop of a case file in test/embed/: its name for an outer loop, code for any other case file there. */
export function loopOf(file) {
  const m = /^test\/embed\/([^/]+)\.test\.mjs$/.exec(file);
  if (!m) return undefined;
  return LOOPS.includes(m[1]) ? m[1] : "code";
}

/** "hosting/F21–hosting/F25" names five identifiers; anything else names itself. */
export function cited(text) {
  const out = new Set();
  for (const m of text.matchAll(/\bhosting\/([IFNA])(\d+)(?:–hosting\/\1(\d+))?\b/g)) {
    const [a, b] = [Number(m[2]), Number(m[3] ?? m[2])];
    for (let n = a; n <= b; n++) out.add(`hosting/${m[1]}${n}`);
  }
  return out;
}

/** The identifiers the installed docs/ define, each where it is written in bold. */
export function defined(base = PACKAGE) {
  const dir = join(base, "docs");
  if (!existsSync(dir)) return [];
  const text = readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => readFileSync(join(dir, f), "utf8"))
    .join("\n");
  return [...new Set([...text.matchAll(/\*\*(hosting\/[IFNA]\d+)\b/g)].map((m) => m[1]))].sort();
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

/**
 * Runs the case files and accounts for each leaf test by name. Cases named in `exclude` are not run.
 * `onCase` sees each outcome as it arrives. A file that fails outside any test fails under its own name.
 */
export async function execute(caseFiles, exclude = [], onCase = () => {}) {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const testSkipPatterns = exclude.map((name) => new RegExp(`^${escape(name.split(" > ").slice(1).join(" "))}$`));
  const stacks = new Map();
  const outcomes = [];
  for await (const e of run({ files: caseFiles, concurrency: true, env, ...(testSkipPatterns.length ? { testSkipPatterns } : {}) })) {
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
    const skipped = d.skip !== undefined && d.skip !== false;
    const todo = d.todo !== undefined && d.todo !== false;
    const outcome = skipped ? "skipped" : todo ? "todo" : e.type === "test:pass" ? "pass" : "fail";
    const error = d.details?.error;
    const o = { name, outcome, ...(outcome === "fail" ? { message: String(error?.cause?.message ?? error?.message ?? "failed").split(/\r?\n/)[0] } : {}) };
    outcomes.push(o);
    onCase(o);
  }
  return outcomes;
}

/** What is at each path under `root`, other node_modules directories left out, so a change shows. */
export function snapshot(root, keep = () => false) {
  const out = {};
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      const rel = slash(relative(root, p));
      if (e.isDirectory() && e.name === "node_modules" && !keep(p)) continue;
      const s = lstatSync(p);
      if (s.isSymbolicLink()) out[rel] = `link:${readlinkSync(p)}`;
      else if (s.isDirectory()) {
        out[rel] = "dir";
        walk(p);
      } else if (s.isFile()) out[rel] = sha256(readFileSync(p));
      else out[rel] = "other";
    }
  };
  walk(root);
  return out;
}

/** The paths whose entry differs between two snapshots. */
export const changed = (before, after) => [...new Set([...Object.keys(before), ...Object.keys(after)])].filter((p) => before[p] !== after[p]).sort();

/** The nearest enclosing package.json that declares `workspaces`, and its patterns. */
function workspaceRoot(from) {
  for (let dir = from; ; dir = dirname(dir)) {
    const at = join(dir, "package.json");
    if (existsSync(at)) {
      let manifest;
      try {
        manifest = JSON.parse(readFileSync(at, "utf8"));
      } catch {
        manifest = {};
      }
      const ws = Array.isArray(manifest.workspaces) ? manifest.workspaces : manifest.workspaces?.packages;
      if (Array.isArray(ws)) return { root: dir, patterns: ws };
    }
    if (dirname(dir) === dir) return undefined;
  }
}

/** A workspace pattern as a regular expression over `/`-separated relative paths. */
function glob(pattern) {
  const clean = pattern.replace(/^\.\//, "").replace(/\/+$/, "");
  const body = clean
    .split("/")
    .map((seg) => (seg === "**" ? ".*" : seg.split("*").map(escape).join("[^/]*")))
    .join("/");
  return new RegExp(`^${body}$`);
}

/**
 * Where this copy lives (hosting/F20): an installation when its real directory sits directly in a
 * node_modules directory, or in an @scope directory there; the source workspace when the nearest
 * enclosing package.json declaring workspaces lists it; otherwise a cause naming the directory.
 */
export function place(dir = PACKAGE) {
  const parent = dirname(dir);
  if (basename(parent) === "node_modules" || (basename(parent).startsWith("@") && basename(dirname(parent)) === "node_modules")) return { place: "installation" };
  const ws = workspaceRoot(parent);
  if (ws) {
    const rel = slash(relative(ws.root, dir));
    const include = ws.patterns.filter((p) => typeof p === "string" && !p.startsWith("!"));
    const exclude = ws.patterns.filter((p) => typeof p === "string" && p.startsWith("!")).map((p) => p.slice(1));
    if (include.some((p) => glob(p).test(rel)) && !exclude.some((p) => glob(p).test(rel))) return { place: "source", root: ws.root };
    return { cause: `${dir} is neither an installation (its directory is not in a node_modules directory) nor a workspace of ${ws.root}, whose workspaces do not list it`, next: "run npm test in an installation (npm explore @kaihacksai/kaal-hosting -- npm test) or in the package's source workspace" };
  }
  return { cause: `${dir} is neither an installation (its directory is not in a node_modules directory) nor a workspace: no enclosing package.json declares workspaces`, next: "run npm test in an installation (npm explore @kaihacksai/kaal-hosting -- npm test) or in the package's source workspace" };
}

const npm = (args, options) => spawnSync("npm", args, { shell: WINDOWS, ...options });

/** The summary every result carries. */
function base(pkg) {
  return { package: { name: pkg?.name ?? null, version: pkg?.version ?? null, location: PACKAGE }, platform: process.platform, node: process.version };
}

function finish(log, result, causes, summary) {
  for (const { cause, next } of causes) log(`${result}: ${cause}; do: ${next}`);
  const line = { result, ...(result === "verified" ? {} : { cause: causes.map((c) => c.cause).join("; ") }), ...summary };
  log(`${PREFIX}${JSON.stringify(line)}`);
  return EXIT[result];
}

/** The source workspace: every declared test:<name> suite, once each, in name order (hosting/F20). */
export function source(log, pkg) {
  const suites = Object.keys(pkg.scripts ?? {})
    .filter((n) => n.startsWith("test:") && n.length > "test:".length)
    .sort();
  log(`kaal-hosting verification: ${pkg.name}@${pkg.version} in its source workspace, ${PACKAGE}`);
  if (suites.length === 0) return finish(log, "cannot verify", [{ cause: "the package declares no test:<name> suite, so nothing was run", next: "declare the package's suites as test:<name> scripts" }], { place: "source", ...base(pkg), suites: [] });
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const ran = suites.map((name) => {
    log(`running ${name}`);
    const r = npm(["run", name], { cwd: PACKAGE, stdio: "inherit", env });
    const outcome = r.status === 0 ? "pass" : "fail";
    log(`${outcome}: ${name}`);
    return { name, outcome };
  });
  const failed = ran.filter((s) => s.outcome === "fail");
  const causes = failed.map((s) => ({ cause: `the suite ${s.name} failed`, next: `run npm run ${s.name} and correct what it reports` }));
  return finish(log, failed.length ? "failed" : "verified", causes, { place: "source", ...base(pkg), suites: ran });
}

/** The case files on disk in test/embed/. */
const onDisk = () =>
  existsSync(join(PACKAGE, "test", "embed"))
    ? files(join(PACKAGE, "test", "embed"))
        .filter((f) => f.endsWith(".test.mjs"))
        .map((f) => `test/embed/${f}`)
    : [];

/** The consumer: the directory holding the outermost node_modules this copy is in. */
function consumerOf(dir) {
  const parts = dir.split(sep);
  const at = parts.indexOf("node_modules");
  const root = parts.slice(0, at).join(sep) || sep;
  if (at < 1 || !existsSync(join(root, "package.json"))) return { cause: `no consumer project holds ${dir}: the directory above its outermost node_modules has no package.json`, next: "install the package into an npm project and run the command there" };
  return { root };
}

/** The installation: the consumer's verification of the installed copy (hosting/F21–hosting/F25). */
export async function installation(log, pkg) {
  const platform = process.platform;
  const causes = [];
  const failures = [];
  const add = (into, cause, next) => into.push({ cause, next });
  log(`kaal-hosting verification: ${pkg.name}@${pkg.version}, installed at ${PACKAGE}, on ${platform} with Node ${process.version}`);

  const installed = hashes();
  const filesDigest = digest(installed);
  log(`installed files: ${Object.keys(installed).length}, digest ${filesDigest}`);

  let manifest;
  if (!existsSync(join(PACKAGE, MANIFEST))) add(causes, `the shipped manifest ${MANIFEST} is absent`, "reinstall the package and run the command again");
  else {
    try {
      manifest = JSON.parse(readFileSync(join(PACKAGE, MANIFEST), "utf8"));
      if (manifest === null || typeof manifest !== "object" || !Array.isArray(manifest.cases) || typeof manifest.hashes !== "object" || typeof manifest.coverage !== "object") throw new Error("it has no cases, hashes or coverage");
    } catch (e) {
      manifest = undefined;
      add(causes, `the shipped manifest ${MANIFEST} is malformed: ${e.message}`, "reinstall the package and run the command again");
    }
  }

  const declared = manifest ? [...manifest.cases].sort() : [];
  const applicability = manifest?.applicability ?? {};
  const notHere = (name) => Array.isArray(applicability[name]) && applicability[name].includes(platform);
  const outcome = new Map(declared.map((name) => [name, "not run"]));

  if (manifest) {
    const expected = manifest.hashes;
    const mismatched = Object.keys(expected).filter((f) => f in installed && installed[f] !== expected[f]).sort();
    const absent = Object.keys(expected).filter((f) => !(f in installed)).sort();
    const extra = Object.keys(installed).filter((f) => !(f in expected)).sort();
    for (const f of mismatched) add(causes, `an installed file differs from the shipped manifest: ${f}`, "reinstall the package and run the command again");
    for (const f of absent) add(causes, `a shipped file is missing from the installed copy: ${f}`, "reinstall the package and run the command again");
    for (const f of extra) add(causes, `the installed copy holds a file the manifest does not ship: ${f}`, "reinstall the package and run the command again");
    if (mismatched.length + absent.length + extra.length === 0) log(`installed files match the shipped manifest (consistency evidence, not provenance)`);
    if (declared.length === 0) add(causes, "the manifest declares no case", "reinstall the package; if it persists, report it to the package's maintainers");
    for (const name of Object.keys(applicability)) if (!outcome.has(name)) add(causes, `a case declared not applicable is not a declared case: ${name}`, "report this to the package's maintainers");
  }

  const major = Number(process.versions.node.split(".")[0]);
  if (major < 24) add(causes, `Node ${process.versions.node} is older than the required 24`, "run the command with Node 24 or later");
  if (npm(["--version"], { encoding: "utf8" }).status !== 0) add(causes, "npm is not on PATH", "put npm on PATH, then run the command again");
  const consumer = consumerOf(PACKAGE);
  if (consumer.cause) add(causes, consumer.cause, consumer.next);

  let changes = [];
  const undeclared = [];
  if (causes.length === 0) {
    const keep = (p) => p === PACKAGE;
    const before = snapshot(consumer.root, keep);
    const own = snapshot(PACKAGE);
    const named = [...new Set([...declared.map((c) => c.split(" > ")[0]), ...onDisk()])].filter((f) => existsSync(join(PACKAGE, f)));
    const exclude = declared.filter(notHere);
    log(`running ${declared.length} delivered cases from ${named.length} files against the installed copy${exclude.length ? `, ${exclude.length} not applicable on ${platform}` : ""}`);
    const results = named.length ? await execute(named.map((f) => join(PACKAGE, f)), exclude, (o) => log(`${o.outcome}: ${o.name}${o.message ? `: ${o.message}` : ""}`)) : [];
    for (const o of results) {
      if (!outcome.has(o.name)) undeclared.push(o.name);
      else outcome.set(o.name, o.outcome === "skipped" && notHere(o.name) ? "not applicable" : o.outcome);
    }
    for (const name of exclude) if (outcome.get(name) === "not run") outcome.set(name, "not applicable");
    changes = [...changed(before, snapshot(consumer.root, keep)), ...changed(own, snapshot(PACKAGE)).map((p) => slash(relative(consumer.root, join(PACKAGE, p))))].sort();
    for (const p of [...new Set(changes)]) add(failures, `the run changed the consumer: ${p}`, "report this output to the package's maintainers");
  }

  const cases = declared.map((name) => ({ name, loop: loopOf(name.split(" > ")[0]) ?? null, outcome: outcome.get(name) }));
  for (const c of cases) if (c.outcome === "fail") add(failures, `a delivered case failed: ${c.name}`, "report this output to the package's maintainers, with your platform and Node version");
  const ran = causes.length === 0;
  if (ran) {
    for (const c of cases) {
      if (c.outcome === "skipped") add(causes, `a delivered case was skipped outside its declared applicability: ${c.name}`, "report this to the package's maintainers");
      if (c.outcome === "todo") add(causes, `a delivered case is marked todo: ${c.name}`, "report this to the package's maintainers");
      if (c.outcome === "not run") add(causes, `a declared case did not run: ${c.name}`, "reinstall the package; if it persists, report it to the package's maintainers");
      if (c.loop === null) add(causes, `a declared case belongs to no loop: ${c.name}`, "report this to the package's maintainers");
    }
    for (const name of undeclared) add(causes, `a case ran that the manifest does not declare: ${name}`, "reinstall the package and run the command again");
    for (const loop of manifest ? LOOPS : []) if (!cases.some((c) => c.loop === loop && c.outcome === "pass")) add(causes, `the ${loop} loop ran no passing case`, "report this to the package's maintainers");
  }

  // Coverage (hosting/F23): a case covers what its name cites; the manifest states the rest.
  const coverage = {};
  if (manifest) {
    const ids = defined();
    if (ids.length === 0) add(causes, "the installed docs/ define no identifier", "reinstall the package and run the command again");
    const citedBy = new Map();
    for (const c of cases) for (const id of cited(c.name)) citedBy.set(id, [...(citedBy.get(id) ?? []), c]);
    for (const id of ids) {
      const entry = manifest.coverage[id];
      const covering = citedBy.get(id) ?? [];
      if (entry === undefined || entry === null || typeof entry !== "object") {
        add(causes, `${id}, which docs/ defines, is neither covered, allocated nor declared unverified in the manifest`, "report this to the package's maintainers");
        continue;
      }
      if ("covered" in entry) {
        if (covering.length === 0) add(causes, `${id} is declared covered, but no delivered case cites it`, "report this to the package's maintainers");
        else coverage[id] = "covered";
      } else if ("allocated" in entry || "unverified" in entry) {
        const state = "allocated" in entry ? "allocated" : "unverified";
        if (covering.length) add(causes, `${id} is declared ${state}, but delivered cases cite it`, "report this to the package's maintainers");
        else {
          coverage[id] = state;
          log(`${id}: ${state === "allocated" ? `allocated to the publisher (${entry.allocated})` : `verified by no Test Case (${entry.unverified})`}; not verified by this run`);
        }
      } else add(causes, `${id} has no coverage state in the manifest`, "report this to the package's maintainers");
    }
    for (const id of Object.keys(manifest.coverage)) if (!ids.includes(id)) add(causes, `the manifest declares coverage of ${id}, which docs/ does not define`, "report this to the package's maintainers");
    for (const id of citedBy.keys()) if (!ids.includes(id)) add(causes, `a delivered case cites ${id}, which docs/ does not define`, "report this to the package's maintainers");
  }

  const result = failures.length ? "failed" : causes.length ? "cannot verify" : "verified";
  const notApplicable = cases.filter((c) => c.outcome === "not applicable").map((c) => c.name);
  for (const name of notApplicable) log(`not applicable on ${platform}: ${name}`);
  if (result === "verified") log(`verified: every declared case ran and passed, or does not apply on ${platform}, against ${pkg.name}@${pkg.version} installed at ${PACKAGE}, and the consumer is unchanged. This is not provenance, and it covers no behaviour the delivered cases do not check.`);
  return finish(log, result, [...failures, ...(result === "failed" ? causes.map((c) => ({ ...c, cause: `also cannot verify: ${c.cause}` })) : causes)], {
    place: "installation",
    ...base(pkg),
    digest: filesDigest,
    consumer: consumer.root ?? null,
    changed: changes,
    cases,
    coverage,
  });
}

/** Runs the entry; returns the exit status. */
export async function main(log = (line) => console.log(line)) {
  let pkg;
  try {
    pkg = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
  } catch (e) {
    return finish(log, "cannot verify", [{ cause: `the package's package.json cannot be read: ${e.message}`, next: "reinstall the package and run the command again" }], { ...base(undefined) });
  }
  const where = place();
  if (where.cause) return finish(log, "cannot verify", [where], { ...base(pkg) });
  return where.place === "source" ? source(log, pkg) : installation(log, pkg);
}

if (process.argv[1] && pathToFileURL(realpathSync(process.argv[1])).href === import.meta.url) {
  delete process.env.NODE_TEST_CONTEXT;
  main().then(
    (status) => {
      process.exitCode = status;
    },
    (e) => {
      console.log(`cannot verify: the verification itself could not complete: ${e?.message ?? e}; do: report this output to the package's maintainers`);
      console.log(`${PREFIX}${JSON.stringify({ result: "cannot verify", cause: `the verification itself could not complete: ${e?.message ?? e}`, ...base(undefined) })}`);
      process.exitCode = 2;
    },
  );
}
