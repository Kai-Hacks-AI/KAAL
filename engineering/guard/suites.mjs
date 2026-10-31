// Guard's test suites, declared by the realization they verify (guard/C129). Each of Guard's three Test
// Plans declares its suites in a table between `<!-- suites -->` and `<!-- end of suites -->`: the
// Embedded Tests in the package's docs/testing.md, the Engineering Tests in engineering/guard/testing.md
// and the External Tests in engineering/guard/external/testing.md. A suite names its owner, its files and
// its prerequisites, and never a host: every suite is expected on every supported host, and whether a case
// cannot apply on a host is Hosting's to say (guard/C118, revision 3).
//
// Four states are kept apart (guard/C129, revision 3). Declared: a case in its owner's Test Plan.
// Scheduled: a lane invokes the suite that holds it, which guard/T134 checks statically from the
// workflows. Executed, and its outcome: read only from a run record, which this module writes from the
// test runner's own report, one per host and candidate. guard/T137 checks the record and the release gate.
//
// Run as a script, it runs every declared suite on this host and writes the run record (`--record
// <path>`). A suite whose prerequisite the lane did not provide is not run, naming what is missing. It
// exits 0 only if every declared case passed or is not applicable by a Hosting rule, 1 if any failed,
// and 2 if any was not run. With `--gate <candidate> --hosts <h,...> <record>...` it judges a release's
// records instead (gate()).
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

/**
 * Each realization's Test Plan, by owner. The Embedded suite is the package's own: its manifest,
 * test/verify.json, lists every case it ships and `npm test` runs exactly those, so it is read from
 * there and declared in no table, and this Change touches no package file.
 */
export const PLANS = {
  Embedded: "packages/kaal-guard/docs/testing.md",
  Engineering: "engineering/guard/testing.md",
  External: "engineering/guard/external/testing.md",
};

/** Where Guard's test files live: every `*.test.mjs` under these must be in a declared suite. */
export const TREES = ["packages/kaal-guard/test", "engineering/guard"];

const read = (root, path) => (existsSync(join(root, path)) ? readFileSync(join(root, path), "utf8") : null);
const plain = (cell) => cell.trim().replace(/^`|`$/g, "");

/** The suites `text` declares: [{ name, owner, files, prerequisites }]. */
export function table(text) {
  if (!text) return [];
  const at = text.indexOf("<!-- suites -->");
  if (at < 0) return [];
  const stop = text.indexOf("<!-- end of suites -->", at);
  return text
    .slice(at, stop < 0 ? undefined : stop)
    .split(/\r?\n/)
    .filter((l) => l.startsWith("| ") && !/^\| -/.test(l))
    .slice(1)
    .map((l) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim()))
    .map(([name, owner, files, prerequisites]) => ({
      name: plain(name ?? ""),
      owner: plain(owner ?? ""),
      files: (files ?? "").split(/,\s*/).map(plain).filter(Boolean),
      prerequisites: (prerequisites ?? "").split(/,\s*/).map(plain).filter((p) => p && p !== "none"),
    }));
}

/** Every suite the three Test Plans declare, each with the plan it is declared in. */
export function declared(root = ROOT) {
  const manifest = JSON.parse(read(root, "packages/kaal-guard/test/verify.json") ?? "{}");
  const shipped = [...new Set((manifest.cases ?? []).map((c) => `packages/kaal-guard/${c.split(" > ")[0]}`))].sort();
  const embedded = { name: "Embedded", owner: "Embedded", files: shipped, prerequisites: [], plan: PLANS.Embedded, planOwner: "Embedded" };
  return [
    ...(shipped.length ? [embedded] : []),
    ...Object.entries(PLANS)
      .filter(([owner]) => owner !== "Embedded")
      .flatMap(([owner, plan]) => table(read(root, plan)).map((s) => ({ ...s, plan, planOwner: owner }))),
  ];
}

/** Whether `pattern`, a repository path where `*` stands for any name within one directory, names `path`. */
export function matches(pattern, path) {
  const re = new RegExp(`^${pattern.split("*").map((p) => p.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join("[^/]*")}$`);
  return re.test(path);
}

