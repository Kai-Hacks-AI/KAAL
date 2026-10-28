// Capability acceptance, run reusably: each capability's acceptance scenarios
// install the packages it delivers into fresh hosts and observe them from
// outside. Which packages exist, building them and packing each exactly once
// are packaging: the caller does that and hands over a manifest of the packed
// tarballs. Testing discovers the scenarios, runs them in parallel, installs
// only the manifest's bytes, keeps a ledger of every installation, and reads
// that evidence into findings. What each scenario asserts belongs to the
// capability that owns it. Commands, reads and writes go through Hosting.
//
// The run directory holds manifest.json, ledger/ (one record per
// installation) and hosts/ (one fresh directory per installation). A scenario
// learns the run from KAAL_ACCEPTANCE_RUN, which accept() sets.
//
// accept() also observes each test the runner executes, through a reporter of
// Testing's own, and keeps what it observed for kaal-testing/contracts.
import { basename, join, relative, sep } from "node:path";
import { execute, initialize, kind, read, readFile, update } from "kaal-hosting";
import { remember } from "./observed.mjs";

/** Where a capability keeps its acceptance scenarios, under its workspace. */
export const SCENARIOS = join("test", "acceptance");

const RUN = "KAAL_ACCEPTANCE_RUN";
const REPORTER = new URL("./reporter.mjs", import.meta.url).href;
/** The evidence of a scenario that installed nothing: a finding about the scenario, not about the run's provenance. */
const NOTHING_INSTALLED = "installed no packed package";
const json = (value) => Buffer.from(JSON.stringify(value, null, 2));
const hex = (bytes) => Buffer.from(bytes).toString("hex");

/** The SHA-256 of `bytes`, in lowercase hexadecimal. */
export async function sha256(bytes) {
  return hex(await crypto.subtle.digest("SHA-256", bytes));
}

/** npm's integrity of `bytes`: `sha512-` and the base64 SHA-512. */
export async function integrity(bytes) {
  return `sha512-${Buffer.from(await crypto.subtle.digest("SHA-512", bytes)).toString("base64")}`;
}

/**
 * The acceptance scenarios of `workspaces`, an array of { name, location }
 * with absolute locations: every `*.test.mjs` directly in
 * `<location>/test/acceptance/`, sorted. A workspace without that directory
 * has none.
 */
export async function discover(workspaces) {
  const found = [];
  for (const { name, location } of workspaces) {
    const dir = join(location, SCENARIOS);
    if ((await kind(dir)) !== "directory") continue;
    for (const file of Object.keys(await read(dir))) {
      if (!file.includes("/") && file.endsWith(".test.mjs")) found.push({ workspace: name, path: join(dir, file) });
    }
  }
  return found.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}

let installations = 0;

/**
 * Install the run's packed tarballs of `names` into a fresh host of this
 * scenario's own, and record what was consumed. Each tarball is checked to
 * still hold the bytes the manifest records before it is installed. Resolves
 * to the host's path. `offline` installs from the tarballs alone; otherwise
 * registry dependencies may come from npm's cache or the registry.
 */
export async function install(names, { offline = false } = {}) {
  const run = process.env[RUN];
  if (!run) throw new Error(`acceptance scenarios run through kaal-testing/acceptance's accept(), which sets ${RUN}`);
  const manifest = JSON.parse((await readFile(join(run, "manifest.json"))).toString("utf8"));
  const consumed = {};
  const tarballs = [];
  for (const name of names) {
    const packed = manifest[name];
    if (!packed) throw new Error(`${name} was not packed for this run`);
    const hash = await sha256(await readFile(packed.tarball));
    if (hash !== packed.sha256) throw new Error(`${packed.tarball} no longer holds the bytes packed for ${name}`);
    consumed[name] = hash;
    tarballs.push(packed.tarball);
  }
  const id = `${process.pid}-${++installations}`;
  const host = join(run, "hosts", id);
  await initialize(host, { "package.json": json({ name: "fresh-host", version: "1.0.0", private: true }) });
  const env = { ...process.env, npm_config_audit: "false", npm_config_fund: "false" };
  const r = await execute("npm", ["install", offline ? "--offline" : "--prefer-offline", "--no-package-lock", ...tarballs], { cwd: host, env });
  if (r.status !== 0) throw new Error(`npm install ${names.join(" ")} failed (exited ${r.status})\n${r.stderr}`);
  const scenario = process.argv[1] ?? "unknown";
  await update(join(run, "ledger"), () => ({ prefix: id, files: { "record.json": json({ scenario, pid: process.pid, host, consumed }) } }));
  return host;
}

