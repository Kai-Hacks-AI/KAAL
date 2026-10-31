// packaging/C8 planned tests (plan/capability/testing.md), written at the start of packaging/C9.
// Each title names the Requirements it checks.
//
// packaging/T27 and T29 pack kaal-packaging, Hosting and Foundation from this workspace and install
// the three tarballs into a fresh consumer. Every process here starts through Hosting's `execute`,
// and npm is handed in as npm's own script under this Node (packaging/A13): no case knows the
// operating system (packaging/N11).
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { before, describe, it } from "node:test";
import { execute } from "kaal-hosting";

const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const ROOT = join(PACKAGE, "..", "..");
const SCRATCH = mkdtempSync(join(tmpdir(), "kaal-packaging-capability-"));
let made = 0;
const fresh = (name) => {
  const dir = join(SCRATCH, `${name}-${++made}`);
  mkdirSync(dir, { recursive: true });
  return dir;
};
/** npm, as npm's own script when npm started this run, else npm by name through Hosting. */
const NPM = process.env.npm_execpath || undefined;
const ENV = { ...process.env, npm_config_cache: join(SCRATCH, "cache"), npm_config_userconfig: join(SCRATCH, "npmrc"), npm_config_update_notifier: "false", npm_config_audit: "false", npm_config_fund: "false", npm_config_logs_max: "0" };
writeFileSync(join(SCRATCH, "npmrc"), "");
async function npm(args, cwd, env = ENV) {
  const r = await execute(NPM ? process.execPath : "npm", NPM ? [NPM, ...args] : args, { cwd, env });
  if (r.status !== 0) throw new Error(`npm ${args.join(" ")} exited ${r.status}: ${r.stderr.slice(-2000)}`);
  return r.stdout;
}
const BIN = join(PACKAGE, "bin", "kaal-packaging.mjs");
/** The command, run as a consumer runs it: by Node, with npm naming its own script. */
const command = (args, cwd) => execute(process.execPath, [BIN, ...args], { cwd, env: { ...ENV, ...(NPM ? { npm_execpath: NPM } : {}) } });
const lastLine = (stdout) => stdout.trim().split(/\r?\n/).at(-1);
const resultOf = (stdout) => {
  const m = /^kaal-packaging (\{.*\})$/.exec(lastLine(stdout));
  assert.ok(m, `the last line is a result line: ${lastLine(stdout)}`);
  return JSON.parse(m[1]);
};

/** Testing's model functions as installed, or null while Testing does not export them (packaging/F13). */
const TESTING = await import("kaal-testing/model").then((m) => (typeof m.check === "function" && typeof m.tested === "function" ? m : null), () => null);

/** Whether every runtime dependency of kaal-packaging installs from the registry at its pinned version. */
async function published(pkg) {
  for (const [name, version] of Object.entries(pkg.dependencies ?? {})) {
    try {
      const out = await npm(["view", `${name}@${version}`, "dist.integrity", "--json"], SCRATCH);
      if (!out.trim()) return false;
    } catch {
      return false;
    }
  }
  return true;
}

/** kaal-packaging packed and installed into a fresh consumer, with its dependencies. */
let installed;
before(async () => {
  const pkg = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
  const out = fresh("packed");
  const pack = async (dir) => join(out, JSON.parse(await npm(["pack", "--json", "--ignore-scripts", "--pack-destination", out], dir))[0].filename);
  const self = await pack(PACKAGE);
  const consumer = fresh("consumer");
  writeFileSync(join(consumer, "package.json"), JSON.stringify({ name: "consumer", version: "1.0.0", private: true }) + "\n");
  const fromRegistry = await published(pkg);
  if (fromRegistry) {
    await npm(["install", self, "--ignore-scripts", "--no-save"], consumer);
  } else {
    // Hosting and Foundation are not yet installable from a registry at the versions kaal-packaging
    // pins. They are installed from this workspace's tarballs, and that install's record of them (a
    // file: resolution) is this test's, not a consumer's: it is removed, so F7 reports the
    // dependencies it cannot see resolved, as unknown (packaging/F19). Once both are on a registry,
    // this branch is not taken and F7 must verify.
    const deps = [await pack(join(ROOT, "packages", "extensions", "kaal-hosting")), await pack(join(ROOT, "packages", "kaal-foundation"))];
    await npm(["install", self, ...deps, "--ignore-scripts", "--no-save", "--no-package-lock"], consumer);
    rmSync(join(consumer, "node_modules", ".package-lock.json"), { force: true });
  }
  installed = { consumer, dir: join(consumer, "node_modules", "kaal-packaging"), fromRegistry };
});

