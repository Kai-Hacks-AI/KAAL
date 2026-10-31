// The generic KAAL Package contract's conformance suite (packaging/C4, packaging/A7). It decides
// each generic Requirement against one installed KAAL package, from that package's behaviour and
// bytes, never from a file merely existing (packaging/N9). No KAAL package imports it: Engineering
// runs it from outside, beside the package's own suite, on the same installed candidate.
//
// Results are Testing's: verified, failed or unknown (testing/F13). Packaging defines none of its
// own (packaging/N10). A tampered installed file is unknown, not failed (testing/F43). Until
// Testing's verifier contract (testing/C29) is approved, a result line is checked only for what
// every product already agrees on: the three results and exit codes 0, 1 and 2.
//
// Every host operation goes through kaal-hosting, and SHA-256 comes from kaal-foundation
// (packaging/A1, packaging/N3).
import { sha256 } from "@kaihacksai/kaal-foundation/sha256";
import { execute, initialize, kind, read, readFile } from "kaal-hosting";
import * as hosting from "kaal-hosting/conformance";
import builtins from "./builtins.json" with { type: "json" };

/** The documents a KAAL package ships (packaging/F8, the Owner's D2 on #658). */
export const DOCUMENTS = ["intent", "requirements", "architecture", "testing", "limitations", "operations"].map((d) => `docs/${d}.md`);

/** An exact version: no range, tag, URL, path or Git reference. */
const EXACT = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

/** Each result a verifier may report, with the exit code every product pairs with it. */
const EXIT = { verified: 0, failed: 1, "cannot verify": 2, unknown: 2 };

/** Node's own modules, which a self-contained verifier may import unprefixed without declaring them. */
const BUILTINS = new Set(builtins);

const finding = (requirement, result, cause) => ({ requirement, result, cause });

/** `path` under `dir`, whatever separators `dir` ends with. */
function join(dir, path) {
  let end = dir.length;
  while (end > 0 && (dir[end - 1] === "/" || dir[end - 1] === "\\")) end--;
  return `${dir.slice(0, end)}/${path}`;
}

const text = async (path) => (await readFile(path)).toString("utf8");

async function manifestOf(dir) {
  return JSON.parse(await text(join(dir, "package.json")));
}

/** The installed files a package delivers: everything under its directory but its own node_modules. */
async function delivered(dir) {
  const files = await read(dir);
  for (const path of Object.keys(files)) if (path === "node_modules" || path.startsWith("node_modules/")) delete files[path];
  return files;
}

/** packaging/F7: one name, one exact version, and exact registry dependencies. */
function identity(pkg) {
  const problems = [];
  if (typeof pkg.name !== "string" || pkg.name === "") problems.push("it states no name");
  if (typeof pkg.version !== "string" || !EXACT.test(pkg.version)) problems.push(`its version ${JSON.stringify(pkg.version)} is not one exact version`);
  for (const field of ["dependencies", "optionalDependencies", "peerDependencies"]) {
    for (const [name, spec] of Object.entries(pkg[field] ?? {})) {
      if (typeof spec !== "string" || !EXACT.test(spec)) problems.push(`${field} ${name} is ${JSON.stringify(spec)}, not one exact registry version`);
    }
  }
  return problems.length ? finding("packaging/F7", "failed", problems.join("; ")) : finding("packaging/F7", "verified", `${pkg.name}@${pkg.version}`);
}