/**
 * Read a run's evidence into findings. `manifest` maps each packed package to
 * { tarball, sha256, integrity }; `scenarios` lists the scenario paths that
 * ran; `records` are the ledger's installations, { scenario, host, consumed };
 * `holds` maps each recorded host to the packages npm records it holds
 * (node_modules/.package-lock.json's `packages`), or to { unreadable } with
 * why it could not be read.
 */
export function findings({ manifest, scenarios, records, holds }) {
  const out = [];
  const failure = (subject, evidence) => out.push({ kind: "verified failure", subject, evidence });
  for (const { scenario, host, consumed } of records) {
    for (const [name, hash] of Object.entries(consumed)) {
      if (!manifest[name]) failure(scenario, `installed ${name}, which this run did not pack`);
      else if (hash !== manifest[name].sha256) failure(scenario, `installed ${name} with bytes other than the packed tarball`);
    }
    const held = holds[host];
    if (!held || held.unreadable) {
      failure(scenario, `npm's record of what ${host} holds could not be read${held?.unreadable ? `: ${held.unreadable}` : ""}`);
      continue;
    }
    for (const [at, entry] of Object.entries(held)) {
      const name = entry.name ?? at.split("node_modules/").pop();
      if (manifest[name] && entry.integrity !== manifest[name].integrity) failure(scenario, `${host} holds ${name} from ${entry.resolved ?? "elsewhere"}, not the packed tarball`);
    }
  }
  const hosts = records.map((r) => r.host);
  for (const host of new Set(hosts)) {
    if (hosts.filter((h) => h === host).length > 1) failure(host, "more than one installation shared this host");
  }
  for (const scenario of scenarios) {
    if (!records.some((r) => r.scenario === scenario)) failure(scenario, NOTHING_INSTALLED);
  }
  if (records.length > 0) {
    out.push({
      kind: "unknown",
      subject: "installation hosts",
      evidence: `whether the ${new Set(hosts).size} hosts lie physically outside the repository is not verified: Hosting offers no portable containment contract yet`,
    });
  }
  out.push({ kind: "unknown", subject: "unrecorded installations", evidence: "an installation a scenario makes without install() is not recorded, so its absence is not proven" });
  return out;
}

/**
 * Run `scenarios` (paths, as discover() finds them) in parallel against the
 * packed tarballs in `manifest`, from `cwd`, with `run` as this run's
 * directory: it must be missing or empty. Resolves to { passed, runner,
 * records, findings, tests, manifest }:
 * - `runner` is the test runner's own { status, stdout, stderr }. Its stdout
 *   carries Testing's observation, so `stdout` is empty and the spec report
 *   is in `stderr`;
 * - `findings` are read from the ledger, with a failed runner added as a
 *   verified failure;
 * - `passed` is true only when there is no verified failure, so a runner that
 *   exits 0 does not pass a run whose evidence fails. Unknowns stay visible
 *   in `findings` and do not decide `passed`: a gate that treats them as
 *   failures says so itself;
 * - `tests` lists each test the runner executed, as Testing's reporter
 *   observed it: { file, sha256, test, outcome }, with `file` relative to
 *   `cwd` and `/`-separated, `sha256` the file's bytes as run, `test` its full
 *   suite path and `outcome` pass, fail, skip or todo;
 * - `manifest` is the manifest the run used.
 * Only the object returned here is an observed run for
 * kaal-testing/contracts, and only as it was returned: what it observed lives
 * only in this process.
 * An empty `scenarios` is refused before anything is written or run, because
 * the runner given no files would discover tests of its own.
 */
