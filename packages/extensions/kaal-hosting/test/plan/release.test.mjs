// hosting/C10 planned outer tests: Hosting publishes as @kaihacksai/kaal-hosting
// (hosting/F15–F17). Immutable to DO and CHECK; hosting/C11 turns them GREEN.
// Each title names the contracts it checks. They pack and install through
// Hosting's own build (hosting/A8), never through its package name, so they
// need no edit when the name changes; the consumer reaches the installed
// package by its name alone.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { execute } from "../../dist/index.js";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const REPO = resolve(PACKAGE, "../../..");
const SELF = "packages/extensions/kaal-hosting/test/plan/release.test.mjs";
const NAME = "@kaihacksai/kaal-hosting";
// Spelled in parts so this file never names the old package itself.
const OLD = ["kaal", "hosting"].join("-");

const pkg = () => JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
// A consumer's command runs outside this test run, so it inherits none of node:test's own context.
const env = { ...process.env, npm_config_audit: "false", npm_config_fund: "false", npm_config_update_notifier: "false" };
delete env.NODE_TEST_CONTEXT;

async function run(cmd, args, cwd) {
  const r = await execute(cmd, args, { cwd, env });
  assert.equal(r.status, 0, `${cmd} ${args.join(" ")}\n${r.stderr}`);
  return r.stdout;
}

/** Every file under `dir`, `/`-separated and relative to `base`. */
function files(dir, base) {
  return readdirSync(dir, { recursive: true, encoding: "utf8" })
    .filter((p) => statSync(join(dir, p)).isFile())
    .map((p) => `${base}/${p.split("\\").join("/")}`);
}

/** Each reference to `name` in `text`, by the kinds hosting/F16 names. */
function references(text, name) {
  const quoted = name.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
  const specifier = new RegExp(`(["'\`])${quoted}(/[\\w./-]+)?\\1`, "g");
  const selector = new RegExp(`(?:-w|--workspace)[ =]${quoted}(?![\\w/-])`, "g");
  return [...text.matchAll(specifier), ...text.matchAll(selector)].map((m) => m[0]);
}