/** packaging/F8: every shipped document is present and non-empty, and the README links Operations. */
function documents(files) {
  const problems = [];
  for (const doc of DOCUMENTS) {
    if (!(doc in files)) problems.push(`${doc} is not shipped`);
    else if (files[doc].toString("utf8").trim() === "") problems.push(`${doc} is empty`);
  }
  const readme = files["README.md"]?.toString("utf8");
  if (readme === undefined) problems.push("README.md is not shipped");
  else if (!/\]\((?:\.\/)?docs\/operations\.md(?:#[^)]*)?\)/.test(readme)) problems.push("README.md does not link docs/operations.md");
  return problems.length ? finding("packaging/F8", "failed", problems.join("; ")) : finding("packaging/F8", "verified", `${DOCUMENTS.length} documents shipped; the README links docs/operations.md`);
}

/** The result a verifier reported on its last line, or why none could be read. */
export function resultLine(stdout) {
  const line = stdout.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).at(-1);
  if (line === undefined) return { error: "it printed nothing" };
  const structured = /^(\S+) (\{.*\})$/.exec(line);
  if (structured) {
    let summary;
    try {
      summary = JSON.parse(structured[2]);
    } catch {
      return { error: `its last line is not a result: ${JSON.stringify(line.slice(0, 120))}` };
    }
    if (!(summary.result in EXIT)) return { error: `its last line reports ${JSON.stringify(summary.result)}, which is not a result` };
    const causes = Array.isArray(summary.causes) ? summary.causes.filter((c) => typeof c === "string" && c.trim() !== "") : [];
    return { result: summary.result, exit: summary.exit, causes, summary };
  }
  const bare = /^(verified|failed|cannot verify|unknown)(?::(.*))?$/.exec(line);
  if (bare) return { result: bare[1], exit: EXIT[bare[1]], causes: bare[2]?.trim() ? [bare[2].trim()] : [], summary: null };
  return { error: `its last line is not a result: ${JSON.stringify(line.slice(0, 120))}` };
}

/** The outcome words of testing/C29's per-case entries (#639, testing/F44): hosting/F21's, and todo. */
const RAN = new Set(["pass", "fail"]);
const ACCOUNTED = new Set(["pass", "fail", "not applicable"]);

/** How many declared cases the run says it executed, when it says. */
function executedOf(parsed, stdout) {
  const cases = parsed.summary?.cases;
  if (Array.isArray(cases)) return cases.filter((c) => RAN.has(c?.outcome)).length;
  const n = cases?.executed;
  if (Number.isInteger(n)) return n;
  const m = [...stdout.matchAll(/\b(\d+) (?:passed|executed)\b/g)].at(-1);
  return m ? Number(m[1]) : undefined;
}

/** packaging/F9, F10 and N9: the installed `npm test`, its result line, and evidence that cases ran. */
function verification(pkg, files, run) {
  const reach = imports(files).filter(({ path, specifier }) => specifier.startsWith("/") || (specifier.startsWith(".") && escapes(path, specifier))).map(({ path, specifier }) => `${path} imports ${specifier}`);
  if (pkg.scripts?.test === undefined) {
    const cause = "the package declares no npm test";
    return { run: null, findings: [finding("packaging/F9", "failed", cause), finding("packaging/F10", "failed", cause), finding("packaging/N9", "unknown", cause)] };
  }
  if (run.error) {
    const cause = `npm test could not be run: ${run.error}`;
    return { run: null, findings: [finding("packaging/F9", "unknown", cause), finding("packaging/F10", "unknown", cause), finding("packaging/N9", "unknown", cause)] };
  }
  const parsed = resultLine(run.stdout);
  if (parsed.error) {
    const cause = `the installed npm test exited ${run.status} and reported no result: ${parsed.error}${reach.length ? `; it reaches outside the installed copy: ${reach.sort().join("; ")}` : ""}`;
    return { run: null, findings: [finding("packaging/F9", "failed", cause), finding("packaging/F10", "failed", cause), finding("packaging/N9", "unknown", "no result was reported")] };
  }
  const reported = { result: parsed.result, exit: run.status, causes: parsed.causes };
  const f9 = reach.length
    ? finding("packaging/F9", "failed", `the installed verification reaches outside the installed copy: ${reach.sort().join("; ")}`)
    : finding("packaging/F9", "verified", `the installed npm test ran against the installed copy and reported ${parsed.result}`);
  const problems = [];
  if (EXIT[parsed.result] !== run.status) problems.push(`it reported ${parsed.result} but exited ${run.status}`);
  if (parsed.exit !== undefined && parsed.exit !== run.status) problems.push(`its line names exit ${parsed.exit} but it exited ${run.status}`);
  const cases = parsed.summary?.cases;
  const failedCases = Array.isArray(cases)
    ? cases.filter((c) => c?.outcome === "fail").length
    : Number.isInteger(cases?.failed)
      ? cases.failed
      : Number([...run.stdout.matchAll(/\b(\d+) failed\b/g)].at(-1)?.[1] ?? 0);
  if (parsed.result === "verified" && failedCases > 0) problems.push(`it reported verified with ${failedCases} cases failed`);
  if (parsed.result !== "verified" && parsed.causes.length === 0) problems.push(`it reported ${parsed.result} without a cause`);
  const f10 = problems.length ? finding("packaging/F10", "failed", problems.join("; ")) : finding("packaging/F10", "verified", `${parsed.result}, exit ${run.status}`);
  // packaging/N9 is decided by the behaviour probe (`probe`), not here: a count alone never
  // certifies behaviour. A verified run with no case at all is failed without one.
  let n9 = null;
  if (parsed.result !== "verified") n9 = finding("packaging/N9", "verified", "it did not claim verified, so it claims nothing on presence alone");
  else if (executedOf(parsed, run.stdout) === 0) n9 = finding("packaging/N9", "failed", "it reported verified, but no case ran");
  return { run: { ...reported, parsed }, findings: [f9, f10, ...(n9 ? [n9] : [])] };
}

/**
 * The cases a run reports, by identity, in testing/C29's form (#639, testing/F44–F45): the
 * summary's `cases` is an ordered list, one entry per reported execution, each `{ name, outcome }`.
 * A run that reports counts only says nothing about which cases ran.
 */
function executions(run) {
  const cases = run?.parsed.summary?.cases;
  if (!Array.isArray(cases)) return undefined;
  return cases.map((c) => ({ name: typeof c?.name === "string" ? c.name : null, outcome: c?.outcome }));
}

/** packaging/F11: the installed files against the shipped manifest, and every declared case run exactly once. */
function manifest(files, verify, run) {
  if (!verify || typeof verify.files !== "object" || verify.files === null) {
    return finding("packaging/F11", "unknown", "the package ships no manifest of its files with their SHA-256 (test/verify.json)");
  }
  const problems = [];
  const listed = verify.files;
  for (const [path, digest] of Object.entries(listed)) {
    if (!(path in files)) problems.push(`${path} is missing`);
    else if (sha256(files[path]) !== digest) problems.push(`${path} differs from the manifest`);
  }
  for (const path of Object.keys(files)) if (!(path in listed) && path !== "test/verify.json") problems.push(`${path} is not in the manifest`);
  if (!Array.isArray(verify.cases)) problems.push("the manifest declares no case inventory");
  else if (run) {
    const ran = executions(run);
    if (ran === undefined) problems.push("the run reports counts, not each case by name (testing/C29's `cases`), so which declared cases ran cannot be told");
    else {
      const declared = new Set(verify.cases);
      const seen = new Map();
      for (const { name } of ran) seen.set(name, (seen.get(name) ?? 0) + 1);
      const missing = verify.cases.filter((id) => !seen.has(id));
      const unrun = ran.filter(({ name, outcome }) => declared.has(name) && !ACCOUNTED.has(outcome)).map(({ name, outcome }) => `${name} (${outcome ?? "no outcome"})`);
      if (unrun.length) problems.push(`declared cases were reported but did not run: ${unrun.join(", ")}`);
      const twice = [...seen].filter(([id, n]) => id !== null && n > 1).map(([id, n]) => `${id} (${n} times)`);
      const undeclared = [...seen.keys()].filter((id) => id === null || !declared.has(id)).map((id) => id ?? "an outcome naming no case");
      if (missing.length) problems.push(`declared cases did not run: ${missing.join(", ")}`);
      if (twice.length) problems.push(`declared cases ran more than once: ${twice.join(", ")}`);
      if (undeclared.length) problems.push(`cases ran that the manifest does not declare: ${undeclared.join(", ")}`);
    }
  }
  // Consistency with a shipped manifest is not provenance (testing/F14), and a mismatch makes the
  // evidence untrustworthy rather than showing the contract broken: unknown (testing/F43).
  return problems.length ? finding("packaging/F11", "unknown", problems.join("; ")) : finding("packaging/F11", "verified", `${Object.keys(listed).length} files match the manifest, and each of the ${verify.cases.length} declared cases ran exactly once`);
}

/**
 * packaging/F12, decided against a manifest: the runtime is declared, and the package is not limited
 * by operating system or processor unless Hosting declares it the OS boundary. Packaging holds no OS
 * policy of its own: whether a package is the boundary is Hosting's `osBoundary` (hosting/F36), and
 * a restriction outside it is an architectural violation (hosting/F39). Where the installed Hosting
 * declares no boundary yet, a restriction cannot be decided and is unknown, never verified.
 */
export function platforms(pkg, { osBoundary = typeof hosting.osBoundary === "function" ? hosting.osBoundary : undefined } = {}) {
  if (typeof pkg.engines?.node !== "string" || pkg.engines.node.trim() === "") return finding("packaging/F12", "failed", "the package declares no runtime (engines.node)");
  const limits = ["os", "cpu"].filter((k) => pkg[k] !== undefined);
  if (limits.length === 0) return finding("packaging/F12", "verified", `node ${pkg.engines.node}, with no os or cpu restriction: which hosts it runs on is Hosting's (hosting/F39)`);
  const fields = limits.map((k) => `${k} ${JSON.stringify(pkg[k])}`).join(" and ");
  if (osBoundary === undefined) return finding("packaging/F12", "unknown", `it restricts ${fields}, and the installed Hosting declares no OS boundary (hosting/F36) to decide whether it may`);
  if (osBoundary(String(pkg.name)) === true) return finding("packaging/F12", "verified", `node ${pkg.engines.node}; ${pkg.name} is Hosting's OS boundary (hosting/F36), so its ${fields} is Hosting's to decide`);
  return finding("packaging/F12", "failed", `it restricts ${fields}, but only Hosting's OS boundary may (hosting/F39); ${pkg.name} is not it (hosting/F36)`);
}

/**
 * Testing's model functions (testing/F24, testing/F25), when the installed Testing provides them.
 * Packaging reads traces only through them and keeps no model semantics of its own.
 */
const TESTING = await import("kaal-testing/model").then(
  (m) => (typeof m.check === "function" && typeof m.tested === "function" ? m : undefined),
  () => undefined,
);

/** The fields of the coverage registry rejected in Testing #667: declarations, never evidence (testing/F66). */
const REGISTRY = ["identifiers", "coverage", "allocated", "unverified"];

/**
 * packaging/F13, decided against the shipped files and manifest: the traces a package ships are
 * Testing's model, Case —tests→ Target (testing/F25, testing/F66), and they resolve. Testing's
 * `check` finds nothing in the shipped `model`; its Cases are exactly the delivered cases; and every
 * target is an identifier the shipped documents define. Which targets are evidenced is Testing's to
 * derive from these traces and the latest applicable Run (testing/F40). Packaging declares no
 * coverage, reads no coverage registry, and applies no rule that every identifier be tested.
 */
export function traceability(files, verify, { testing = TESTING } = {}) {
  const ids = new Set();
  for (const [path, bytes] of Object.entries(files)) if (/^docs\/[^/]+\.md$/.test(path)) for (const id of defined(new TextDecoder().decode(bytes))) ids.add(id);
  const registry = REGISTRY.filter((k) => verify?.[k] !== undefined);
  const ignored = registry.length ? `; its ${registry.join(", ")} are a coverage declaration, not evidence, and were not read (testing/F66)` : "";
  const model = verify?.model;
  if (model === undefined) {
    if (ids.size === 0) return finding("packaging/F13", "verified", `it ships no Testing model, and its documents define no identifier a Case could test: there is no trace to resolve${ignored}`);
    return finding("packaging/F13", "unknown", `its documents define ${ids.size} identifiers, and it ships no Testing model (test/verify.json \`model\`, testing/F64) from which the Cases that test them are derived${ignored}`);
  }
  if (testing == null) return finding("packaging/F13", "unknown", `it ships a Testing model, and the installed Testing provides no model functions (kaal-testing/model, testing/F25) to read it with${ignored}`);
  const problems = testing.check(model).map((p) => `Testing's check: ${p}`);
  const traces = problems.length ? {} : testing.tested(model);
  const dangling = Object.keys(traces).filter((target) => !ids.has(target));
  if (dangling.length) problems.push(`Cases test identifiers its documents do not define: ${dangling.map((t) => `${t} (by ${traces[t].join(", ")})`).join("; ")}`);
  const live = new Set((Array.isArray(model?.cases) ? model.cases : []).filter((c) => c?.retired !== true && typeof c?.id === "string").map((c) => c.id));
  if (!Array.isArray(verify.cases)) problems.push("the manifest declares no delivered cases to hold its model's Cases against");
  else {
    const delivered = new Set(verify.cases);
    const undelivered = [...live].filter((id) => !delivered.has(id)).sort();
    const unmodelled = [...delivered].filter((id) => !live.has(id)).sort();
    if (undelivered.length) problems.push(`the model's Cases are not delivered: ${undelivered.join(", ")}`);
    if (unmodelled.length) problems.push(`delivered cases are not Cases of its model: ${unmodelled.join(", ")}`);
  }
  if (problems.length) return finding("packaging/F13", "failed", problems.join("; ") + ignored);
  const targets = Object.keys(traces).length;
  return finding(
    "packaging/F13",
    "verified",
    `its ${live.size} delivered cases are its model's Cases, and they test ${targets} of the ${ids.size} identifiers its documents define; which are evidenced is Testing's to derive from these traces and the latest applicable Run (testing/F40)${ignored}`,
  );
}

/** The consumer's project, byte for byte, or why it cannot be read. */
async function snapshot(root) {
  try {
    return await read(root);
  } catch (e) {
    return { error: e.message };
  }
}

/** packaging/N7: the consumer's project, byte for byte, before and after. */
function intact(before, after) {
  if (before.error || after.error) return finding("packaging/N7", "unknown", `the consumer could not be compared: ${before.error ?? after.error}`);
  const changed = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter((p) => !(p in before) || !(p in after) || !before[p].equals(after[p])).sort();
  return changed.length
    ? finding("packaging/N7", "failed", `verification changed the consumer: ${changed.slice(0, 10).join(", ")}${changed.length > 10 ? ", …" : ""}`)
    : finding("packaging/N7", "verified", "the consumer is unchanged");
}

/** Every import specifier a shipped module names, by the module's path. */
function imports(files) {
  const found = [];
  for (const [path, bytes] of Object.entries(files)) {
    if (!/\.(mjs|cjs|js)$/.test(path)) continue;
    for (const m of bytes.toString("utf8").matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|\brequire\s*\(\s*)["']([^"']+)["']/g)) found.push({ path, specifier: m[1] });
  }
  return found;
}

