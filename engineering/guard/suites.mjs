// Guard's test suites, declared by the realization they verify (guard/C129). Each of Guard's three Test
// Plans declares its suites in a table between `<!-- suites -->` and `<!-- end of suites -->`: the
// Embedded Tests in the package's docs/testing.md, the Engineering Tests in engineering/guard/testing.md
// and the External Tests in engineering/guard/external/testing.md. A suite names its owner, its files
// and the hosts it runs on; a host left out names why. guard/T134 reads them with this module and
// refuses a Guard test file no suite holds, and a declared suite that no lane runs on a host it
// declares, so a lane cannot be GREEN while a declared Guard case never ran.
//
// Run as a script, it runs every suite declared for this host, one `node --test` per suite, and prints
// one line per suite with its owner, files and outcome. It passes only if every suite passed.
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const PLATFORMS = ["linux", "darwin", "win32"];

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

/** The suites `text` declares: [{ name, owner, files, hosts, why }]. */
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
    .map(([name, owner, files, hosts, why]) => ({
      name: plain(name ?? ""),
      owner: plain(owner ?? ""),
      files: (files ?? "").split(/,\s*/).map(plain).filter(Boolean),
      hosts: (hosts ?? "").split(/,\s*/).map(plain).filter(Boolean),
      why: (why ?? "").trim(),
    }));
}

/** Every suite the three Test Plans declare, each with the plan it is declared in. */
export function declared(root = ROOT) {
  const manifest = JSON.parse(read(root, "packages/kaal-guard/test/verify.json") ?? "{}");
  const shipped = [...new Set((manifest.cases ?? []).map((c) => `packages/kaal-guard/${c.split(" > ")[0]}`))].sort();
  const embedded = { name: "Embedded", owner: "Embedded", files: shipped, hosts: PLATFORMS, why: "", plan: PLANS.Embedded, planOwner: "Embedded" };
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

const HOSTS = { "ubuntu-latest": "linux", "macos-latest": "darwin", "windows-latest": "win32" };

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
 * The lanes in `.github/workflows/`: [{ lane, host, commands }], one per job and host, each command
 * expanded through the root scripts and the checks KAAL declares to Guard.
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
      const fixed = /runs-on:\s*(\S+)/.exec(block)?.[1];
      const matrixOs = [...block.matchAll(/os:\s*([a-z]+-latest)/g)].map((m) => m[1]);
      const hosts = [...new Set((HOSTS[fixed] ? [fixed] : matrixOs).map((o) => HOSTS[o]).filter(Boolean))];
      const listed = /check:\s*\[([^\]]*)\]/.exec(block)?.[1].split(",") ?? [...block.matchAll(/\{\s*check:\s*([^,}\s]+)/g)].map((m) => m[1]);
      const checks = listed.map((c) => c.trim().replace(/^["']|["']$/g, ""));
      const runs = [...block.matchAll(/^\s*- run:\s*(.+)$/gm)].map((m) => m[1].trim());
      const commands = runs.flatMap((r) => (r.includes("${{ matrix.check }}") ? checks.map((c) => r.replace("${{ matrix.check }}", c)) : [r])).flatMap((r) => expand(root, r));
      for (const host of hosts) out.push({ lane: `${f} ${job}`, host, commands });
    }
  }
  return out;
}

/** Whether a lane's `commands` run `file`: named or matched by `node --test`, or by this module's runner. */
export function runs(commands, file, suite) {
  return commands.some((c) => {
    if (/engineering\/guard\/suites\.mjs/.test(c)) return suite !== undefined;
    if (!/\bnode\b.*--test\b/.test(c)) return false;
    return c.split(/\s+/).some((token) => matches(token.replace(/^["']|["']$/g, ""), file));
  });
}

/** The Test Case identifiers each Guard test file registers, from its case titles. */
function cases(root, file) {
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
 * exactly one declared suite, each case is defined in its suite owner's Test Plan, each declared suite
 * runs on every host it declares, and the package's `npm test` runs only the package.
 */
export function audit(root = ROOT, { suites = declared(root), all = files(root), paths = lanes(root) } = {}) {
  const findings = [];
  const byOwner = definitions(root);
  for (const s of suites) {
    if (s.owner !== s.planOwner) findings.push(`${s.plan}: suite ${s.name} is owned by ${s.owner}, not by this plan's owner, ${s.planOwner}`);
    if (s.files.length === 0) findings.push(`${s.plan}: suite ${s.name} names no files`);
    if (s.hosts.length === 0 || s.hosts.some((h) => !PLATFORMS.includes(h))) findings.push(`${s.plan}: suite ${s.name} names hosts that are not Node's: ${s.hosts.join(", ")}`);
    if (s.hosts.length < PLATFORMS.length && !s.why) findings.push(`${s.plan}: suite ${s.name} leaves out ${PLATFORMS.filter((h) => !s.hosts.includes(h)).join(", ")} without saying why`);
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
    for (const host of suite.hosts) {
      if (!paths.some((l) => l.host === host && runs(l.commands, f, suite))) findings.push(`${f}: suite ${suite.name} declares ${host}, and no lane on ${host} runs it`);
    }
  }
  const pkg = JSON.parse(read(root, "packages/kaal-guard/package.json") ?? "{}");
  const test = pkg.scripts?.test ?? "";
  if (/\bnpm\s+(test|run\s+test)\b/.test(test)) findings.push(`packages/kaal-guard/package.json: scripts.test invokes npm test recursively: ${test}`);
  if (/\.\.\/|engineering\//.test(test)) findings.push(`packages/kaal-guard/package.json: scripts.test names a path outside the package: ${test}`);
  return findings;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const host = process.platform;
  let passed = true;
  for (const s of declared()) {
    if (!s.hosts.includes(host)) {
      console.log(`suite: ${s.owner} ${s.name}: not run on ${host}: ${s.why}`);
      continue;
    }
    const targets = files().filter((f) => s.files.some((p) => matches(p, f)));
    // An empty list would make `node --test` find every test in the repository: a suite with no file fails.
    if (!targets.length) {
      passed = false;
      console.log(`suite: ${s.owner} ${s.name}: failed: its files match nothing`);
      continue;
    }
    const r = spawnSync(process.execPath, ["--test", ...targets], { cwd: ROOT, stdio: "inherit" });
    const ok = r.status === 0;
    passed &&= ok;
    console.log(`suite: ${s.owner} ${s.name} (${targets.join(", ")}): ${ok ? "passed" : "failed"}`);
  }
  console.log(`suites: ${passed ? "passed" : "failed"}`);
  process.exit(passed ? 0 : 1);
}