describe("hosting/C10: Hosting publishes as @kaihacksai/kaal-hosting", () => {
  it("hosting/T21 [hosting/F15]: the package is @kaihacksai/kaal-hosting 0.0.1, public, with its repository directory, engines, license and runtime dependencies, and a README that names it and how to install it", () => {
    const p = pkg();
    assert.equal(p.name, NAME);
    assert.equal(p.version, "0.0.1");
    assert.deepEqual(p.publishConfig, { access: "public" });
    assert.deepEqual(p.repository, { type: "git", url: "git+https://github.com/Kai-Hacks-AI/KAAL.git", directory: "packages/extensions/kaal-hosting" });
    // Its exports, commands and files are the declared interface's, which hosting/T41 checks (hosting/C15).
    assert.deepEqual(p.engines, { node: ">=24" });
    assert.equal(p.license, "MIT");
    assert.deepEqual(Object.keys(p.dependencies).sort(), ["cross-spawn", "es-module-lexer", "graceful-fs", "proper-lockfile"]);
    const readme = readFileSync(join(PACKAGE, "README.md"), "utf8");
    assert.equal(readme.split("\n")[0], `# ${NAME}`);
    assert.match(readme, new RegExp(`npm install ${NAME}`));
  });

  it("hosting/T22 [hosting/F16]: no module specifier, dependency entry or workspace selector in the repository names the old package, and each names @kaihacksai/kaal-hosting", async () => {
    const tracked = (await run("git", ["ls-files", "-z"], REPO)).split("\0").filter(Boolean);
    const found = [];
    let renamed = 0;
    for (const path of tracked) {
      if (path === SELF || path.endsWith("package-lock.json")) continue;
      if (!/\.(c?m?js|ts|json|ya?ml)$/.test(path)) continue;
      const at = join(REPO, path);
      if (!existsSync(at)) continue;
      const text = readFileSync(at, "utf8");
      for (const ref of references(text, OLD)) found.push(`${path}: ${ref}`);
      renamed += references(text, NAME).length;
    }
    assert.deepEqual(found, []);
    assert.ok(renamed > 0, `no reference names ${NAME}`);
  });

  it("hosting/T23 [hosting/F16]: the lockfile links node_modules/@kaihacksai/kaal-hosting to the workspace and has no entry for the old package", () => {
    const lock = JSON.parse(readFileSync(join(REPO, "package-lock.json"), "utf8"));
    assert.deepEqual(lock.packages[`node_modules/${NAME}`], { resolved: "packages/extensions/kaal-hosting", link: true });
    assert.equal(lock.packages[`node_modules/${OLD}`], undefined);
    assert.equal(lock.packages["packages/extensions/kaal-hosting"]?.name, NAME);
    for (const [where, entry] of Object.entries(lock.packages)) {
      for (const field of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
        assert.equal(entry[field]?.[OLD], undefined, `${where} ${field} names the old package`);
      }
    }
  });

  describe("hosting/T24 [hosting/I5, hosting/F17]: packed and installed alone into a fresh consumer", () => {
    let tarball;
    let consumer;

    before(async () => {
      const out = mkdtempSync(join(tmpdir(), "kaal-hosting-pack-"));
      const packed = JSON.parse(await run("npm", ["pack", "--json", "--pack-destination", out], PACKAGE));
      tarball = join(out, packed[0].filename);
      consumer = mkdtempSync(join(tmpdir(), "kaal-hosting-consumer-"));
      writeFileSync(join(consumer, "package.json"), JSON.stringify({ name: "consumer", private: true, type: "module" }));
      // Hosting's runtime dependencies come from the registry; the cache is preferred but not required.
      await run("npm", ["install", "--prefer-offline", "--no-package-lock", tarball], consumer);
    });

    // What the tarball may hold is the declared interface's, which hosting/T41 checks (hosting/C15).
    it("installs as node_modules/@kaihacksai/kaal-hosting, and the consumer uses it by that name alone", async () => {
      const installed = join(consumer, "node_modules", ...NAME.split("/"));
      assert.ok(existsSync(join(installed, "package.json")), `${NAME} is not installed in the consumer`);
      assert.equal(JSON.parse(readFileSync(join(installed, "package.json"), "utf8")).name, NAME);
      mkdirSync(join(consumer, "root"));
      writeFileSync(
        join(consumer, "use.mjs"),
        [
          `import { execute, reconcile, within } from "${NAME}";`,
          `import { EXCLUSIONS } from "${NAME}/conformance";`,
          `import { fileURLToPath } from "node:url";`,
          `const root = fileURLToPath(new URL("./root", import.meta.url));`,
          `const report = await reconcile(root, { write: [{ path: "a.md", expect: "absent", bytes: Buffer.from("a") }], remove: [] });`,
          `const ran = await execute(process.execPath, ["-e", "process.stdout.write('ran')"], { cwd: root });`,
          `process.stdout.write(JSON.stringify({ within: await within(root, root), outcomes: report.outcomes, ran: ran.stdout, exclusions: Array.isArray(EXCLUSIONS) }));`,
        ].join("\n"),
      );
      const used = JSON.parse(await run(process.execPath, ["use.mjs"], consumer));
      assert.deepEqual(used, { within: true, outcomes: [{ path: "a.md", outcome: "written" }], ran: "ran", exclusions: true });
      assert.equal(readFileSync(join(consumer, "root", "a.md"), "utf8"), "a");
    });
  });
});

