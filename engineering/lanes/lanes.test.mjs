// engineering/C6: the comprehensive lane orchestrates Engineering Tests and
// each workspace's Embedded Tests, selects a suite only by name, rewrites
// nothing, and combines owner-separated results. Each case runs on a fixture
// workspace tree in a scratch directory, whose scripts write a marker naming
// the script and its working directory to a file outside that tree.
import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";
import { before, describe, it } from "node:test";
import { initialize, read, readFile } from "kaal-hosting";
import { comprehensive, select } from "./suites.mjs";

const base = join(tmpdir(), `kaal-lanes-test-${Date.now()}-${process.pid}`);
const MARK = 'require("node:fs").appendFileSync(process.env.KAAL_LANES_MARK, JSON.stringify({ script: process.argv[2], cwd: process.cwd() }) + "\\n"); process.exit(process.argv[3] === "fail" ? 1 : 0);\n';
const json = (v) => Buffer.from(JSON.stringify(v, null, 2) + "\n");

/** A fixture tree under `name`: Engineering's root scripts and the given workspaces, each `{ name, scripts }`. */
async function fixture(name, workspaces, rootScripts = { "test:acceptance": "node mark.cjs test:acceptance", "test:engineering": "node mark.cjs test:engineering" }) {
  const root = join(base, name);
  const files = { "mark.cjs": Buffer.from(MARK), "package.json": json({ name: "fixture", private: true, workspaces: workspaces.map((w) => `packages/${w.name}`), scripts: rootScripts }) };
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
    assert.deepEqual(result.suites, [
      { owner: "a", location: "packages/a", script: "test", status: "failed" },
      { owner: "b", location: "packages/b", script: "test", status: "passed" },
      { owner: "Engineering", location: "engineering", script: "test:acceptance", status: "passed" },
      { owner: "Engineering", location: "engineering", script: "test:engineering", status: "passed" },
    ]);

    const engineering = await fixture("t8-engineering", [{ name: "a", scripts: { test: run("test") } }], { "test:acceptance": "node mark.cjs test:acceptance", "test:engineering": "node mark.cjs test:engineering fail" });
    const r = await comprehensive(engineering, { env: env(join(base, "marks", "t8-engineering")) });
    assert.equal(r.passed, false);
    assert.deepEqual(r.suites.filter((s) => s.status !== "passed"), [{ owner: "Engineering", location: "engineering", script: "test:engineering", status: "failed" }]);

    // A workspace with no test entrypoint is reported as missing and never counted as verified (the Owner's safeguard, #625).
    const missing = await fixture("t8-missing", [{ name: "a", scripts: { "test:consumer": run("test:consumer") } }]);
    const file = join(base, "marks", "t8-missing");
    const m = await comprehensive(missing, { env: env(file) });
    assert.equal(m.passed, false);
    assert.deepEqual(m.suites[0], { owner: "a", location: "packages/a", script: undefined, status: "missing" });
    assert.deepEqual((await marks(missing, file)).map((x) => x.script), ["test:acceptance", "test:engineering"]);
  });
});