/** Whether a relative specifier in the module at `path` leaves the package's own directory. */
function escapes(path, specifier) {
  const parts = path.split("/").slice(0, -1);
  for (const part of specifier.split("/")) {
    if (part === "..") {
      if (parts.length === 0) return true;
      parts.pop();
    } else if (part !== ".") parts.push(part);
  }
  return false;
}

/** The package a bare specifier names: `@scope/name` or `name`. */
const packageOf = (specifier) => specifier.split("/").slice(0, specifier.startsWith("@") ? 2 : 1).join("/");

/** packaging/N8: every shipped module imports only Node's own modules, the package, and its declared dependencies. */
function selfContained(pkg, files) {
  const declared = new Set([pkg.name, ...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.optionalDependencies ?? {})]);
  const undeclared = new Set();
  for (const { path, specifier: s } of imports(files)) {
    if (s.startsWith(".") || s.startsWith("/") || s.startsWith("node:") || s.startsWith("#")) continue;
    const name = packageOf(s);
    if (BUILTINS.has(name) || declared.has(name)) continue;
    undeclared.add(`${path} imports ${name}`);
  }
  return undeclared.size
    ? finding("packaging/N8", "failed", `undeclared imports: ${[...undeclared].sort().join("; ")}`)
    : finding("packaging/N8", "verified", "every shipped module imports only Node's modules, the package and its declared dependencies");
}