// hosting/C10 planned outer tests of the complete product and its consumer verification
// (hosting/I6, hosting/I7, hosting/F18–hosting/F25). hosting/C12 turns them GREEN. Each runs
// against the packed candidate installed alone in a fresh consumer, as a consumer would.
describe("hosting/C10: the installed package is a complete product its consumer can verify", () => {
  const ID = /\bhosting\/[IFNAT]\d+\b/g;
  const PREFIX = "kaal-hosting-verification ";
  let tarball;

  /** A fresh consumer outside the repository with the candidate installed alone, shipping `needs`. */
  async function consumer(needs = ["test/verify.mjs", "test/verify.json"]) {
    const dir = mkdtempSync(join(tmpdir(), "kaal-hosting-verify-"));
    writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "consumer", private: true, type: "module" }));
    await run("npm", ["install", "--prefer-offline", "--no-package-lock", tarball], dir);
    const installed = join(dir, "node_modules", ...NAME.split("/"));
    assert.ok(existsSync(join(installed, "package.json")), `${NAME} is not installed in the consumer`);
    for (const path of needs) assert.ok(existsSync(join(installed, path)), `the installed package ships no ${path}`);
    return { dir, installed };
  }

  /** The consumer's documented command, its exit status and its parsed summary line. */
  async function verify(dir) {
    const r = await execute("npm", ["explore", NAME, "--", "npm", "test"], { cwd: dir, env });
    const line = r.stdout.split(/\r?\n/).filter((l) => l.startsWith(PREFIX)).at(-1);
    return { status: r.status, output: r.stdout + r.stderr, summary: line === undefined ? undefined : JSON.parse(line.slice(PREFIX.length)) };
  }

  /** A fresh consumer whose installed manifest and shipped files `change` rewrites, keeping the hashes true, so only the rule under test can decide. */
  async function rewritten(change) {
    const c = await consumer();
    const at = join(c.installed, "test", "verify.json");
    const manifest = JSON.parse(readFileSync(at, "utf8"));
    for (const path of change(manifest, c.installed) ?? []) manifest.hashes[path] = createHash("sha256").update(readFileSync(join(c.installed, path))).digest("hex");
    writeFileSync(at, JSON.stringify(manifest));
    return c;
  }

  /** The first shipped acceptance case written with it(), its file, and its name in the manifest. */
  function firstCase(manifest, installed) {
    const name = manifest.cases.find((n) => /^test\/acceptance\/[^>]*\.test\.mjs > /.test(n));
    assert.ok(name, "the manifest declares no acceptance case");
    const file = name.split(" > ")[0];
    assert.match(readFileSync(join(installed, file), "utf8"), /\bit\(/, `${file} has no case written with it()`);
    return { name, file };
  }

  /** Every file under `dir` but `node_modules` directories, the installed copy included, with its SHA-256. */
  function content(dir, installed) {
    const out = {};
    const walk = (d) => {
      for (const e of readdirSync(d, { withFileTypes: true })) {
        const p = join(d, e.name);
        if (e.isDirectory()) {
          if (e.name !== "node_modules") walk(p);
        } else out[p] = createHash("sha256").update(readFileSync(p)).digest("hex");
      }
    };
    walk(dir);
    walk(installed);
    return out;
  }

  before(async () => {
    const out = mkdtempSync(join(tmpdir(), "kaal-hosting-pack-"));
    const packed = JSON.parse(await run("npm", ["pack", "--json", "--pack-destination", out], PACKAGE));
    tarball = join(out, packed[0].filename);
  });

  it("hosting/T25 [hosting/I7, hosting/F18]: the installed package carries docs/ with Intent, Requirements, Architecture, Testing and Limitations, defining each identifier a shipped case cites exactly once, citing no Engineering path, plan/ path or Change, and the README points to them and to the verification", async () => {
    const { installed } = await consumer([]);
    const docs = ["intent.md", "requirements.md", "architecture.md", "testing.md", "limitations.md"];
    for (const doc of docs) assert.ok(existsSync(join(installed, "docs", doc)), `docs/${doc} is not shipped`);
    const text = docs.map((doc) => readFileSync(join(installed, "docs", doc), "utf8")).join("\n");
    const defined = [...text.matchAll(/\*\*(hosting\/[IFNA]\d+)\b/g)].map((m) => m[1]);
    assert.deepEqual(defined.filter((id, i) => defined.indexOf(id) !== i), [], "an identifier is defined more than once");
    const cases = files(join(installed, "test"), "test").filter((p) => p.endsWith(".mjs") && !p.endsWith("verify.mjs"));
    assert.ok(cases.length > 0, "no case ships");
    const cited = new Set(cases.flatMap((p) => [...readFileSync(join(installed, p), "utf8").matchAll(ID)].map((m) => m[0])).filter((id) => !/\/T\d+$/.test(id)));
    assert.deepEqual([...cited].filter((id) => !defined.includes(id)).sort(), [], "a shipped case cites an identifier docs/ does not define");
    assert.doesNotMatch(text, /\bengineering\/|\bplan\/|\bhosting\/C\d+\b/, "docs/ cites an Engineering path, a plan/ path or a Change");
    const readme = readFileSync(join(installed, "README.md"), "utf8");
    assert.match(readme, /docs\//);
    assert.match(readme, new RegExp(`npm explore ${NAME} -- npm test`));
  });

  it("hosting/T26 [hosting/I6, hosting/F19, hosting/F20, hosting/F21, hosting/F22, hosting/F25]: the documented command verifies the installed copy on this host: every declared case ran and passed or is declared not applicable here, each loop ran a case, and the summary names what it exercised", async () => {
    const { dir, installed } = await consumer();
    assert.equal(JSON.parse(readFileSync(join(installed, "package.json"), "utf8")).scripts?.test, "node test/verify.mjs");
    const { status, output, summary } = await verify(dir);
    assert.equal(status, 0, output);
    assert.ok(summary, `no ${PREFIX.trim()} line\n${output}`);
    assert.equal(summary.result, "verified");
    assert.equal(summary.cause, undefined);
    assert.equal(summary.package.name, NAME);
    assert.equal(summary.package.version, "0.0.1");
    assert.equal(realpathSync(summary.package.location), realpathSync(installed));
    assert.equal(summary.platform, process.platform);
    assert.equal(summary.node, process.version);
    // The digest is recomputable from the installed copy alone (hosting/F22).
    const installedFiles = files(installed, "").map((p) => p.slice(1)).filter((p) => p !== "test/verify.json" && !p.startsWith("node_modules/")).sort();
    const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
    assert.equal(summary.digest, sha(installedFiles.map((p) => `${p}\0${sha(readFileSync(join(installed, p)))}\n`).join("")));
    const manifest = JSON.parse(readFileSync(join(installed, "test", "verify.json"), "utf8"));
    assert.deepEqual(summary.cases.map((c) => c.name).sort(), [...manifest.cases].sort());
    for (const loop of ["intent", "requirements", "architecture", "code"]) assert.ok(summary.cases.some((c) => c.loop === loop && c.outcome === "pass"), `the ${loop} loop ran no passing case`);
    for (const c of summary.cases) assert.ok(["pass", "not applicable"].includes(c.outcome), `${c.name}: ${c.outcome}`);
  });

  it("hosting/T27 [hosting/F21, hosting/F22]: an installed file changed, removed or added is cannot verify, exit 2, naming the file, and never verified", async () => {
    const changed = await consumer();
    const target = files(join(changed.installed, "dist"), "dist").find((p) => p.endsWith(".js"));
    writeFileSync(join(changed.installed, target), readFileSync(join(changed.installed, target), "utf8") + "\n// changed\n");
    const removed = await consumer();
    const gone = files(join(removed.installed, "test"), "test").find((p) => p.endsWith(".test.mjs"));
    assert.ok(gone, "the installed package ships no case");
    rmSync(join(removed.installed, gone));
    const added = await consumer();
    writeFileSync(join(added.installed, "dist", "extra.js"), "export {};\n");
    for (const [c, path] of [[changed, target], [removed, gone], [added, "dist/extra.js"]]) {
      const { status, output, summary } = await verify(c.dir);
      assert.equal(status, 2, output);
      assert.equal(summary?.result, "cannot verify", output);
      assert.ok(output.includes(path), `the output does not name ${path}`);
    }
  });

  it("hosting/T28 [hosting/F23]: every identifier docs/ defines is covered, allocated or unverified, and a run prints the allocated and unverified ones as not verified by it", async () => {
    const { dir, installed } = await consumer();
    const text = readdirSync(join(installed, "docs")).map((doc) => readFileSync(join(installed, "docs", doc), "utf8")).join("\n");
    const defined = [...new Set([...text.matchAll(/\*\*(hosting\/[IFNA]\d+)\b/g)].map((m) => m[1]))].sort();
    assert.ok(defined.length > 0, "docs/ defines no identifier");
    const { status, output, summary } = await verify(dir);
    assert.equal(status, 0, output);
    assert.deepEqual(Object.keys(summary.coverage).sort(), defined);
    for (const [id, state] of Object.entries(summary.coverage)) {
      assert.ok(["covered", "allocated", "unverified"].includes(state), `${id}: ${state}`);
      if (state !== "covered") assert.match(output, new RegExp(`${id.replace("/", "\\/")}\\b[^\\n]*not verified by this run`), `${id} is ${state} but not printed as not verified by this run`);
    }
  });

  it("hosting/T29 [hosting/F24]: a verified run leaves the consumer, the installed copy included, as it was", async () => {
    const { dir, installed } = await consumer();
    const before = content(dir, installed);
    const { status, output } = await verify(dir);
    assert.equal(status, 0, output);
    assert.deepEqual(content(dir, installed), before);
  });

  it("hosting/T30 [hosting/F21, hosting/F23, hosting/F25]: a manifest that declares no case, declares a case that does not exist, leaves an identifier docs/ defines undeclared, or a delivered case skipped outside its declared applicability is cannot verify, exit 2, never verified", async () => {
    const edits = [
      (m) => ({ ...m, cases: [] }),
      (m) => ({ ...m, cases: [...m.cases, "test/acceptance/intent.test.mjs > no such case"] }),
      // The manifest is not among the files it hashes, so only the coverage check can catch this one.
      (m) => ({ ...m, coverage: Object.fromEntries(Object.entries(m.coverage).slice(1)) }),
    ];
    const results = [];
    for (const edit of edits) {
      const { dir, installed } = await consumer();
      const at = join(installed, "test", "verify.json");
      const manifest = JSON.parse(readFileSync(at, "utf8"));
      assert.ok(Array.isArray(manifest.cases) && manifest.coverage && Object.keys(manifest.coverage).length > 0, "the manifest declares no cases or no coverage");
      writeFileSync(at, JSON.stringify(edit(manifest)));
      results.push(await verify(dir));
    }
    // A delivered case turned into a skip, with its new bytes put in the manifest, so the hashes
    // still match and only the rule against an undeclared skip can catch it.
    const { dir, installed } = await consumer();
    const at = join(installed, "test", "verify.json");
    const manifest = JSON.parse(readFileSync(at, "utf8"));
    const skipped = Object.keys(manifest.hashes ?? {}).find((p) => /^test\/acceptance\/.*\.test\.mjs$/.test(p) && /\bit\(/.test(readFileSync(join(installed, p), "utf8")));
    assert.ok(skipped, "the manifest hashes no acceptance case written with it()");
    const source = readFileSync(join(installed, skipped), "utf8").replace(/\bit\(/, "it.skip(");
    writeFileSync(join(installed, skipped), source);
    manifest.hashes[skipped] = createHash("sha256").update(Buffer.from(source)).digest("hex");
    writeFileSync(at, JSON.stringify(manifest));
    results.push(await verify(dir));
    for (const { status, output, summary } of results) {
      assert.equal(status, 2, output);
      assert.equal(summary?.result, "cannot verify", output);
    }
  });

  it("hosting/T31 [hosting/F21, hosting/F22, hosting/F25]: each result is exact: an absent or malformed manifest and a todo case are cannot verify, a failing case is failed and names the case, and a case declared not applicable here is reported as such and still verified", async () => {
    const absent = await consumer();
    rmSync(join(absent.installed, "test", "verify.json"));
    const malformed = await consumer();
    writeFileSync(join(malformed.installed, "test", "verify.json"), "{ not json");
    let failing;
    const failed = await rewritten((m, installed) => {
      const { name, file } = firstCase(m, installed);
      failing = name;
      writeFileSync(join(installed, file), readFileSync(join(installed, file), "utf8").replace(/\bit\((["'`])([^"'`]+)\1,\s*(async\s*)?\(\)\s*=>\s*\{/, (_, q, title, a) => `it(${q}${title}${q}, ${a ?? ""}() => { throw new Error("planted failure");`));
      return [file];
    });
    const todo = await rewritten((m, installed) => {
      const { file } = firstCase(m, installed);
      writeFileSync(join(installed, file), readFileSync(join(installed, file), "utf8").replace(/\bit\(/, "it.todo("));
      return [file];
    });
    let inapplicable;
    const declared = await rewritten((m, installed) => {
      inapplicable = firstCase(m, installed).name;
      m.applicability = { ...(m.applicability ?? {}), [inapplicable]: [process.platform] };
      return [];
    });

    for (const [c, why] of [[absent, "absent manifest"], [malformed, "malformed manifest"], [todo, "todo case"]]) {
      const { status, output, summary } = await verify(c.dir);
      assert.equal(status, 2, `${why}\n${output}`);
      assert.equal(summary?.result, "cannot verify", `${why}\n${output}`);
      assert.ok(summary.cause, `${why}: no cause`);
    }

    const f = await verify(failed.dir);
    assert.equal(f.status, 1, f.output);
    assert.equal(f.summary?.result, "failed", f.output);
    assert.equal(f.summary.cases.find((c) => c.name === failing)?.outcome, "fail", `${failing} is not reported as failing`);
    assert.ok(f.summary.cause, "failed: no cause");

    const d = await verify(declared.dir);
    assert.equal(d.status, 0, d.output);
    assert.equal(d.summary?.result, "verified", d.output);
    assert.equal(d.summary.cases.find((c) => c.name === inapplicable)?.outcome, "not applicable");
    assert.ok(d.summary.cases.filter((c) => c.name !== inapplicable).every((c) => c.outcome === "pass"));
  });
});