/** Every Guard test file in the repository, repository-relative. */
export function files(root = ROOT) {
  const out = [];
  const walk = (dir) => {
    if (!existsSync(dir)) return;
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name === "node_modules" || e.name === "fixtures") continue;
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".test.mjs")) out.push(relative(root, p).split("\\").join("/"));
    }
  };
  for (const tree of TREES) walk(join(root, tree));
  return out.sort();
}

/** The commands a check KAAL declares to Guard runs. */
function check(root, name) {
  const text = read(root, `.kaal/config/guard/${name}.md`);
  const m = text && /^command:\s*(.+)$/m.exec(text);
  return m ? [m[1].trim()] : [];
}

/** `command`, with each `npm run <script>` and each Guard check expanded to what it runs. */
function expand(root, command, seen = new Set()) {
  const scripts = JSON.parse(read(root, "package.json") ?? "{}").scripts ?? {};
  return command.split(/\s*&&\s*/).flatMap((part) => {
    const script = /^npm run (\S+)/.exec(part);
    if (script && scripts[script[1]] !== undefined && !seen.has(script[1])) return [part, ...expand(root, scripts[script[1]], new Set([...seen, script[1]]))];
    const guard = /kaal-guard run --check (\S+)/.exec(part);
    if (guard) return [part, ...check(root, guard[1]).flatMap((c) => expand(root, c, seen))];
    return [part];
  });
}

/**
 * The lanes in `.github/workflows/`: [{ lane, commands }], one per job, each command expanded through the
 * root scripts and the checks KAAL declares to Guard. Which hosts a lane runs on is not read here: what ran
 * on each host is the run record's to show.
 */
