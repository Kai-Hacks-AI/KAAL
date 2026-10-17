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
import { basename, join } from "node:path";
import { execute, initialize, kind, read, readFile, update } from "kaal-hosting";

/** Where a capability keeps its acceptance scenarios, under its workspace. */
export const SCENARIOS = join("test", "acceptance");

const RUN = "KAAL_ACCEPTANCE_RUN";
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
    if (!records.some((r) => r.scenario === scenario)) failure(scenario, "installed no packed package");
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
 * directory: it must be missing or empty. Resolves to the scenarios' exit
 * status and output, the ledger's records and the findings read from them. A
 * scenario run that fails is itself a verified failure.
 */
export async function accept({ manifest, scenarios, run, cwd }) {
  await initialize(run, { "manifest.json": json(manifest) });
  await initialize(join(run, "ledger"), {});
  await initialize(join(run, "hosts"), {});
  // A run started from inside a test must still be a run of its own, not
  // report into the enclosing test runner.
  const { NODE_TEST_CONTEXT, ...env } = process.env;
  const r = await execute(process.execPath, ["--test", ...scenarios], { cwd, env: { ...env, [RUN]: run } });
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
  if (r.status !== 0) found.unshift({ kind: "verified failure", subject: scenarios.map((s) => basename(s)).join(", "), evidence: `the scenarios failed (node --test exited ${r.status})` });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr, records, findings: found };
}
