// hosting/C109 successors of the installed-package Cases hosting/T24 to hosting/T31 and hosting/T75
// (hosting/T217 to hosting/T225). The assertions are the originals', unchanged; only the setup differs: the
// candidate is packed and installed once through `prepare` (hosting/F78) and every Case takes an independent
// copy, so this suite runs one `npm install` where the originals ran thirteen. The originals stay in
// `plan/release.test.mjs`, unedited (planned Cases are immutable), and `test:publisher` skips them by name,
// as it skips the Cases hosting/T173 to hosting/T175 supersede. Each title keeps the original's contracts.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { execute, prepare } from "../../../dist/skills/kaal-hosting/scripts/index.js";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const NAME = "@kaihacksai/kaal-hosting";

// A consumer's command runs outside this test run, so it inherits none of node:test's own context.
const env = { ...process.env, npm_config_audit: "false", npm_config_fund: "false", npm_config_update_notifier: "false" };
delete env.NODE_TEST_CONTEXT;

async function run(cmd, args, cwd) {
  const r = await execute(cmd, args, { cwd, env });
  assert.equal(r.status, 0, `${cmd} ${args.join(" ")}\n${r.stderr}`);
  return r.stdout;
}

let installation;
/**
 * The candidate, packed once and installed alone into one consumer once (hosting/C108): every Case that needs a fresh
 * consumer takes an independent copy of it, so the suite runs one npm install, not one per Case.
 * Hosting's runtime dependencies come from the registry; the cache is preferred but not required.
 */
const installedCandidate = () =>
  (installation ??= prepare(async (dir) => {
    const out = mkdtempSync(join(tmpdir(), "kaal-hosting-pack-"));
    const packed = JSON.parse(await run("npm", ["pack", "--json", "--pack-destination", out], PACKAGE));
    writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "consumer", private: true, type: "module" }));
    await run("npm", ["install", "--prefer-offline", "--no-package-lock", join(out, packed[0].filename)], dir);
    rmSync(out, { recursive: true, force: true });
  }));
after(async () => {
  if (installation) await (await installation).dispose();
});

/** Every file under `dir`, `/`-separated and relative to `base`. */
function files(dir, base) {
  return readdirSync(dir, { recursive: true, encoding: "utf8" })
    .filter((p) => statSync(join(dir, p)).isFile())
    .map((p) => `${base}/${p.split("\\").join("/")}`);
}