export async function accept({ manifest, scenarios, run, cwd }) {
  if (scenarios.length === 0) throw new Error("no acceptance scenarios to run: accept() needs at least one, and runs nothing it was not given");
  await initialize(run, { "manifest.json": json(manifest) });
  await initialize(join(run, "ledger"), {});
  await initialize(join(run, "hosts"), {});
  // A run started from inside a test must still be a run of its own, not
  // report into the enclosing test runner.
  const { NODE_TEST_CONTEXT, ...env } = process.env;
  const repo = (p) => relative(cwd, p).split(sep).join("/");
  const ran = {};
  for (const scenario of scenarios) ran[repo(scenario)] = await sha256(await readFile(scenario));
  // Testing's reporter writes to the runner's own stdout, a channel no
  // scenario writes to: a scenario's output reaches the runner as events, and
  // a file under the run directory could be replaced by any scenario. The
  // spec report goes to stderr.
  const reporters = ["--test-reporter=spec", "--test-reporter-destination=stderr", `--test-reporter=${REPORTER}`, "--test-reporter-destination=stdout"];
  const r = await execute(process.execPath, ["--test", ...reporters, ...scenarios], { cwd, env: { ...env, [RUN]: run } });
  const ledger = await read(join(run, "ledger"));
  const records = Object.keys(ledger)
    .sort()
    .map((p) => JSON.parse(ledger[p].toString("utf8")));
  const holds = {};
  for (const { host } of records) {
    try {
      holds[host] = JSON.parse((await readFile(join(host, "node_modules", ".package-lock.json"))).toString("utf8")).packages;
    } catch (e) {
      holds[host] = { unreadable: e.message };
    }
  }
  const found = findings({ manifest, scenarios, records, holds });
  // The bytes hashed before the run are the bytes that ran only if they never
  // changed during it, so each scenario is hashed again afterwards. A change
  // the run cannot see, such as one undone before it ends, is outside what
  // this shows: scenarios run as the same user as the run.
  for (const scenario of scenarios) {
    const now = await sha256(await readFile(scenario).catch(() => Buffer.alloc(0)));
    if (now === ran[repo(scenario)]) continue;
    found.push({ kind: "verified failure", subject: scenario, evidence: "its bytes changed during the run, so which bytes ran is not known" });
    ran[repo(scenario)] = null;
  }
  const provenance = found.filter((f) => f.kind === "verified failure" && f.evidence !== NOTHING_INSTALLED);
  if (r.status !== 0) found.unshift({ kind: "verified failure", subject: scenarios.map((s) => basename(s)).join(", "), evidence: `the scenarios failed (node --test exited ${r.status})` });
  const tests = observed(r.stdout, repo, ran);
  const result = {
    passed: !found.some((f) => f.kind === "verified failure"),
    runner: { status: r.status, stdout: "", stderr: r.stderr },
    records,
    findings: found,
    tests,
    manifest,
  };
  const installed = [...new Set(records.map((rec) => repo(rec.scenario)))];
  remember(result, { tests, installed, provenance });
  return result;
}

/**
 * The tests the reporter saw end, read from its lines in the runner's stdout, `text`: each
 * with its scenario's path relative to the run's `cwd` (`repo`), the bytes
 * that scenario had when the run started (`ran`), its suite path and its
 * outcome. A test declared in a file that is not one of the scenarios is
 * left out, though a suite it declares still names the tests beneath it, and
 * everything is left out when the reporter wrote nothing.
 */
function observed(text, repo, ran) {
  // The runner reports each scenario's events together, so one ancestry serves
  // them all. A suite a helper module declares is reported under the helper's
  // file, so ancestry is kept before any file is filtered out.
  const path = [];
  const tests = [];
  for (const line of text.split("\n").filter(Boolean)) {
    const event = JSON.parse(line);
    if (event.start) {
      path.length = event.nesting;
      path[event.nesting] = event.name;
      continue;
    }
    if (typeof event.file !== "string") continue;
    const file = repo(event.file);
    if (!(file in ran)) continue;
    tests.push({ file, sha256: ran[file], test: [...path.slice(0, event.nesting), event.name], outcome: event.outcome });
  }
  return tests;
}