/** The consumer project an installed package sits in: the directory holding its first node_modules. */
function projectOf(dir) {
  const at = [..."/\\"].flatMap((a) => [..."/\\"].map((b) => dir.indexOf(`${a}node_modules${b}`))).filter((i) => i >= 0);
  return at.length ? dir.slice(0, Math.min(...at)) : dir;
}

/** The text that replaces every shipped module in the behaviour probe. */
const BROKEN = 'throw new Error("kaal-packaging N9 probe: this module was broken on purpose");\n';

/**
 * packaging/N9's behaviour probe. In `work`, never in the consumer, it installs a copy of the
 * package beside the consumer's dependencies with every shipped module outside test/ broken, and
 * the shipped manifest's digests rewritten to match, so that a verification that checks only
 * presence or digests cannot tell the difference. It runs that copy's `npm test` once. A
 * verification that still reports verified decides from presence, not behaviour: failed. One that
 * no longer does depends on the modules' behaviour; whether its assertions are adequate stays its
 * owner's, and the finding says so.
 */
async function probe(pkg, files, root, { work, env }) {
  if (work === undefined) return finding("packaging/N9", "unknown", "no working directory was given for the behaviour probe, so behaviour was not checked");
  const modules = Object.keys(files).filter((p) => /\.(mjs|cjs|js)$/.test(p) && !p.startsWith("test/"));
  if (modules.length === 0) return finding("packaging/N9", "unknown", "the package ships no module outside test/ to break, so behaviour cannot be told from presence here");
  const copy = { ...files };
  for (const p of modules) copy[p] = Buffer.from(BROKEN);
  if ("test/verify.json" in copy) {
    try {
      const v = JSON.parse(copy["test/verify.json"].toString("utf8"));
      if (v.files && typeof v.files === "object") for (const p of modules) if (p in v.files) v.files[p] = sha256(copy[p]);
      copy["test/verify.json"] = Buffer.from(JSON.stringify(v, null, 2) + "\n");
    } catch {
      // An unreadable manifest is F11's finding; the probe runs with it as shipped.
    }
  }
  const tree = { "package.json": Buffer.from(JSON.stringify({ name: "kaal-packaging-probe", private: true }) + "\n") };
  let dependencies = {};
  try {
    dependencies = await read(join(root, "node_modules"));
  } catch (e) {
    return finding("packaging/N9", "unknown", `the behaviour probe could not copy the consumer's dependencies: ${e.message}`);
  }
  const own = `${pkg.name}/`;
  for (const [p, bytes] of Object.entries(dependencies)) if (!p.startsWith(own) && !p.startsWith(".")) tree[`node_modules/${p}`] = bytes;
  for (const [p, bytes] of Object.entries(copy)) tree[`node_modules/${own}${p}`] = bytes;
  let r;
  try {
    await initialize(work, tree);
    r = await execute("npm", ["test", "--silent"], { cwd: join(work, `node_modules/${pkg.name}`), env });
  } catch (e) {
    return finding("packaging/N9", "unknown", `the behaviour probe could not run: ${e.message}`);
  }
  const parsed = resultLine(r.stdout);
  if (!parsed.error && parsed.result === "verified" && r.status === 0) {
    return finding("packaging/N9", "failed", `with all ${modules.length} shipped modules outside test/ broken, its verification still reports verified: it decides from presence, not behaviour`);
  }
  return finding(
    "packaging/N9",
    "verified",
    `with its ${modules.length} shipped modules broken, its verification no longer reports verified (${parsed.error ? "no result" : parsed.result}): it depends on their behaviour. Whether its assertions are adequate is its owner's to show`,
  );
}

