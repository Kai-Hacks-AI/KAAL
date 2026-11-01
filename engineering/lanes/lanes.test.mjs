// engineering/C6: the comprehensive lane follows the declared root Test Plan,
// runs every applicable Engineering, Embedding and External suite once,
// selects a suite only by name, rewrites nothing, and combines owner- and
// context-separated results. Each case runs on a fixture
// workspace tree in a scratch directory, whose scripts write a marker naming
// the script and its working directory to a file outside that tree.
import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";
import { before, describe, it } from "node:test";
import { initialize, read, readFile } from "@kaihacksai/kaal-hosting";
import { comprehensive, select } from "./suites.mjs";

const base = join(tmpdir(), `kaal-lanes-test-${Date.now()}-${process.pid}`);
const MARK = 'require("node:fs").appendFileSync(process.env.KAAL_LANES_MARK, JSON.stringify({ script: process.argv[2], cwd: process.cwd() }) + "\\n"); process.exit(process.argv[3] === "fail" ? 1 : 0);\n';
const json = (v) => Buffer.from(JSON.stringify(v, null, 2) + "\n");

const ROOT = { "test:acceptance": "node mark.cjs test:acceptance", "test:engineering": "node mark.cjs test:engineering" };
/** A Test Plan that runs both root suites and records that External does not apply to the fixture. */
const PLAN = { engineering: ["test:acceptance", "test:engineering"], external: { suites: [], notApplicable: "a fixture serves no other repository" } };

/** A fixture tree under `name`: Engineering's root scripts, its Test Plan, and the given workspaces, each `{ name, scripts }`. */
async function fixture(name, workspaces, rootScripts = ROOT, plan = PLAN, extra = {}) {
  const root = join(base, name);
  const files = {
    "mark.cjs": Buffer.from(MARK),
    "package.json": json({ name: "fixture", private: true, workspaces: workspaces.map((w) => `packages/${w.name}`), scripts: rootScripts }),
    "engineering/lanes/plan.json": json(plan),
    ...extra,
  };
  for (const w of workspaces) files[`packages/${w.name}/package.json`] = json({ name: w.name, version: "0.0.0", scripts: w.scripts });
  await initialize(root, files);
  return root;
}

/** The markers written while running under `root`, with each working directory relative to it. */
async function marks(root, file) {
  let text;
  try {
    text = (await readFile(file)).toString("utf8");
  } catch {
    return [];
  }
  return text.trim().split("\n").filter(Boolean).map((l) => JSON.parse(l)).map(({ script, cwd }) => ({ script, cwd: cwd === root ? "." : cwd.slice(root.length + 1).split(sep).join("/") }));
}

const env = (file) => ({ ...process.env, KAAL_LANES_MARK: file });
const run = (s) => `node ../../mark.cjs ${s}`;

