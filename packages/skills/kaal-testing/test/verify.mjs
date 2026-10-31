// kaal-testing's consumer verification (testing/F61–testing/F66): what `npm test` runs in an installation, as
// `test:consumer`. It checks the installed files against the shipped manifest, test/verify.json, runs every
// delivered case against the installed copy, checks that the consumer is left as it was, and ends in exactly
// one of Testing's results (testing/F13): verified (exit 0), failed (1) or unknown (2), with one summary line
// starting `kaal-testing-verification ` (testing/F44, testing/F49, testing/F50). It imports only Node's built-ins,
// so a broken library cannot mask itself, and it branches on no operating system (testing/F65, testing/N12).
import { createHash } from "node:crypto";
import { existsSync, lstatSync, readdirSync, readFileSync, readlinkSync, realpathSync } from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { run } from "node:test";
import { fileURLToPath } from "node:url";

/** The copy this entry ships in, as the file system resolves it. */
const PACKAGE = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), ".."));
const MANIFEST = "test/verify.json";
const PREFIX = "kaal-testing-verification ";
const EXIT = { verified: 0, failed: 1, unknown: 2 };
const OUTCOME = { passed: "pass", failed: "fail", skipped: "skipped", todo: "todo" };

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const slash = (p) => p.split(sep).join("/");
const plain = (x) => x !== null && typeof x === "object" && !Array.isArray(x);

/** Every file under `base`, relative to it with forward slashes, sorted, leaving out any node_modules directory. */
function files(base) {
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory()) { if (e.name !== "node_modules") walk(join(d, e.name)); }
      else out.push(slash(relative(base, join(d, e.name))));
    }
  };
  walk(base);
  return out.sort();
}

/** The SHA-256 of the regular file at `p` in this copy, or null when it is not one or cannot be read. */
function hashOf(p) {
  try {
    return lstatSync(join(PACKAGE, p)).isFile() ? sha256(readFileSync(join(PACKAGE, p))) : null;
  } catch {
    return null;
  }
}

/** How a parsed manifest departs from the shape `npm run manifest` writes: [] when it has exactly that shape. */
function shapeOf(m) {
  const out = [];
  const KEYS = ["hashes", "cases", "model", "applicability", "platforms"];
  const names = (x) => Array.isArray(x) && x.every((c) => typeof c === "string" && c !== "");
  if (!plain(m)) return ["it is not an object"];
  for (const k of Object.keys(m)) if (!KEYS.includes(k)) out.push(`${k} is not a manifest key`);
  for (const k of KEYS) if (!Object.hasOwn(m, k)) out.push(`${k} is missing`);
  if (!plain(m.hashes) || !Object.entries(m.hashes).every(([p, h]) => p !== "" && typeof h === "string" && /^[0-9a-f]{64}$/.test(h))) out.push("hashes is not a map of path to SHA-256");
  if (!names(m.cases)) out.push("cases is not a list of case names");
  else if (new Set(m.cases).size !== m.cases.length) out.push("a case is declared twice");
  const model = plain(m.model) && Array.isArray(m.model.cases) ? m.model.cases : null;
  if (!model || !model.every((c) => plain(c) && typeof c.id === "string" && names(c.tests))) out.push("model is not a list of cases with their traces");
  else if (names(m.cases) && (model.length !== m.cases.length || !model.every((c) => m.cases.includes(c.id)))) out.push("the model's cases are not the declared cases");
  if (!plain(m.applicability)) out.push("applicability is not an object");
  if (!names(m.platforms) || m.platforms.length === 0) out.push("platforms is not a list of platforms");
  return out;
}

/** Whether this copy sits directly in a node_modules directory: an installation, not the source workspace. */
const installed = (() => {
  const parent = dirname(PACKAGE);
  return basename(parent) === "node_modules" || (basename(parent).startsWith("@") && basename(dirname(parent)) === "node_modules");
})();

/** The consumer: the directory that holds the outermost node_modules this copy is in. */
function consumerOf(location) {
  const parts = location.split(sep);
  const at = parts.indexOf("node_modules");
  return at < 1 ? null : parts.slice(0, at).join(sep) || sep;
}