/** The overall result: failed when any finding failed, unknown when any is unknown, else verified. */
const overall = (findings) => (findings.some((f) => f.result === "failed") ? "failed" : findings.some((f) => f.result === "unknown") ? "unknown" : "verified");

/**
 * The generic KAAL Package contract, decided against the package installed at `dir` (absolute)
 * inside the consumer project `consumer` (absolute, default: the directory holding its
 * node_modules). It runs the package's installed `npm test` there once, and once more for the
 * behaviour probe in `work` (absolute; a missing or empty directory the caller owns and removes).
 * It returns each finding, the overall result, and what the package's own verification reported,
 * which is the package's specific contract and not Packaging's to judge. `testing` is Testing's
 * model functions for packaging/F13; by default, the installed Testing's.
 */
export async function conform(dir, { consumer, env, work, testing } = {}) {
  if ((await kind(dir)) !== "directory") throw new Error(`${dir} is not an installed package directory`);
  const root = consumer ?? projectOf(dir);
  const pkg = await manifestOf(dir);
  const files = await delivered(dir);
  let verify = null;
  if ("test/verify.json" in files) {
    try {
      verify = JSON.parse(files["test/verify.json"].toString("utf8"));
    } catch {
      verify = null;
    }
  }
  const before = await snapshot(root);
  let run = {};
  if (pkg.scripts?.test !== undefined) {
    try {
      run = await execute("npm", ["test", "--silent"], { cwd: dir, env });
    } catch (e) {
      run = { error: e.message };
    }
  }
  const checked = verification(pkg, files, run);
  const n9 = checked.findings.find((f) => f.requirement === "packaging/N9") ?? (await probe(pkg, files, root, { work, env }));
  const after = await snapshot(root);
  const findings = [
    identity(pkg),
    documents(files),
    ...checked.findings.filter((f) => f.requirement !== "packaging/N9"),
    manifest(files, verify, checked.run),
    platforms(pkg),
    traceability(files, verify, { testing }),
    intact(before, after),
    selfContained(pkg, files),
    n9,
  ];
  return {
    package: { name: pkg.name, version: pkg.version, location: dir },
    result: overall(findings),
    findings,
    reported: checked.run ? { result: checked.run.result, exit: checked.run.exit, causes: checked.run.causes } : null,
  };
}