describe("hosting/C109: the candidate installed once, copied per Case", () => {
  describe("hosting/T217 [hosting/I5, hosting/F17]: packed and installed alone into a fresh consumer", () => {
    let consumer;

    before(async () => {
      consumer = await (await installedCandidate()).copy();
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

describe("hosting/C109: the installed package is a complete product its consumer can verify, from copies", () => {
  const ID = /\bhosting\/[IFNAT]\d+\b/g;
  const PREFIX = "kaal-hosting-verification ";

  /** A fresh consumer outside the repository with the candidate installed alone, shipping `needs`. */
  async function consumer(needs = ["dist/test/package-check/verify.mjs", "dist/test/package-check/verify.json"]) {
    const dir = await (await installedCandidate()).copy();
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
    const at = join(c.installed, "dist", "test", "package-check", "verify.json");
    const manifest = JSON.parse(readFileSync(at, "utf8"));
    for (const path of change(manifest, c.installed) ?? []) manifest.hashes[path] = createHash("sha256").update(readFileSync(join(c.installed, path))).digest("hex");
    writeFileSync(at, JSON.stringify(manifest));
    return c;
  }

  /** The first shipped outer case (Intent, Requirements or Architecture) written with it(), its file, and its name in the manifest. */
  function firstCase(manifest, installed) {
    const name = manifest.cases.find((n) => /^test\/package-check\/(intent|requirements|architecture)\.test\.mjs > /.test(n));
    assert.ok(name, "the manifest declares no outer case");
    const file = `dist/${name.split(" > ")[0]}`;
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

  it("hosting/T218 [hosting/I7, hosting/F18]: the installed package carries docs/ with Intent, Requirements, Architecture, Testing and Limitations, defining each identifier a shipped case cites exactly once, citing no Engineering path, plan/ path or Change, and the README points to them and to the verification", async () => {
    const { installed } = await consumer([]);
    // Path clauses (hosting/C107): the documents are under dist/, Testing sits with the Package Check, and Limitations is a section of the README (Kai F8 = A).
    const docs = ["docs/intent/intent.md", "docs/requirements/functional/requirements.md", "docs/architecture/architecture.md", "test/package-check/testing.md"];
    for (const doc of docs) assert.ok(existsSync(join(installed, "dist", doc)), `dist/${doc} is not shipped`);
    assert.match(readFileSync(join(installed, "README.md"), "utf8"), /^## Limitations$/m, "the README has no Limitations section");
    const text = [...docs.map((doc) => readFileSync(join(installed, "dist", doc), "utf8")), readFileSync(join(installed, "README.md"), "utf8")].join("\n");
    const defined = [...text.matchAll(/\*\*(hosting\/[IFNA]\d+)\b/g)].map((m) => m[1]);
    assert.deepEqual(defined.filter((id, i) => defined.indexOf(id) !== i), [], "an identifier is defined more than once");
    const cases = files(join(installed, "dist", "test"), "dist/test").filter((p) => p.endsWith(".mjs") && !p.endsWith("verify.mjs"));
    assert.ok(cases.length > 0, "no case ships");
    const cited = new Set(cases.flatMap((p) => [...readFileSync(join(installed, p), "utf8").matchAll(ID)].map((m) => m[0])).filter((id) => !/\/T\d+$/.test(id)));
    assert.deepEqual([...cited].filter((id) => !defined.includes(id)).sort(), [], "a shipped case cites an identifier docs/ does not define");
    assert.doesNotMatch(text, /\bengineering\/|\bplan\/|\bhosting\/C\d+\b/, "docs/ cites an Engineering path, a plan/ path or a Change");
    const readme = readFileSync(join(installed, "README.md"), "utf8");
    assert.match(readme, /docs\//);
    assert.match(readme, new RegExp(`npm explore ${NAME} -- npm test`));
  });

  it("hosting/T219 [hosting/I6, hosting/F19, hosting/F20, hosting/F21, hosting/F22, hosting/F25]: the documented command verifies the installed copy on this host: every declared case ran and passed or is declared not applicable here, each loop ran a case, and the summary names what it exercised", async () => {
    const { dir, installed } = await consumer();
    // The entry is a file, never `node -e`: the test runner hands an inherited --eval to every case process, and each would run the whole entry again (a process storm).
    const entryScript = JSON.parse(readFileSync(join(installed, "package.json"), "utf8")).scripts?.test;
    assert.equal(entryScript, "node dist/test/package-check/verify.mjs");
    assert.doesNotMatch(entryScript, /(^|\s)(-e|--eval|-p|--print)(\s|=|$)/, "the test script evaluates inline code, which every case process would inherit");
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
    const installedFiles = files(installed, "").map((p) => p.slice(1)).filter((p) => p !== "dist/test/package-check/verify.json" && !p.startsWith("node_modules/")).sort();
    const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
    assert.equal(summary.digest, sha(installedFiles.map((p) => `${p}\0${sha(readFileSync(join(installed, p)))}\n`).join("")));
    const manifest = JSON.parse(readFileSync(join(installed, "dist", "test", "package-check", "verify.json"), "utf8"));
    assert.deepEqual(summary.cases.map((c) => c.name).sort(), [...manifest.cases].sort());
    for (const loop of ["intent", "requirements", "architecture", "code"]) assert.ok(summary.cases.some((c) => c.loop === loop && c.outcome === "pass"), `the ${loop} loop ran no passing case`);
    for (const c of summary.cases) assert.ok(["pass", "not applicable"].includes(c.outcome), `${c.name}: ${c.outcome}`);
  });

  it("hosting/T220 [hosting/F21, hosting/F22]: an installed file changed, removed or added is cannot verify, exit 2, naming the file, and never verified", async () => {
    const changed = await consumer();
    const target = files(join(changed.installed, "dist"), "dist").find((p) => p.endsWith(".js"));
    writeFileSync(join(changed.installed, target), readFileSync(join(changed.installed, target), "utf8") + "\n// changed\n");
    const removed = await consumer();
    const gone = files(join(removed.installed, "dist", "test"), "dist/test").find((p) => p.endsWith(".test.mjs"));
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

  it("hosting/T221 [hosting/F23]: every identifier docs/ defines is covered, allocated or unverified, and a run prints the allocated and unverified ones as not verified by it", async () => {
    const { dir, installed } = await consumer();
    const text = ["intent", "requirements", "architecture"].flatMap((d) => files(join(installed, "dist", "docs", d), "").map((p) => readFileSync(join(installed, "dist", "docs", d, p.slice(1)), "utf8"))).join("\n");
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

  it("hosting/T222 [hosting/F24]: a verified run leaves the consumer, the installed copy included, as it was", async () => {
    const { dir, installed } = await consumer();
    const before = content(dir, installed);
    const { status, output } = await verify(dir);
    assert.equal(status, 0, output);
    assert.deepEqual(content(dir, installed), before);
  });

  it("hosting/T223 [hosting/F21, hosting/F23, hosting/F25]: a manifest that declares no case, declares a case that does not exist, leaves an identifier docs/ defines undeclared, or a delivered case skipped outside its declared applicability is cannot verify, exit 2, never verified", async () => {
    const edits = [
      (m) => ({ ...m, cases: [] }),
      (m) => ({ ...m, cases: [...m.cases, "test/package-check/intent.test.mjs > no such case"] }),
      // The manifest is not among the files it hashes, so only the coverage check can catch this one.
      (m) => ({ ...m, coverage: Object.fromEntries(Object.entries(m.coverage).slice(1)) }),
    ];
    const results = [];
    for (const edit of edits) {
      const { dir, installed } = await consumer();
      const at = join(installed, "dist", "test", "package-check", "verify.json");
      const manifest = JSON.parse(readFileSync(at, "utf8"));
      assert.ok(Array.isArray(manifest.cases) && manifest.coverage && Object.keys(manifest.coverage).length > 0, "the manifest declares no cases or no coverage");
      writeFileSync(at, JSON.stringify(edit(manifest)));
      results.push(await verify(dir));
    }
    // A delivered case turned into a skip, with its new bytes put in the manifest, so the hashes
    // still match and only the rule against an undeclared skip can catch it.
    const { dir, installed } = await consumer();
    const at = join(installed, "dist", "test", "package-check", "verify.json");
    const manifest = JSON.parse(readFileSync(at, "utf8"));
    const skipped = Object.keys(manifest.hashes ?? {}).find((p) => /^dist\/test\/package-check\/(intent|requirements|architecture)\.test\.mjs$/.test(p) && /\bit\(/.test(readFileSync(join(installed, p), "utf8")));
    assert.ok(skipped, "the manifest hashes no outer case written with it()");
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

  it("hosting/T224 [hosting/F21, hosting/F22, hosting/F25]: each result is exact: an absent or malformed manifest and a todo case are cannot verify, a failing case is failed and names the case, and a case declared not applicable here is reported as such and still verified", async () => {
    const absent = await consumer();
    rmSync(join(absent.installed, "dist", "test", "package-check", "verify.json"));
    const malformed = await consumer();
    writeFileSync(join(malformed.installed, "dist", "test", "package-check", "verify.json"), "{ not json");
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

  it("hosting/T225 [hosting/F62, hosting/A25]: the packed installation inventories the usage Skill and its actual examples, and declares all three delivered usage Cases", async () => {
    const { installed } = await consumer();
    const manifest = JSON.parse(readFileSync(join(installed, "dist/test/package-check/verify.json"), "utf8"));
    for (const path of ["dist/skills/kaal-hosting/SKILL.md", "dist/skills/kaal-hosting/references/operations.md", "dist/test/package-check/usage-harness.mjs"]) {
      assert.ok(existsSync(join(installed, path)), `packed resource missing: ${path}`);
      assert.equal(manifest.hashes[path], createHash("sha256").update(readFileSync(join(installed, path))).digest("hex"));
    }
    for (const id of [72, 73, 74]) assert.equal(manifest.cases.filter((name) => name.includes(`hosting/T${id} `)).length, 1, `one declared T${id}`);
  });
});
