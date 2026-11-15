// Publisher regressions for the runner and installed verifier; these cases do not ship.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { hashes, LOOPS, PREFIX } from "../../package-check/verify.mjs";

const env = { ...process.env };
delete env.NODE_TEST_CONTEXT;
const NAME = "@kaihacksai/kaal-hosting";

function temporary(t) {
  const root = mkdtempSync(join(tmpdir(), "hosting-verifier-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

/** A source workspace in the package layout (hosting/C107): a requirements document, the Package Check, the manifest generator, and the dist/ a build would make from them. */
function fixture(t) {
  const root = temporary(t);
  const pkg = join(root, "pkg");
  const check = join(pkg, "04-test", "package-check");
  mkdirSync(check, { recursive: true });
  mkdirSync(join(pkg, "04-test", "engineering-check", "publisher"), { recursive: true });
  mkdirSync(join(pkg, "02-requirements", "functional"), { recursive: true });
  writeFileSync(join(pkg, "package.json"), JSON.stringify({ name: NAME, version: "0.0.1", type: "module", files: ["dist"] }));
  copyFileSync(new URL("../../package-check/verify.mjs", import.meta.url), join(check, "verify.mjs"));
  copyFileSync(new URL("./manifest.mjs", import.meta.url), join(pkg, "04-test", "engineering-check", "publisher", "manifest.mjs"));
  writeFileSync(join(pkg, "02-requirements", "functional", "requirements.md"), "**hosting/F1**: the fixture's obligation.\n");
  writeFileSync(join(check, "testing.md"), ["applicability", "allocated", "unverified"].map((marker) =>
    `<!-- kaal-hosting:${marker} -->\n| Identifier | Detail |\n| --- | --- |\n<!-- /kaal-hosting:${marker} -->\n`,
  ).join("\n"));
  for (const loop of LOOPS) writeFileSync(join(check, `${loop}.test.mjs`),
    'import { describe, it, after } from "node:test";\ndescribe("suite", () => { it("case [hosting/F1]", () => {}); });\n');
  build(pkg);
  return pkg;
}

/** What the build copies into dist/: the Package Check and the requirements. */
function build(pkg) {
  rmSync(join(pkg, "dist"), { recursive: true, force: true });
  cpSync(join(pkg, "04-test", "package-check"), join(pkg, "dist", "test", "package-check"), { recursive: true });
  cpSync(join(pkg, "02-requirements"), join(pkg, "dist", "docs", "requirements"), { recursive: true });
}

/** An installation of the fixture: the package.json and dist/ in a consumer's node_modules. */
function installation(t, pkg) {
  const root = temporary(t);
  const at = join(root, "node_modules", ...NAME.split("/"));
  mkdirSync(at, { recursive: true });
  writeFileSync(join(root, "package.json"), "{}\n");
  copyFileSync(join(pkg, "package.json"), join(at, "package.json"));
  cpSync(join(pkg, "dist"), join(at, "dist"), { recursive: true });
  return at;
}

const node = (pkg, entry) => spawnSync(process.execPath, [entry], { cwd: pkg, env, encoding: "utf8" });
const manifest = (pkg) => join(pkg, "dist", "test", "package-check", "verify.json");

function failAfter(pkg, dir = join("04-test", "package-check")) {
  writeFileSync(join(pkg, dir, "architecture.test.mjs"),
    'import { describe, it, after } from "node:test";\ndescribe("suite", () => { after(() => { throw new Error("teardown failed"); }); it("case [hosting/F1]", () => {}); });\n');
}

describe("verification cannot discard runner failures", () => {
  for (const hook of ["before", "beforeEach", "afterEach", "after"]) {
    it(`accounts for a failing ${hook} hook`, (t) => {
      const root = temporary(t);
      const file = join(root, "hook.test.mjs");
      writeFileSync(file, `import { describe, it, ${hook} } from "node:test";\ndescribe("suite", () => { ${hook}(() => { throw new Error("hook failed"); }); it("case", () => {}); });\n`);
      // run() must start outside node:test's own process, just as the consumer entry does.
      const script = `import {execute} from ${JSON.stringify(new URL("../../package-check/verify.mjs", import.meta.url).href)};
        const observed = [];
        const outcomes = await execute([${JSON.stringify(file)}], [], (o) => observed.push(o));
        console.log(JSON.stringify({observed, outcomes}));`;
      const driver = join(root, "driver.mjs");
      writeFileSync(driver, script);
      const run = spawnSync(process.execPath, [driver], { env, encoding: "utf8" });
      assert.equal(run.status, 0, run.stdout + run.stderr);
      const { observed, outcomes } = JSON.parse(run.stdout);
      assert.deepEqual(observed, outcomes);
      assert.ok(outcomes.some((o) => o.outcome === "fail"), JSON.stringify(outcomes));
      if (hook === "after") {
        assert.ok(outcomes.some((o) => o.outcome === "pass" && o.name.endsWith(" > case")));
        assert.ok(outcomes.some((o) => o.outcome === "fail" && o.name.endsWith(" > suite") && o.message === "hook failed"));
      }
    });
  }

  it("refuses to generate an inventory after a suite teardown fails", (t) => {
    const pkg = fixture(t);
    failAfter(pkg);
    build(pkg);
    const run = node(pkg, join("04-test", "engineering-check", "publisher", "manifest.mjs"));
    assert.equal(run.status, 1, run.stdout + run.stderr);
    assert.match(run.stderr, /every delivered case must pass.*fail:.*suite.*teardown failed/s);
    assert.equal(existsSync(join(pkg, "04-test", "package-check", "verify.json")), false);
  });

  it("reports failed after teardown fails in an otherwise passing installation", (t) => {
    const pkg = fixture(t);
    const packed = node(pkg, join("04-test", "engineering-check", "publisher", "manifest.mjs"));
    assert.equal(packed.status, 0, packed.stdout + packed.stderr);
    build(pkg);
    copyFileSync(join(pkg, "04-test", "package-check", "verify.json"), manifest(pkg));
    const installed = installation(t, pkg);
    const entry = join("dist", "test", "package-check", "verify.mjs");
    const clean = node(installed, entry);
    assert.equal(clean.status, 0, clean.stdout + clean.stderr);

    failAfter(installed, join("dist", "test", "package-check"));
    const inventory = JSON.parse(readFileSync(manifest(installed), "utf8"));
    // Keep the original case inventory; refresh hashes so this challenges execution, not integrity.
    inventory.hashes = hashes(installed);
    delete inventory.hashes["dist/test/package-check/verify.json"]; // the manifest is not among the files it hashes
    writeFileSync(manifest(installed), JSON.stringify(inventory));
    const run = node(installed, entry);
    assert.equal(run.status, 1, run.stdout + run.stderr);
    const summary = JSON.parse(run.stdout.split(/\r?\n/).find((l) => l.startsWith(PREFIX)).slice(PREFIX.length));
    assert.equal(summary.result, "failed");
    assert.match(summary.cause, /suite.*teardown failed/);
    assert.ok(summary.cases.every((c) => c.outcome === "pass"), "the failure is in the suite hook, after its case passed");
  });
});