/** The names under which a source Test Plan declares its Embedded verification in the npm realization (packaging/A10, README). */
export const EMBEDDED = ["test:embedded", "test:consumer"];

/** The declared suites a source `npm test` script runs, when it states them; `null` when it does not. */
function followed(script, suites) {
  // Read word by word: `npm`, any flags, `run` or `run-script`, then the suite's name.
  const words = script.split(/\s+/).filter(Boolean);
  const named = [];
  for (let i = 0; i < words.length; i++) {
    if (words[i] !== "npm") continue;
    let j = i + 1;
    while (j < words.length && words[j].startsWith("-")) j++;
    if ((words[j] === "run" || words[j] === "run-script") && /^test:[\w:.-]+$/.test(words[j + 1] ?? "")) named.push(words[j + 1]);
  }
  if (named.length) return named;
  const same = Object.entries(suites).filter(([, command]) => command.trim() === script.trim()).map(([name]) => name);
  return same.length ? same : null;
}

/**
 * packaging/F14: a package's source workspace at `dir` declares its Test Plan as named
 * `test:<suite>` scripts, its Embedded verification among them, and its `npm test` there runs
 * declared suites and reports a result. An `npm test` that does not say which suites it runs
 * cannot be decided from outside, and is unknown.
 */
export async function conformSource(dir, { env } = {}) {
  const pkg = await manifestOf(dir);
  const scripts = pkg.scripts ?? {};
  const suites = Object.fromEntries(Object.entries(scripts).filter(([name]) => name.startsWith("test:")));
  if (scripts.test === undefined) return finding("packaging/F14", "failed", "the source workspace declares no npm test");
  if (Object.keys(suites).length === 0) return finding("packaging/F14", "failed", "the source workspace declares no Test Plan: no test:<suite> script");
  const embedded = EMBEDDED.filter((name) => name in suites);
  if (embedded.length === 0) return finding("packaging/F14", "failed", `the Test Plan omits the Embedded verification (${EMBEDDED.join(" or ")})`);
  const runs = followed(scripts.test, suites);
  if (runs === null) return finding("packaging/F14", "unknown", `npm test (${JSON.stringify(scripts.test)}) does not state which declared suites it runs`);
  const missing = runs.filter((name) => !(name in suites));
  if (missing.length) return finding("packaging/F14", "failed", `npm test runs ${missing.join(", ")}, which the Test Plan does not declare`);
  let run;
  try {
    run = await execute("npm", ["test", "--silent"], { cwd: dir, env });
  } catch (e) {
    return finding("packaging/F14", "unknown", `npm test could not be run: ${e.message}`);
  }
  const parsed = resultLine(run.stdout);
  if (parsed.error) return finding("packaging/F14", "failed", `the source npm test exited ${run.status} and reported no result: ${parsed.error}`);
  if (EXIT[parsed.result] !== run.status) return finding("packaging/F14", "failed", `the source npm test reported ${parsed.result} but exited ${run.status}`);
  return finding("packaging/F14", "verified", `the source npm test runs ${runs.join(", ")} of the declared ${Object.keys(suites).join(", ")}, and reported ${parsed.result}`);
}