describe("packaging/C9 Packaging as a KAAL package", () => {
  it("packaging/T27 F15: kaal-packaging, packed and installed into a fresh consumer, passes its own conform: every finding verified, apart from those whose prerequisite is not yet met, which are unknown naming it", async () => {
    const { conform } = await import("kaal-packaging/conformance");
    const report = await conform(installed.dir, { consumer: installed.consumer, work: fresh("probe"), testing: TESTING ?? undefined, npm: NPM });
    const by = Object.fromEntries(report.findings.map((f) => [f.requirement, f]));
    // The prerequisites, each lapsing on its own once met: the dependencies on a registry (F7), and
    // Testing's model functions exported where kaal-packaging is installed (F13).
    const allowed = {
      ...(installed.fromRegistry ? {} : { "packaging/F7": /records no resolution for @kaihacksai\/kaal-foundation, kaal-hosting/ }),
      ...(TESTING ? {} : { "packaging/F13": /no Testing model functions \(check and tested, testing\/F25\) were given/ }),
    };
    for (const f of report.findings) {
      if (f.requirement in allowed) {
        assert.equal(f.result, "unknown", `${f.requirement}: ${f.cause}`);
        assert.match(f.cause, allowed[f.requirement]);
      } else {
        assert.equal(f.result, "verified", `${f.requirement}: ${f.cause}`);
      }
    }
    assert.match(by["packaging/F8"].cause, /6 documents shipped/);
    assert.match(by["packaging/F11"].cause, /each of the 6 declared cases ran exactly once/);
    assert.match(by["packaging/N9"].cause, /no longer reports verified/);
    assert.deepEqual(report.reported, { result: "verified", exit: 0, causes: [] });
    assert.equal(report.result, Object.keys(allowed).length ? "unknown" : "verified");
  });

  it("packaging/T28 F15: the source npm test follows the declared plan, and the installed one runs test:embedded only", async () => {
    const pkg = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
    assert.deepEqual(Object.keys(pkg.scripts).filter((s) => s.startsWith("test:")).sort(), ["test:embedded", "test:publisher"]);
    assert.ok(!pkg.files.some((f) => f === "test" || f.startsWith("test/publisher") || f.startsWith("test/plan")), "the publisher's suites do not ship");

    // Installed: the publisher's suites are absent, so npm test ends on the Embedded verification alone.
    const run = await execute(NPM ? process.execPath : "npm", [...(NPM ? [NPM] : []), "test", "--silent"], { cwd: installed.dir, env: ENV });
    assert.equal(run.status, 0, run.stdout + run.stderr);
    assert.match(run.stdout, /the publisher's suites do not ship/);
    assert.doesNotMatch(run.stdout, /kaal-packaging-publisher/);
    assert.match(lastLine(run.stdout), /^kaal-packaging-verification \{"result":"verified"/);
    assert.ok(!existsSync(join(installed.dir, "test", "publisher")));

    // Source: the same declared plan, decided by packaging/F14, on a copy of the workspace whose
    // publisher suite is one passing case (the real one is this file, which must not run itself).
    const { conformSource } = await import("kaal-packaging/conformance");
    // The copy sits in the consumer, so its imports resolve to what the consumer installed.
    const copy = join(installed.consumer, "source-copy");
    const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));
    for (const f of walk(installed.dir)) {
      const to = join(copy, relative(installed.dir, f));
      mkdirSync(dirname(to), { recursive: true });
      writeFileSync(to, readFileSync(f));
    }
    mkdirSync(join(copy, "test", "publisher"));
    writeFileSync(join(copy, "test", "publisher", "one.test.mjs"), 'import { it } from "node:test";\nit("passes", () => {});\n');
    const source = await conformSource(copy, { env: ENV, npm: NPM });
    assert.equal(source.requirement, "packaging/F14");
    assert.equal(source.result, "verified", source.cause);
    assert.match(source.cause, /runs test:publisher, test:embedded of the declared test:embedded, test:publisher, and reported verified/);
  });

  it("packaging/T29 F16, N12: kaal-packaging measure and conform print what the functions return, end on one result line, and exit 0, 1 or 2 by the result", async () => {
    const { read } = await import("kaal-packaging");
    const { conform } = await import("kaal-packaging/conformance");
    const out = fresh("artifact");
    const tgz = join(out, JSON.parse(await npm(["pack", "--json", "--ignore-scripts", "--pack-destination", out], join(ROOT, "packages", "kaal-foundation")))[0].filename);

    const measured = await command(["measure", tgz], fresh("cwd"));
    assert.equal(measured.status, 0, measured.stdout + measured.stderr);
    assert.deepEqual(resultOf(measured.stdout), { result: "verified", exit: 0, causes: [] });
    const record = read(measured.stdout.slice(0, measured.stdout.lastIndexOf("kaal-packaging {")));
    assert.equal(record.package.name, "@kaihacksai/kaal-foundation");

    const refused = await command(["measure", join(out, "absent.tgz")], fresh("cwd"));
    assert.equal(refused.status, 2);
    assert.equal(resultOf(refused.stdout).result, "unknown");
    for (const bad of [[], ["pack"], ["measure"], ["measure", tgz, "--nope", "x"], ["conform"]]) {
      const r = await command(bad, fresh("cwd"));
      assert.equal(r.status, 2, `${bad.join(" ")}: ${r.stdout}`);
      assert.equal(resultOf(r.stdout).result, "unknown");
    }

    // conform prints each finding as the function returns it, and exits by the overall result.
    const work = fresh("probe");
    const conformed = await command(["conform", installed.dir, "--consumer", installed.consumer, "--work", work], fresh("cwd"));
    const direct = await conform(installed.dir, { consumer: installed.consumer, work: fresh("probe"), testing: TESTING ?? undefined, npm: NPM });
    const line = resultOf(conformed.stdout);
    assert.equal(line.result, direct.result);
    assert.equal(conformed.status, { verified: 0, failed: 1, unknown: 2 }[direct.result]);
    for (const f of direct.findings) assert.ok(conformed.stdout.includes(`${f.result} ${f.requirement}: `), f.requirement);
    const open = direct.findings.filter((f) => f.result !== "verified").map((f) => f.requirement);
    assert.deepEqual(line.causes.map((c) => c.split(":")[0]), open, "the result line carries each finding that is not verified, with its cause");

    // A failed package: no documents, no npm test. The command reports failed and exits 1, never 0.
    const bare = fresh("bare");
    writeFileSync(join(bare, "package.json"), JSON.stringify({ name: "kaal-bare", version: "1.0.0", engines: { node: ">=24" } }) + "\n");
    writeFileSync(join(bare, "index.mjs"), "export const x = 1;\n");
    const barePacked = fresh("bare-packed");
    const bareTgz = join(barePacked, JSON.parse(await npm(["pack", "--json", "--ignore-scripts", "--pack-destination", barePacked], bare))[0].filename);
    const bareConsumer = fresh("bare-consumer");
    writeFileSync(join(bareConsumer, "package.json"), JSON.stringify({ name: "consumer", version: "1.0.0", private: true }) + "\n");
    await npm(["install", bareTgz, "--ignore-scripts", "--no-save", "--offline"], bareConsumer);
    const failed = await command(["conform", join(bareConsumer, "node_modules", "kaal-bare"), "--work", fresh("probe")], fresh("cwd"));
    assert.equal(failed.status, 1, failed.stdout);
    assert.equal(resultOf(failed.stdout).result, "failed");
    assert.match(failed.stdout, /^failed packaging\/F8: /m);
  });

  it("packaging/T30 F17: the shipped skill is in the shared skill format, names both commands, cites only Packaging IDs that exist, and leaves Testing's result terms to Testing", () => {
    const text = readFileSync(join(PACKAGE, "skills", "kaal-packaging", "SKILL.md"), "utf8");
    const front = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(text);
    assert.ok(front, "the skill opens with frontmatter");
    const fields = Object.fromEntries(front[1].split(/\r?\n/).map((l) => /^([a-z-]+):\s*(.*)$/.exec(l)).filter(Boolean).map((m) => [m[1], m[2]]));
    assert.equal(fields.name, "kaal-packaging");
    assert.ok(fields.description && fields.description.length > 40 && fields.description.length <= 1024, "a description says when to use it");
    assert.ok(fields.license, "it names its license");
    assert.match(text, /kaal-packaging measure <artifact>/);
    assert.match(text, /kaal-packaging conform <installed-dir>/);
    const ids = new Set();
    for (const doc of readdirSync(join(PACKAGE, "docs"))) for (const m of readFileSync(join(PACKAGE, "docs", doc), "utf8").matchAll(/(?:\*\*|^#+\s+|^\|\s*)(packaging\/[A-Z]+\d+)\b/gm)) ids.add(m[1]);
    const cited = [...new Set([...text.matchAll(/\bpackaging\/([A-Z]+\d+)(?:[–-](?:packaging\/)?([A-Z]+)?(\d+))?/g)].flatMap((m) => {
      if (!m[3]) return [`packaging/${m[1]}`];
      const kind = m[1].replace(/\d+$/, "");
      const from = Number(m[1].slice(kind.length));
      return Array.from({ length: Number(m[3]) - from + 1 }, (_, i) => `packaging/${kind}${from + i}`);
    }))];
    assert.ok(cited.length > 0);
    for (const id of cited) assert.ok(ids.has(id), `${id} is defined in the shipped documents`);
    assert.match(text, /testing\/F13/, "the results' meaning is cited to Testing");
    assert.doesNotMatch(text, /\b(verified|failed|unknown)\b[^.\n]{0,40}\b(means|is when|is used when|indicates)\b/i, "the skill does not restate what a result means");
  });

  it("packaging/T31 F18: the agent instructions name Packaging, the skill and the commands", () => {
    const text = readFileSync(join(ROOT, "AGENTS.md"), "utf8");
    assert.match(text, /^## Packaging$/m);
    assert.match(text, /packages\/kaal-packaging\/skills\/kaal-packaging\/SKILL\.md/);
    assert.match(text, /kaal-packaging measure/);
    assert.match(text, /kaal-packaging conform/);
    assert.match(text, /decides that generic contract and nothing else/);
  });

  it("packaging/T33 N11: no file under packages/kaal-packaging/ names the platform, a Windows launcher, a platform-dependent shell or a process started outside Hosting", () => {
    // Each pattern is assembled from pieces, so this file does not match itself.
    const forbidden = [["process", "platform"].join("\\."), ["win", "32"].join(""), ["\\.", "cmd\\b"].join(""), ["shell", "\\s*:"].join(""), ["(?:from|import\\()\\s*[\"'](?:node:)?child", "_process"].join("")].map((p) => new RegExp(p, "i"));
    const walk = (dir) => readdirSync(dir).flatMap((n) => (n === "node_modules" ? [] : statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));
    // Code and its configuration. The PLANs and documents name these words to forbid them.
    const files = walk(PACKAGE).filter((f) => /\.(mjs|cjs|js|ts|json)$/.test(f));
    assert.ok(files.length > 10);
    const hits = [];
    for (const f of files) {
      const text = readFileSync(f, "utf8");
      for (const re of forbidden) if (re.test(text)) hits.push(`${relative(PACKAGE, f)}: ${re}`);
    }
    assert.deepEqual(hits, []);
  });

  it("packaging/T34 A13: measure and conform run a given npm script through Hosting, and a stand-in reaches them only that way", async () => {
    const { measure } = await import("kaal-packaging");
    const { conform } = await import("kaal-packaging/conformance");
    const dir = fresh("stand-in");
    const log = join(dir, "calls.log");
    const script = join(dir, "npm.mjs");
    writeFileSync(
      script,
      `import { appendFileSync } from "node:fs";
const args = process.argv.slice(2);
appendFileSync(${JSON.stringify(log)}, JSON.stringify(args) + "\\n");
if (args[0] === "--version") console.log("11.99.0");
else if (args[0] === "test") console.log("stand-in-verification " + JSON.stringify({ result: "failed", exit: 1, cases: [], causes: ["the stand-in ran"] }));
else console.log("[]");
process.exitCode = args[0] === "test" ? 1 : 0;
`,
    );
    const artifact = join(dir, "a.tgz");
    writeFileSync(artifact, "not read: the stand-in describes it");
    await assert.rejects(measure(artifact, { work: fresh("work"), npm: script }), /npm/);
    const calls = readFileSync(log, "utf8").trim().split("\n").map((l) => JSON.parse(l));
    assert.deepEqual(calls[0], ["--version"]);
    assert.equal(calls[1][0], "pack");

    const report = await conform(installed.dir, { consumer: installed.consumer, npm: script });
    assert.deepEqual(report.reported, { result: "failed", exit: 1, causes: ["the stand-in ran"] });
    assert.ok(readFileSync(log, "utf8").includes('["test","--silent"]'));

    for (const bad of [42, "", { command: "npm" }]) {
      await assert.rejects(measure(artifact, { work: fresh("work"), npm: bad }), TypeError);
      await assert.rejects(conform(installed.dir, { npm: bad }), TypeError);
    }
  });

  it("packaging/F15: the shipped docs/ and test/verify.json are the build's current output", async () => {
    const r = await execute(process.execPath, [join(PACKAGE, "test", "publisher", "build.mjs"), "--check"], { cwd: PACKAGE, env: { ...ENV, ...(NPM ? { npm_execpath: NPM } : {}) } });
    assert.equal(r.status, 0, `run npm run build:verify: ${r.stdout}${r.stderr}`);
  });
});
