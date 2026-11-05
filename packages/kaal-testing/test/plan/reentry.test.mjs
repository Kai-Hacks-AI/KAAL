// testing/C55 planned outer tests: the test run re-entry guard (plan/reentry/*.md).
// Immutable to DO and CHECK; the DO turns them GREEN.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";

async function reentry() {
  let m;
  try {
    m = await import("kaal-testing/reentry");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-testing exports no ./reentry (${e.code ?? e.message})`);
  }
  for (const f of ["MARKER", "guard"]) if (m[f] === undefined) assert.fail(`blocked before behavioural assertion: kaal-testing/reentry exports no ${f}`);
  return m;
}

const RUN = new URL("../run.mjs", import.meta.url);

describe("test run re-entry guard", () => {
  it("testing/T123 [testing/F102]: with no marker, guard enters and hands children an environment carrying it", async () => {
    const { guard, MARKER } = await reentry();
    const given = { PATH: "/bin" };
    const r = guard(given);
    assert.equal(r.entered, true);
    assert.deepEqual(r.findings, []);
    assert.ok(r.env[MARKER], "children carry the marker");
    assert.equal(r.env.PATH, "/bin");
    assert.equal(given[MARKER], undefined, "the given environment is not changed");
  });

  it("testing/T124 [testing/F102]: with the marker present, guard does not enter, leaves the environment unchanged and reports re-entry", async () => {
    const { guard, MARKER } = await reentry();
    const given = { [MARKER]: "1", PATH: "/bin" };
    const r = guard(given);
    assert.equal(r.entered, false);
    assert.deepEqual(r.env, given);
    assert.ok(r.findings.length > 0 && r.findings.every((f) => /re-?enter/i.test(f)));
  });

  it("testing/T125 [testing/F103]: a run entry started with the marker present runs nothing, prints an unknown line naming re-entry and ends 2", async () => {
    const { MARKER } = await reentry();
    const r = spawnSync(process.execPath, [RUN.pathname, "--list"], { env: { ...process.env, [MARKER]: "1" }, encoding: "utf8" });
    assert.equal(r.status, 2, r.stdout + r.stderr);
    assert.match(r.stdout, /^kaal-testing: unknown: .*re-?enter/im);
    assert.doesNotMatch(r.stdout, /kaal-testing-suite/);
  });

  it("testing/T126 [testing/N22, testing/A30]: guard is pure and deterministic and lib/reentry.mjs imports nothing", async () => {
    const { guard, MARKER } = await reentry();
    const given = { [MARKER]: "1" };
    assert.equal(JSON.stringify(guard(given)), JSON.stringify(guard(given)));
    const src = readFileSync(new URL("../../lib/reentry.mjs", import.meta.url), "utf8");
    assert.deepEqual([...src.matchAll(/^\s*import\s|\bfrom\s+["']/gm)], []);
  });
});