/** The consumer's whole content, installed packages included: each path with its bytes' SHA-256, a link's target or a directory. */
function snapshot(root) {
  const out = {};
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      const rel = slash(relative(root, p));
      const s = lstatSync(p);
      if (s.isSymbolicLink()) out[rel] = `link:${readlinkSync(p)}`;
      else if (s.isDirectory()) { out[rel] = "dir"; walk(p); }
      else if (s.isFile()) out[rel] = sha256(readFileSync(p));
      else out[rel] = "special";
    }
  };
  walk(root);
  return out;
}

/**
 * Why `name` is not installed whole where Node would resolve it from this copy, or null when it is: its
 * package.json parses, and every runtime file it declares (each `exports` target other than a type declaration,
 * its `main` and each `bin`) is a regular file. Nothing is loaded.
 */
function incomplete(name) {
  let at = null;
  for (let d = PACKAGE; ; d = dirname(d)) {
    const here = join(d, "node_modules", ...name.split("/"));
    if (existsSync(join(here, "package.json"))) { at = here; break; }
    if (dirname(d) === d) return `${name} does not resolve from the installed copy`;
  }
  let meta;
  try {
    meta = JSON.parse(readFileSync(join(at, "package.json"), "utf8"));
  } catch {
    return `${name}'s package.json cannot be read`;
  }
  const targets = [];
  const leaves = (x) => {
    if (typeof x === "string") targets.push(x);
    else if (plain(x)) for (const v of Object.values(x)) leaves(v);
    else if (Array.isArray(x)) x.forEach(leaves);
  };
  leaves(meta.exports);
  if (typeof meta.main === "string") targets.push(meta.main);
  if (typeof meta.bin === "string") targets.push(meta.bin);
  else if (plain(meta.bin)) leaves(meta.bin);
  if (meta.exports === undefined && meta.main === undefined) targets.push("index.js");
  const absent = targets.filter((t) => !t.includes("*") && !/\.d\.[cm]?ts$/.test(t)).filter((t) => {
    try { return !lstatSync(join(at, t)).isFile(); } catch { return true; }
  });
  return absent.length ? `${name} is installed without ${[...new Set(absent)].join(", ")}` : null;
}

let pkg = {};
try {
  pkg = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
} catch {
  // reported below as part of the candidate
}
const summary = { result: "unknown", package: { name: pkg.name, version: pkg.version, location: PACKAGE }, platform: process.platform, node: process.version, digest: null, cases: [] };

/** Prints the one summary line and exits with the result's status. */
function end(result, diagnosis) {
  summary.result = result;
  if (result !== "verified") Object.assign(summary, diagnosis);
  process.stdout.write(`${PREFIX}${JSON.stringify(summary)}\n`);
  process.exit(EXIT[result]);
}
const unknown = (cause, evidence, step = "inspect the evidence", kind = "diagnostic") => end("unknown", { cause, evidence, next: { kind, step } });

// The candidate: the manifest, and every other file against it.
let manifest;
try {
  manifest = JSON.parse(readFileSync(join(PACKAGE, MANIFEST), "utf8"));
} catch (e) {
  const absent = e?.code === "ENOENT";
  unknown(absent ? "the shipped manifest is absent" : "the shipped manifest does not parse", [`${MANIFEST}: ${absent ? "no such file" : e.message}`], "reinstall the package from the registry or its packed tarball, then run the verification again", "precise");
}
// A manifest that parses is still read only when it has exactly the shape the publisher wrote: nothing in it is
// normalized away, so a malformed entry can never shrink what must be verified.
const malformed = shapeOf(manifest);
if (malformed.length) unknown("the shipped manifest is malformed", malformed.map((m) => `${MANIFEST}: ${m}`), "reinstall the package from the registry or its packed tarball, then run the verification again", "precise");
const declared = manifest.cases;
summary.cases = declared.map((name) => ({ name, outcome: "not run" }));
let present;
try {
  present = installed ? files(PACKAGE).filter((p) => p !== MANIFEST) : Object.keys(manifest.hashes).filter((p) => existsSync(join(PACKAGE, p))).sort();
} catch (e) {
  unknown("the installed copy cannot be read", [`${e.code ?? "error"}: ${e.message}`], "reinstall the package from the registry or its packed tarball, then run the verification again", "precise");
}
summary.digest = sha256(present.map((p) => `${p}\0${hashOf(p) ?? "unreadable"}\n`).join(""));
const differs = [];
for (const p of Object.keys(manifest.hashes).sort()) {
  const h = hashOf(p);
  if (!existsSync(join(PACKAGE, p)) && h === null) differs.push(`${p} is missing`);
  else if (h === null) differs.push(`${p} is not a readable file`);
  else if (h !== manifest.hashes[p]) differs.push(`${p} does not match the manifest`);
}
if (installed) for (const p of present) if (!Object.hasOwn(manifest.hashes, p)) differs.push(`${p} is not in the manifest`);
if (differs.length) unknown("the installed files are not the package as shipped", differs, "reinstall the package from the registry or its packed tarball, then run the verification again", "precise");
const gaps = Object.keys(pkg.dependencies ?? {}).map((d) => [d, incomplete(d)]).filter(([, why]) => why);
if (gaps.length) unknown("a required runtime dependency is absent", gaps.map(([, why]) => why), `install ${gaps.map(([d]) => d).join(" and ")} into the consumer, then run the verification again`, "precise");
if (declared.length === 0) unknown("the manifest declares no case", [`${MANIFEST} lists no delivered case`], "analyze", "exploratory");
if (!plain(manifest.applicability) || Object.keys(manifest.applicability).length > 0) unknown("the manifest declares a case not applicable, and Testing 0.0.1 has none", [`${MANIFEST} applicability: ${JSON.stringify(manifest.applicability)}`], "analyze", "exploratory");