export function lanes(root = ROOT) {
  const dir = join(root, ".github", "workflows");
  if (!existsSync(dir)) return [];
  const out = [];
  for (const f of readdirSync(dir).filter((f) => /\.ya?ml$/.test(f))) {
    const text = readFileSync(join(dir, f), "utf8");
    const body = text.split(/^jobs:\s*$/m)[1] ?? "";
    for (const block of body.split(/^(?=  [A-Za-z0-9_-]+:\s*$)/m).filter((b) => /^  [A-Za-z0-9_-]+:/.test(b))) {
      const job = /^  ([A-Za-z0-9_-]+):/.exec(block)[1];
      const listed = /check:\s*\[([^\]]*)\]/.exec(block)?.[1].split(",") ?? [...block.matchAll(/\{\s*check:\s*([^,}\s]+)/g)].map((m) => m[1]);
      const checks = listed.map((c) => c.trim().replace(/^["']|["']$/g, ""));
      // A step's run key may follow other keys (`- shell: bash` then `run:`).
      const runs = [...block.matchAll(/^\s*(?:- )?run:\s*(.+)$/gm)].map((m) => m[1].trim());
      const commands = runs.flatMap((r) => (r.includes("${{ matrix.check }}") ? checks.map((c) => r.replace("${{ matrix.check }}", c)) : [r])).flatMap((r) => expand(root, r));
      out.push({ lane: `${f} ${job}`, commands });
    }
  }
  return out;
}

/** Whether a lane's `commands` run `file`: named or matched by `node --test`, or by this module's runner. */
export function runs(commands, file, suite) {
  return commands.some((c) => {
    // The runner schedules every suite; its gate only judges records and runs none.
    if (/engineering\/guard\/suites\.mjs/.test(c)) return suite !== undefined && !/\s--gate\b/.test(c);
    if (!/\bnode\b.*--test\b/.test(c)) return false;
    return c.split(/\s+/).some((token) => matches(token.replace(/^["']|["']$/g, ""), file));
  });
}

/** The Test Case identifiers each Guard test file registers, from its case titles. */
export function cases(root, file) {
  const text = read(root, file) ?? "";
  return [...text.matchAll(/^\s*(?:it|test)\(\s*"(guard\/T\d+)\b/gm)].map((m) => m[1]);
}

/** The Test Cases a Test Plan's text defines: each table row that opens with one, or with a range. */
export function defined(text) {
  const ids = new Set();
  for (const m of (text ?? "").matchAll(/^\| guard\/T(\d+)(?:–guard\/T(\d+))?(?::| \|)/gm)) {
    for (let n = Number(m[1]); n <= Number(m[2] ?? m[1]); n++) ids.add(`guard/T${n}`);
  }
  return ids;
}

/** The Test Cases each owner defines. The package's are the titles its manifest ships. */
function definitions(root) {
  const manifest = JSON.parse(read(root, "packages/kaal-guard/test/verify.json") ?? "{}");
  const embedded = new Set((manifest.cases ?? []).flatMap((c) => [.../\b(guard\/T\d+)\b/.exec(c.split(" > ").at(-1)) ?? []].slice(1)));
  return { Embedded: embedded, Engineering: defined(read(root, PLANS.Engineering)), External: defined(read(root, PLANS.External)) };
}

/**
 * Every finding against the placement rule (guard/C129). An empty list means each Guard test file is in
 * exactly one declared suite, each case is defined in its suite owner's Test Plan, each declared suite is
 * scheduled by some lane, and the package's `npm test` runs only the package. It is scheduling evidence
 * only: that a case executed, and how, is the run record's.
 */
export function audit(root = ROOT, { suites = declared(root), all = files(root), paths = lanes(root) } = {}) {
  const findings = [];
  const byOwner = definitions(root);
  for (const s of suites) {
    if (s.owner !== s.planOwner) findings.push(`${s.plan}: suite ${s.name} is owned by ${s.owner}, not by this plan's owner, ${s.planOwner}`);
    if (s.files.length === 0) findings.push(`${s.plan}: suite ${s.name} names no files`);
    for (const p of s.prerequisites) if (!PREREQUISITES[p]) findings.push(`${s.plan}: suite ${s.name} names an unknown prerequisite: ${p}`);
    for (const pattern of s.files) if (!all.some((f) => matches(pattern, f))) findings.push(`${s.plan}: suite ${s.name} names ${pattern}, which holds no test file`);
  }
  for (const f of all) {
    const holders = suites.filter((s) => s.files.some((p) => matches(p, f)));
    if (holders.length === 0) {
      findings.push(`${f}: no declared suite holds this test file, so no lane is required to run it`);
      continue;
    }
    if (holders.length > 1) findings.push(`${f}: held by more than one suite: ${holders.map((s) => s.name).join(", ")}`);
    const [suite] = holders;
    for (const id of cases(root, f)) {
      const owners = Object.entries(byOwner).filter(([, ids]) => ids.has(id)).map(([o]) => o);
      if (!owners.includes(suite.owner)) findings.push(`${f}: ${id} is in ${suite.owner}'s suite ${suite.name}, but ${owners.length ? `${owners.join(" and ")} define${owners.length === 1 ? "s" : ""} it` : "no Test Plan defines it"}`);
      else if (owners.length > 1) findings.push(`${f}: ${id} is defined in more than one Test Plan: ${owners.join(", ")}`);
    }
    if (!paths.some((l) => runs(l.commands, f, suite))) findings.push(`${f}: suite ${suite.name} is scheduled by no lane`);
  }
  const pkg = JSON.parse(read(root, "packages/kaal-guard/package.json") ?? "{}");
  const test = pkg.scripts?.test ?? "";
  if (/\bnpm\s+(test|run\s+test)\b/.test(test)) findings.push(`packages/kaal-guard/package.json: scripts.test invokes npm test recursively: ${test}`);
  if (/\.\.\/|engineering\//.test(test)) findings.push(`packages/kaal-guard/package.json: scripts.test names a path outside the package: ${test}`);
  return findings;
}

/**
 * What a suite may need from its lane, each with how this module finds whether the lane provided it. A
 * missing prerequisite makes its suite not run on that host: a CI limitation, never not applicable.
 */
export const PREREQUISITES = {
  workspace: { what: "KAAL's workspace installed and built (`npm ci`, `npm run build`)", provided: (root) => existsSync(join(root, "node_modules", ".package-lock.json")) && existsSync(join(root, "packages", "kaal-core", "dist")) },
  registry: { what: "the npm registry reachable", provided: (root) => spawnSync("npm view @kaihacksai/kaal-guard version --silent", { cwd: root, shell: true, encoding: "utf8", timeout: 60_000 }).status === 0 },
};

/** A not-applicable outcome must cite the Hosting rule it rests on (hosting/F39). */
const HOSTING_RULE = /\bnot applicable\b.*\bkaal-hosting\/[a-z0-9-]+/i;

/**
 * The cases a suite declares: for the Embedded suite each title its manifest ships; for the others each
 * Test Case identifier its owner defines and its files register. Each with how a report line is matched.
 */
export function expected(root, suite, targets) {
  if (suite.owner === "Embedded") {
    const manifest = JSON.parse(read(root, "packages/kaal-guard/test/verify.json") ?? "{}");
    return (manifest.cases ?? []).map((c) => ({ case: c, file: `packages/kaal-guard/${c.split(" > ")[0]}`, key: c.split(" > ").slice(1).join(" > ") }));
  }
  const own = definitions(root)[suite.owner] ?? new Set();
  return targets.flatMap((f) => cases(root, f).filter((id) => own.has(id)).map((id) => ({ case: id, file: f, id })));
}

/** Minutes one suite's run may take before it is stopped (GUARD_SUITE_MINUTES, default 40). */
const LIMIT = Number(process.env.GUARD_SUITE_MINUTES) || 40;

/** A case the runner never reported, when the run was stopped, is not run for that reason. */
const late = (o, cut) => (cut && o.outcome === "not run" && o.reason === "the runner reported no execution of this case" ? { outcome: "not run", reason: cut } : o);

/** The environment for a suite's run: a run inside another test run still reports to its own reporters. */
function runner() {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  return env;
}

/** The outcome of one declared case from the runner's report lines. */
function outcome(declaredCase, lines) {
  const hit = lines.filter((l) => l.file === declaredCase.file && (declaredCase.id ? new RegExp(`^${declaredCase.id}(?!\\d)`).test(l.path.at(-1)) : l.path.join(" > ") === declaredCase.key));
  if (hit.length === 0) return { outcome: "not run", reason: "the runner reported no execution of this case" };
  if (hit.some((l) => l.ended === "fail")) return { outcome: "failed", reason: hit.find((l) => l.ended === "fail").note };
  if (hit.every((l) => l.ended === "pass")) return { outcome: "passed" };
  const other = hit.find((l) => l.ended !== "pass");
  if (other.ended === "skip" && HOSTING_RULE.test(other.note)) return { outcome: "not applicable", reason: other.note };
  return { outcome: "not run", reason: `${other.ended === "todo" ? "marked todo" : "skipped"}${other.note ? `: ${other.note}` : ""}, with no Hosting rule` };
}

/**
 * Runs every declared suite on this host and returns its run record: the candidate, the host, each suite
 * and each declared case with one outcome, from the runner's own report.
 */
export function execute(root = ROOT, { suites = declared(root), all = files(root), candidate, host = process.platform } = {}) {
  const head = candidate ?? spawnSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).stdout.trim();
  const record = { candidate: head, host, node: process.version, suites: [], cases: [] };
  for (const s of suites) {
    const targets = all.filter((f) => s.files.some((p) => matches(p, f)));
    const declaredCases = expected(root, s, targets);
    const missing = s.prerequisites.filter((p) => !PREREQUISITES[p]?.provided(root));
    let lines = [];
    let cut = "";
    let broke = "";
    // The runner reports real paths; a root under a symbolic link (macOS's /var is /private/var) must match them.
    const real = realpathSync(root);
    // An empty list would make `node --test` find every test in the repository: such a suite is not run.
    const why = missing.length ? `the lane did not provide ${missing.map((p) => PREREQUISITES[p]?.what ?? p).join(" and ")}` : targets.length ? "" : "its files match nothing";
    if (!why) {
      const r = spawnSync(process.execPath, ["--test", "--test-reporter=spec", "--test-reporter-destination=stderr", `--test-reporter=${pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), "reporter.mjs")).href}`, "--test-reporter-destination=stdout", ...targets], { cwd: root, env: runner(), encoding: "utf8", stdio: ["ignore", "pipe", "inherit"], maxBuffer: 256 * 1024 * 1024, timeout: LIMIT * 60_000, killSignal: "SIGKILL" });
      // A runner that never ends must not hold the lane: what it reported stands, the rest is not run.
      if (r.error?.code === "ETIMEDOUT") cut = `the runner did not end within ${LIMIT} minutes and was stopped`;
      // A file can fail outside any declared case (a crash, an undeclared test): the suite is not passed then.
      else if (r.status !== 0) broke = `the runner exited ${r.status ?? r.signal} outside any declared case's outcome`;
      lines = (r.stdout ?? "").split("\n").filter(Boolean).map((l) => JSON.parse(l)).map((l) => ({ ...l, file: relative(real, realpathSync(l.file)).split("\\").join("/") }));
    }
    const results = declaredCases.map((c) => ({ case: c.case, owner: s.owner, suite: s.name, file: c.file, ...(why ? { outcome: "not run", reason: why } : late(outcome(c, lines), cut)) }));
    const failed = results.some((c) => c.outcome === "failed");
    const status = why ? "not run" : failed || broke ? "failed" : cut || results.some((c) => c.outcome === "not run") ? "not run" : "passed";
    const reason = why || (!failed && (broke || cut)) || "";
    record.suites.push({ owner: s.owner, name: s.name, files: targets, prerequisites: s.prerequisites, status, ...(reason ? { reason } : {}) });
    record.cases.push(...results);
  }
  return record;
}

/**
 * Every finding against a run record (guard/T137). An empty list means each declared case has exactly one
 * outcome, a suite counted passed holds no case that did not pass or apply, not applicable cites a Hosting
 * rule, not run says why, and the record names no case its Test Plans do not declare.
 */
export function validate(record, root = ROOT, suites = declared(root)) {
  const findings = [];
  const all = files(root);
  const want = suites.flatMap((s) => expected(root, s, all.filter((f) => s.files.some((p) => matches(p, f)))).map((c) => `${s.name}|${c.case}`));
  const got = (record.cases ?? []).map((c) => `${c.suite}|${c.case}`);
  for (const w of want) {
    const n = got.filter((g) => g === w).length;
    if (n === 0) findings.push(`${w.split("|")[1]}: declared in suite ${w.split("|")[0]}, and the record gives it no outcome`);
    if (n > 1) findings.push(`${w.split("|")[1]}: the record gives it ${n} outcomes`);
  }
  for (const g of new Set(got)) if (!want.includes(g)) findings.push(`${g.split("|")[1]}: in the record under suite ${g.split("|")[0]}, which declares no such case`);
  for (const c of record.cases ?? []) {
    if (!["passed", "failed", "not applicable", "not run"].includes(c.outcome)) findings.push(`${c.case}: unknown outcome ${c.outcome}`);
    if (c.outcome === "not applicable" && !HOSTING_RULE.test(c.reason ?? "")) findings.push(`${c.case}: not applicable without a Hosting rule`);
    if (c.outcome === "not run" && !c.reason) findings.push(`${c.case}: not run without a reason`);
  }
  for (const s of record.suites ?? []) {
    const bad = (record.cases ?? []).filter((c) => c.suite === s.name && !["passed", "not applicable"].includes(c.outcome));
    if (s.status === "passed" && bad.length) findings.push(`suite ${s.name}: counted passed while ${bad.map((c) => `${c.case} is ${c.outcome}`).join(", ")}`);
  }
  if (!record.candidate) findings.push("the record names no candidate");
  if (!record.host) findings.push("the record names no host");
  return findings;
}

/**
 * Every finding against a release's run records (guard/C126, guard/C125): exactly one record per supported
 * host, each for `candidate`, each valid, with the same declared cases everywhere, every case passed or
 * not applicable by a Hosting rule, and none not applicable on every host. `hosts` is the release's list
 * of supported hosts, given by the caller. The cross-host comparison follows Testing's parity (testing/C31).
 */
export function gate(records, { candidate, hosts }, root = ROOT) {
  const findings = [];
  for (const r of records) {
    if (!hosts.includes(r.host)) findings.push(`a record for ${r.host}, which is not a supported host of this release`);
    if (r.candidate !== candidate) findings.push(`the ${r.host} record is for ${r.candidate}, not the candidate ${candidate}: stale or mismatched`);
    for (const f of validate(r, root)) findings.push(`${r.host}: ${f}`);
    for (const x of r.suites ?? []) if (x.status !== "passed") findings.push(`suite ${x.name}: ${x.status} on ${r.host}${x.reason ? `: ${x.reason}` : ""}`);
  }
  for (const h of hosts) {
    const n = records.filter((r) => r.host === h).length;
    if (n === 0) findings.push(`no run record for ${h}`);
    if (n > 1) findings.push(`${n} run records for ${h}`);
  }
  const sets = records.map((r) => new Set((r.cases ?? []).map((c) => c.case)));
  const union = new Set(sets.flatMap((s) => [...s]));
  for (const id of union) {
    const absent = records.filter((r, i) => !sets[i].has(id)).map((r) => r.host);
    if (absent.length) findings.push(`${id}: declared on some hosts but not on ${absent.join(", ")}`);
    const outcomes = records.map((r) => (r.cases ?? []).find((c) => c.case === id)).filter(Boolean);
    for (const c of outcomes) {
      if (!["passed", "not applicable"].includes(c.outcome)) findings.push(`${id}: ${c.outcome} on ${records.find((r) => r.cases?.includes(c))?.host}${c.reason ? `: ${c.reason}` : ""}`);
    }
    if (outcomes.length && outcomes.every((c) => c.outcome === "not applicable")) findings.push(`${id}: not applicable on every host, so exercised nowhere`);
  }
  return findings;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const flag = (name) => (args.includes(name) ? args.splice(args.indexOf(name), 2)[1] : undefined);
  const gated = flag("--gate");
  if (gated) {
    const hosts = (flag("--hosts") ?? "").split(",").filter(Boolean);
    const findings = gate(args.map((p) => JSON.parse(readFileSync(p, "utf8"))), { candidate: gated, hosts });
    for (const f of findings) console.log(`gate: ${f}`);
    console.log(`gate: ${findings.length ? "not passed" : "passed"}`);
    process.exit(findings.length ? 1 : 0);
  }
  const path = resolve(flag("--record") ?? join(tmpdir(), `guard-run-record-${process.platform}.json`));
  const record = execute();
  writeFileSync(path, `${JSON.stringify(record, null, 2)}\n`);
  const invalid = validate(record);
  for (const f of invalid) console.log(`record: invalid: ${f}`);
  for (const s of record.suites) console.log(`suite: ${s.owner} ${s.name}: ${s.status}${s.reason ? `: ${s.reason}` : ""}`);
  const count = (o) => record.cases.filter((c) => c.outcome === o).length;
  console.log(`cases: ${record.cases.length} declared, ${count("passed")} passed, ${count("failed")} failed, ${count("not applicable")} not applicable, ${count("not run")} not run`);
  for (const c of record.cases.filter((c) => !["passed", "not applicable"].includes(c.outcome))) console.log(`case: ${c.case} (${c.suite}): ${c.outcome}: ${c.reason}`);
  console.log(`record: ${path} (candidate ${record.candidate}, host ${record.host})`);
  const broken = record.suites.some((s) => s.status === "failed");
  process.exit(count("failed") || broken ? 1 : count("not run") || record.suites.some((s) => s.status === "not run") || invalid.length ? 2 : 0);
}
