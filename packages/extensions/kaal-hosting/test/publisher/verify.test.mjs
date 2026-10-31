// Publisher regressions for the runner and installed verifier; these cases do not ship.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { hashes, LOOPS, PREFIX } from "../verify.mjs";

const env = { ...process.env };
delete env.NODE_TEST_CONTEXT;

function temporary(t) {
  const root = mkdtempSync(join(tmpdir(), "hosting-verifier-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

function fixture(t) {
  const root = temporary(t);
  const pkg = join(root, "node_modules", "@kaihacksai", "kaal-hosting");
  mkdirSync(join(pkg, "test", "embed"), { recursive: true });
  mkdirSync(join(pkg, "test", "publisher"));
  mkdirSync(join(pkg, "docs"));
  writeFileSync(join(root, "package.json"), "{}\n");
  writeFileSync(join(pkg, "package.json"), JSON.stringify({
    name: "@kaihacksai/kaal-hosting", version: "0.0.1", type: "module",
    files: ["docs", "test/embed", "test/verify.mjs", "test/verify.json"],
  }));
  copyFileSync(new URL("../verify.mjs", import.meta.url), join(pkg, "test", "verify.mjs"));
  copyFileSync(new URL("./manifest.mjs", import.meta.url), join(pkg, "test", "publisher", "manifest.mjs"));
  writeFileSync(join(pkg, "docs", "requirements.md"), "**hosting/F1**: the fixture's obligation.\n");
  writeFileSync(join(pkg, "docs", "testing.md"), ["applicability", "allocated", "unverified"].map((marker) =>
    `<!-- kaal-hosting:${marker} -->\n| Identifier | Detail |\n| --- | --- |\n<!-- /kaal-hosting:${marker} -->\n`,
  ).join("\n"));
  for (const loop of LOOPS) writeFileSync(join(pkg, "test", "embed", `${loop}.test.mjs`),
    'import { describe, it, after } from "node:test";\ndescribe("suite", () => { it("case [hosting/F1]", () => {}); });\n');
  return pkg;
}

const node = (pkg, entry) => spawnSync(process.execPath, [entry], { cwd: pkg, env, encoding: "utf8" });
const manifest = (pkg) => join(pkg, "test", "verify.json");

function failAfter(pkg) {
  writeFileSync(join(pkg, "test", "embed", "architecture.test.mjs"),
    'import { describe, it, after } from "node:test";\ndescribe("suite", () => { after(() => { throw new Error("teardown failed"); }); it("case [hosting/F1]", () => {}); });\n');
}

describe("verification cannot discard runner failures", () => {
  for (const hook of ["before", "beforeEach", "afterEach", "after"]) {
    it(`accounts for a failing ${hook} hook`, (t) => {
      const root = temporary(t);
      const file = join(root, "hook.test.mjs");
      writeFileSync(file, `import { describe, it, ${hook} } from "node:test";\ndescribe("suite", () => { ${hook}(() => { throw new Error("hook failed"); }); it("case", () => {}); });\n`);
      // run() must start outside node:test's own process, just as the consumer entry does.
      const script = `import {execute} from ${JSON.stringify(new URL("../verify.mjs", import.meta.url).href)};
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
    const run = node(pkg, "test/publisher/manifest.mjs");
    assert.equal(run.status, 1, run.stdout + run.stderr);
    assert.match(run.stderr, /every delivered case must pass.*fail:.*suite.*teardown failed/s);
    assert.equal(existsSync(manifest(pkg)), false);
  });

  it("reports failed after teardown fails in an otherwise passing installation", (t) => {
    const pkg = fixture(t);
    const packed = node(pkg, "test/publisher/manifest.mjs");
    assert.equal(packed.status, 0, packed.stdout + packed.stderr);
    rmSync(join(pkg, "test", "publisher"), { recursive: true });
    const clean = node(pkg, "test/verify.mjs");
    assert.equal(clean.status, 0, clean.stdout + clean.stderr);

    failAfter(pkg);
    const inventory = JSON.parse(readFileSync(manifest(pkg), "utf8"));
    // Keep the original case inventory; refresh hashes so this challenges execution, not integrity.
    inventory.hashes = hashes(pkg);
    writeFileSync(manifest(pkg), JSON.stringify(inventory));
    const run = node(pkg, "test/verify.mjs");
    assert.equal(run.status, 1, run.stdout + run.stderr);
    const summary = JSON.parse(run.stdout.split(/\r?\n/).find((l) => l.startsWith(PREFIX)).slice(PREFIX.length));
    assert.equal(summary.result, "failed");
    assert.match(summary.cause, /suite.*teardown failed/);
    assert.ok(summary.cases.every((c) => c.outcome === "pass"), "the failure is in the suite hook, after its case passed");
  });
});