// The consumer before the run.
const consumer = installed ? consumerOf(PACKAGE) : null;
/** The consumer's snapshot, or unknown naming what could not be read: its integrity cannot then be established. */
const inspect = (root) => {
  try {
    return snapshot(root);
  } catch (e) {
    unknown("the consumer cannot be inspected, so whether the run left it unchanged cannot be established", [`${e.path ?? root}: ${e.code ?? e.message}`], "make the consumer readable to this user, then run the verification again", "precise");
  }
};
const before = consumer ? inspect(consumer) : null;

// Run every delivered file against this copy and account for each leaf test by its title, a case's name.
const caseFiles = Object.keys(manifest.hashes).filter((p) => /^test\/embed\/[^/]+\.test\.mjs$/.test(p));
const absentFiles = caseFiles.filter((f) => !existsSync(join(PACKAGE, f)));
// An outer test runner (a publisher's own `node --test`) must not turn this verification into a nested no-op run.
delete process.env.NODE_TEST_CONTEXT;
const env = { ...process.env };
const stacks = new Map();
const outcomes = new Map();
const extra = [];
for await (const e of run({ files: caseFiles.filter((f) => !absentFiles.includes(f)).map((f) => join(PACKAGE, f)), concurrency: true, env })) {
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
  const file = slash(relative(PACKAGE, d.file ?? ""));
  const name = whole ? file : d.name;
  const status = d.skip !== undefined && d.skip !== false ? "skipped" : d.todo !== undefined && d.todo !== false ? "todo" : e.type === "test:pass" ? "passed" : "failed";
  if (declared.includes(name)) outcomes.set(name, outcomes.has(name) ? "repeated" : OUTCOME[status]);
  else extra.push(`${name} ran and is not declared`);
}
for (const c of summary.cases) c.outcome = outcomes.get(c.name) === "repeated" ? "not run" : (outcomes.get(c.name) ?? "not run");

// The consumer after the run: a change breaks the run's own promise to leave it as it was (testing/F15).
if (consumer) {
  const after = inspect(consumer);
  const changed = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter((p) => before[p] !== after[p]).sort();
  if (changed.length) end("failed", { cause: "the consumer's content changed during the verification", evidence: changed.map((p) => `${p} changed`), next: { kind: "diagnostic", step: "inspect what changed in the consumer" } });
}
const failing = summary.cases.filter((c) => c.outcome === "fail");
if (failing.length) end("failed", { cause: "a declared case failed against the installed package", evidence: failing.map((c) => `${c.name} failed`), next: { kind: "diagnostic", step: "inspect the failing case's output with node --test" } });
const notRun = summary.cases.filter((c) => c.outcome !== "pass");
if (notRun.length || extra.length || absentFiles.length) unknown("not every declared case ran and passed", [...absentFiles.map((f) => `${f} is not delivered`), ...notRun.map((c) => `${c.name} is ${c.outcome}`), ...extra], "analyze", "exploratory");
end("verified");
