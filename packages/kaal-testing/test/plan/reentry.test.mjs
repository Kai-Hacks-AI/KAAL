// testing/C55 planned outer tests: the test run re-entry guard (plan/reentry/*.md).
// Immutable to DO and CHECK; the DO turns them GREEN.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";

async function reentry() {
  let m;
  try {
    m = await import("@kaihacksai/kaal-testing/reentry");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-testing exports no ./reentry (${e.code ?? e.message})`);
  }
  for (const f of ["MARKER", "guard"]) if (m[f] === undefined) assert.fail(`blocked before behavioural assertion: kaal-testing/reentry exports no ${f}`);
  return m;
}

const RUN = new URL("../run.mjs", import.meta.url);

describe("test run re-entry guard", () => {
  it("testing/T123 [testing/F102]: with no marker, guard enters at its level and hands children an environment carrying that level", async () => {
    const { guard, MARKER } = await reentry();
    const given = { PATH: "/bin" };
    const r = guard(given, 1);
    assert.equal(r.entered, true);
    assert.deepEqual(r.findings, []);
    assert.equal(r.env[MARKER], "1");
    assert.equal(r.env.PATH, "/bin");
    assert.equal(given[MARKER], undefined, "the given environment is not changed");
  });

  it("testing/T124 [testing/F102]: with the marker at or above the entry's level, or unreadable, guard does not enter, leaves the environment unchanged and reports re-entry", async () => {
    const { guard, MARKER } = await reentry();
    for (const [value, level] of [["1", 1], ["2", 1], ["2", 2], ["3", 2], ["", 1], ["x", 1], ["-1", 1], ["1.5", 2], [" 1", 2]]) {
      const given = { [MARKER]: value, PATH: "/bin" };
      const r = guard(given, level);
      assert.equal(r.entered, false, `marker ${JSON.stringify(value)} at level ${level}`);
      assert.deepEqual(r.env, given);
      assert.ok(r.findings.length > 0);
    }
  });

  it("testing/T125 [testing/F103]: the run entry started with the marker present runs nothing, prints an unknown line naming re-entry and ends 2", () => {
    const r = spawnSync(process.execPath, [RUN.pathname, "--list"], { env: { ...process.env, KAAL_TESTING_RUN: "1" }, encoding: "utf8" });
    assert.equal(r.status, 2, r.stdout + r.stderr);
    assert.match(r.stdout, /^kaal-testing: unknown: .*re-?enter/im);
    assert.doesNotMatch(r.stdout, /kaal-testing-suite/);
  });

  it("testing/T126 [testing/N22, testing/A30]: guard is pure and deterministic and lib/reentry.mjs imports nothing", async () => {
    const { guard, MARKER } = await reentry();
    const given = { [MARKER]: "1" };
    assert.equal(JSON.stringify(guard(given, 2)), JSON.stringify(guard(given, 2)));
    const src = readFileSync(new URL("../../lib/reentry.mjs", import.meta.url), "utf8");
    assert.deepEqual([...src.matchAll(/^\s*import\s|\bfrom\s+["']/gm)], []);
  });

  it("testing/T127 [testing/F104]: the verification (level 2) enters under the run entry's marker (1) and when unmarked, passes level 2 to its children, and is refused at 2; the run entry (level 1) is refused at 1", async () => {
    const { guard, MARKER } = await reentry();
    for (const env of [{ [MARKER]: "1" }, {}]) {
      const r = guard(env, 2);
      assert.equal(r.entered, true);
      assert.equal(r.env[MARKER], "2");
      assert.equal(guard(r.env, 2).entered, false, "a case process re-launching the verification");
      assert.equal(guard(r.env, 1).entered, false, "a case process re-launching the run entry");
    }
    assert.equal(guard({ [MARKER]: "1" }, 1).entered, false);
  });
});
