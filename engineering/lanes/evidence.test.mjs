// The evidence lane's failure paths and its captures, without running any
// workspace's tests: each run here gives the lane a measurement of its own in
// place of Engineering's coverage driver, and captures outside the repository.
import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { execute, read } from "kaal-hosting";
import { lane } from "./evidence.mjs";

const base = join(tmpdir(), `kaal-evidence-test-${Date.now()}-${process.pid}`);
const EVIDENCE = import.meta.resolve("./evidence.mjs");
const passed = (workspace, extra = {}) => ({ workspace, tests: "pass", delivered: [], lines: 100, branches: 100, functions: 100, unexecuted: [], files: [], ...extra });

/** The captures under `dir`, parsed, by workspace. */
async function captures(dir) {
  const files = await read(dir);
  return Object.fromEntries(Object.entries(files).map(([path, bytes]) => [path.split("/")[0], JSON.parse(bytes.toString("utf8"))]));
}

describe("the evidence lane's gate", () => {
  it("fails on failing tests, and captures them as failing", async () => {
    const dir = join(base, "failing");
    assert.equal(await lane(["w"], dir, async (name) => passed(name, { tests: "fail" })), false);
    assert.equal((await captures(dir)).w.result.tests, "fail");
  });

  it("passes when the tests pass but their measurement fails, and captures the failed measurement", async () => {
    const dir = join(base, "unmeasured");
    const failed = { ...passed("w"), failed: "w: no coverage summary was produced" };
    assert.equal(await lane(["w"], dir, async () => failed), true);
    assert.deepEqual((await captures(dir)).w.result, failed);
  });

  it("fails when no test status was observed at all", async () => {
    const dir = join(base, "silent");
    const none = { workspace: "w", failed: "w: the coverage driver gave no result (exited 1)" };
    assert.equal(await lane(["w"], dir, async () => none), false);
    assert.deepEqual((await captures(dir)).w.result, none);
  });

  it("runs every workspace before failing, so a later workspace is still captured", async () => {
    const dir = join(base, "all");
    assert.equal(await lane(["a", "b"], dir, async (name) => passed(name, name === "a" ? { tests: "fail" } : {})), false);
    assert.deepEqual(Object.keys(await captures(dir)).sort(), ["a", "b"]);
  });
});

describe("captures from lanes at once", () => {
  it("keeps every lane's captures when two processes capture into one directory at once", async () => {
    const dir = join(base, "concurrent");
    // Each process is a lane of its own, as the Hosting and Workspaces lanes
    // are, measuring slowly enough that their captures interleave.
    const script = (names) => `import { lane } from ${JSON.stringify(EVIDENCE)};
const ok = await lane(${JSON.stringify(names)}, ${JSON.stringify(dir)}, async (name) => {
  await new Promise((r) => setTimeout(r, 50));
  return { workspace: name, tests: "pass", delivered: [], lines: 100, branches: 100, functions: 100, unexecuted: [], files: [] };
});
process.exit(ok ? 0 : 1);`;
    const env = { ...process.env, GITHUB_RUN_ID: "7", GITHUB_RUN_ATTEMPT: "3" };
    const runs = await Promise.all([["kaal-hosting"], ["a", "b", "c"]].map((names) => execute(process.execPath, ["--input-type=module", "-e", script(names)], { cwd: process.cwd(), env })));
    assert.deepEqual(
      runs.map((r) => r.status),
      [0, 0],
      runs.map((r) => r.stderr).join("\n"),
    );
    const found = await captures(dir);
    assert.deepEqual(Object.keys(found).sort(), ["a", "b", "c", "kaal-hosting"]);
    for (const [name, capture] of Object.entries(found)) {
      assert.equal(capture.workspace, name);
      assert.equal(capture.result.workspace, name);
      assert.equal(capture.provenance.run, "7");
      assert.equal(capture.provenance.attempt, "3");
    }
  });

  it("refuses a second capture of a workspace and leaves the first as it was", async () => {
    const dir = join(base, "twice");
    assert.equal(await lane(["w"], dir, async (name) => passed(name)), true);
    const first = await read(dir);
    await assert.rejects(
      lane(["w"], dir, async (name) => passed(name, { tests: "fail" })),
      /already holds evidence/,
    );
    assert.deepEqual(await read(dir), first);
  });
});