/** Testing's result terms, which no Packaging Requirement may define (packaging/N10). */
const TERMS = /[`*"](verified|failed|unknown|cannot verify)[`*"]\s+(?:means|is when|is reported when|is defined as|denotes)\b/i;

/** Every cited `<capability>/<ID>`, with ranges such as `testing/F11–F12` expanded. */
export function cited(text) {
  const ids = new Set();
  for (const m of text.matchAll(/\b([a-z][a-z-]*)\/([A-Z]+)(\d+)(?:[–-]\2?(\d+))?\b/g)) {
    const [, owner, letter, from, to] = m;
    for (let n = Number(from); n <= Number(to ?? from); n++) ids.add(`${owner}/${letter}${n}`);
  }
  return [...ids].sort();
}

/** Every `<capability>/<ID>` a plan document defines: as a bold term, a heading, or a table row's first cell. */
export function defined(text) {
  const ids = new Set();
  for (const m of text.matchAll(/(?:\*\*|^#+\s+|^\|\s*)([a-z][a-z-]*\/[A-Z]+\d+)\b/gm)) ids.add(m[1]);
  return ids;
}

/**
 * packaging/N10: the Requirements in `requirements` (text) cite every meaning another owner
 * holds, define none of Testing's result terms, and cite only IDs that exist. `plans` maps each
 * owner's plan documents (path to text), as they stand on that owner's branch. A citation of an
 * owner none of whose plans is given is unresolved: unknown, never verified.
 */
export function references(requirements, plans) {
  const known = new Set();
  for (const doc of [requirements, ...Object.values(plans)]) for (const id of defined(doc)) known.add(id);
  const owners = new Set([...known].map((id) => id.split("/")[0]));
  const problems = [];
  for (const line of requirements.split(/\r?\n/)) {
    const term = TERMS.exec(line);
    if (term && !/\btesting\/[A-Z]+\d+/.test(line)) problems.push(`it defines ${JSON.stringify(term[1])} itself instead of citing Testing`);
  }
  const unresolved = [];
  for (const id of cited(requirements)) {
    if (known.has(id)) continue;
    if (owners.has(id.split("/")[0])) problems.push(`${id} does not exist in its owner's plan`);
    else unresolved.push(id);
  }
  if (problems.length) return finding("packaging/N10", "failed", problems.join("; "));
  if (unresolved.length) return finding("packaging/N10", "unknown", `the owners' plans are not here to resolve ${unresolved.join(", ")}`);
  return finding("packaging/N10", "verified", "every cited ID exists in its owner's plan, and no Testing term is defined here");
}