describe("engineering/C6: Engineering's test lanes", () => {
  before(async () => initialize(join(base, "marks"), {}));

  it("engineering/T5 [engineering/F1]: the lane runs each workspace's own npm test in its directory, and Engineering's suites at the root", async () => {
    const root = await fixture("t5", [{ name: "a", scripts: { test: run("test"), "test:publisher": run("test:publisher") } }]);
    const file = join(base, "marks", "t5");
    const result = await comprehensive(root, { env: env(file) });
    assert.equal(result.passed, true);
    assert.deepEqual(await marks(root, file), [
      { script: "test", cwd: "packages/a" },
      { script: "test:publisher", cwd: "packages/a" },
      { script: "test:acceptance", cwd: "." },
      { script: "test:engineering", cwd: "." },
    ]);
  });

  it("engineering/T6 [engineering/F2]: selection runs exactly the named suite, and refuses an undeclared one without running another", async () => {
    const root = await fixture("t6", [{ name: "a", scripts: { test: run("test"), "test:consumer": run("test:consumer") } }]);
    const file = join(base, "marks", "t6");
    assert.equal((await select(root, "a", "consumer", { env: env(file) })).status, "passed");
    await assert.rejects(select(root, "a", "publisher", { env: env(file) }), /a declares no suite test:publisher/);
    assert.deepEqual(await marks(root, file), [{ script: "test:consumer", cwd: "packages/a" }]);
  });

  it("engineering/T7 [engineering/N2]: no lane writes, copies or rewrites a workspace's tests or scripts", async () => {
    const root = await fixture("t7", [{ name: "a", scripts: { test: run("test"), "test:consumer": run("test:consumer") } }]);
    const file = join(base, "marks", "t7");
    const before = await read(root);
    await comprehensive(root, { env: env(file) });
    await select(root, "a", "consumer", { env: env(file) });
    assert.deepEqual(await read(root), before);
  });

  it("engineering/T8 [engineering/F3]: the result keeps each owner's suite apart, a failure on either side fails the lane, naming it, and a missing test entrypoint is never verified", async () => {
    const root = await fixture("t8", [{ name: "a", scripts: { test: run("test fail") } }, { name: "b", scripts: { test: run("test") } }]);
    const result = await comprehensive(root, { env: env(join(base, "marks", "t8")) });
    assert.equal(result.passed, false);
    assert.equal(result.result, "failed");
    assert.deepEqual(result.suites, [
      { owner: "a", context: "embedding", location: "packages/a", script: "test", status: "failed" },
      { owner: "b", context: "embedding", location: "packages/b", script: "test", status: "passed" },
      { owner: "Engineering", context: "engineering", location: "engineering", script: "test:acceptance", status: "passed" },
      { owner: "Engineering", context: "engineering", location: "engineering", script: "test:engineering", status: "passed" },
      { owner: "External", context: "external", location: undefined, script: undefined, status: "not applicable", cause: "a fixture serves no other repository" },
    ]);

    const engineering = await fixture("t8-engineering", [{ name: "a", scripts: { test: run("test") } }], { "test:acceptance": "node mark.cjs test:acceptance", "test:engineering": "node mark.cjs test:engineering fail" });
    const r = await comprehensive(engineering, { env: env(join(base, "marks", "t8-engineering")) });
    assert.equal(r.passed, false);
    assert.deepEqual(r.suites.filter((s) => s.status === "failed"), [{ owner: "Engineering", context: "engineering", location: "engineering", script: "test:engineering", status: "failed" }]);

    // A workspace with no test entrypoint is reported as missing and never counted as verified (the Owner's safeguard, #625).
    const missing = await fixture("t8-missing", [{ name: "a", scripts: { "test:consumer": run("test:consumer") } }]);
    const file = join(base, "marks", "t8-missing");
    const m = await comprehensive(missing, { env: env(file) });
    assert.equal(m.passed, false);
    assert.deepEqual(m.suites[0], { owner: "a", context: "embedding", location: "packages/a", script: undefined, status: "missing", cause: "no test entrypoint, not verified" });
    assert.deepEqual((await marks(missing, file)).map((x) => x.script), ["test:consumer", "test:acceptance", "test:engineering"]);
  });
  it("engineering/T37 [engineering/F20]: a publisher suite the workspace's npm test does not run is still run, once, in the workspace's directory", async () => {
    // a's npm test is consumer-only. b's runs its publisher suite with npm run, and c's names the same files.
    const root = await fixture("t37", [
      { name: "a", scripts: { test: run("test"), "test:consumer": run("test:consumer"), "test:publisher": run("test:publisher") } },
      { name: "b", scripts: { test: "npm run test:publisher", "test:publisher": run("test:publisher") } },
      { name: "c", scripts: { test: "tsc && node --test x.test.js y.test.js", "test:y": "tsc && node --test y.test.js" } },
    ]);
    const file = join(base, "marks", "t37");
    const result = await comprehensive(root, { env: env(file) });
    assert.deepEqual(await marks(root, file), [
      { script: "test", cwd: "packages/a" },
      { script: "test:consumer", cwd: "packages/a" },
      { script: "test:publisher", cwd: "packages/a" },
      { script: "test:publisher", cwd: "packages/b" },
      { script: "test:acceptance", cwd: "." },
      { script: "test:engineering", cwd: "." },
    ]);
    assert.deepEqual(
      result.suites.filter((s) => s.status === "covered").map(({ owner, script, by }) => ({ owner, script, by })),
      [
        { owner: "b", script: "test:publisher", by: "test" },
        { owner: "c", script: "test:y", by: "test" },
      ],
    );
    // c's test fails (there is no tsc), and fails the lane, which no covered suite can hide.
    assert.equal(result.result, "failed");
    assert.deepEqual(result.suites.filter((s) => s.status === "failed").map((s) => `${s.owner} ${s.script}`), ["c test"]);
  });

  it("engineering/T38 [engineering/F20]: a failing publisher suite outside the workspace's npm test fails the lane", async () => {
    const root = await fixture("t38", [{ name: "a", scripts: { test: run("test"), "test:publisher": run("test:publisher fail") } }]);
    const result = await comprehensive(root, { env: env(join(base, "marks", "t38")) });
    assert.equal(result.result, "failed");
    assert.deepEqual(result.suites.filter((s) => s.status === "failed").map((s) => s.script), ["test:publisher"]);
  });

  it("engineering/T39 [engineering/F21]: External suites the plan declares run in their context; with none and no recorded reason, the lane is unresolved, never passed", async () => {
    const external = { ...PLAN, external: { suites: [{ owner: "Agents", location: "external/agent", script: "test:agent" }] } };
    const extra = { "external/agent/package.json": json({ name: "agent-fixture", private: true, scripts: { "test:agent": "node ../../mark.cjs test:agent" } }) };
    const root = await fixture("t39", [{ name: "a", scripts: { test: run("test") } }], ROOT, external, extra);
    const file = join(base, "marks", "t39");
    const result = await comprehensive(root, { env: env(file) });
    assert.equal(result.result, "passed");
    assert.deepEqual((await marks(root, file)).at(-1), { script: "test:agent", cwd: "external/agent" });
    assert.deepEqual(result.suites.at(-1), { owner: "Agents", context: "external", location: "external/agent", script: "test:agent", status: "passed" });

    const failing = await fixture("t39-failed", [{ name: "a", scripts: { test: run("test") } }], ROOT, external, { "external/agent/package.json": json({ name: "agent-fixture", private: true, scripts: { "test:agent": "node ../../mark.cjs test:agent fail" } }) });
    assert.equal((await comprehensive(failing, { env: env(join(base, "marks", "t39-failed")) })).result, "failed");

    const undeclared = await fixture("t39-unresolved", [{ name: "a", scripts: { test: run("test") } }], ROOT, { ...PLAN, external: { suites: [] } });
    const u = await comprehensive(undeclared, { env: env(join(base, "marks", "t39-unresolved")) });
    assert.equal(u.result, "unresolved");
    assert.equal(u.passed, false);
    assert.deepEqual(u.suites.at(-1), { owner: "External", context: "external", location: undefined, script: undefined, status: "unresolved", cause: "no External Test Plan is declared, and no reason is recorded that none applies" });
  });

  it("engineering/T40 [engineering/F21]: a root test script the plan does not account for is unresolved, and one the plan names but the root lacks is missing", async () => {
    const extra = { ...ROOT, "test:new": "node mark.cjs test:new", "test:alias": "npm run test:engineering" };
    const root = await fixture("t40", [{ name: "a", scripts: { test: run("test") } }], extra, { ...PLAN, covered: { "test:alias": "test:engineering" } });
    const file = join(base, "marks", "t40");
    const result = await comprehensive(root, { env: env(file) });
    assert.equal(result.result, "unresolved");
    assert.deepEqual(
      result.suites.filter((s) => s.context === "engineering" && s.status !== "passed").map(({ script, status }) => ({ script, status })),
      [
        { script: "test:new", status: "unresolved" },
        { script: "test:alias", status: "covered" },
      ],
    );
    assert.ok(!(await marks(root, file)).some((m) => m.script === "test:new"));

    const lacking = await fixture("t40-missing", [{ name: "a", scripts: { test: run("test") } }], { "test:acceptance": ROOT["test:acceptance"] });
    const r = await comprehensive(lacking, { env: env(join(base, "marks", "t40-missing")) });
    assert.equal(r.result, "failed");
    assert.deepEqual(r.suites.find((s) => s.script === "test:engineering").status, "missing");
  });
});
