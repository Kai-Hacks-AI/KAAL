import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { cover, evidence } from "kaal-testing/coverage";

const m = (covered, total) => ({ total, covered, skipped: 0, pct: total ? Math.round((covered / total) * 10000) / 100 : 100 });
const file = (l, b, f) => ({ lines: m(...l), statements: m(...l), branches: m(...b), functions: m(...f) });

describe("coverage evidence from a c8 summary", () => {
  it("reports totals, the files measured with their executed lines, and the delivered files never executed", () => {
    const text = JSON.stringify({
      total: file([3, 4], [1, 2], [1, 2]),
      "/r/w/dist/a.js": file([3, 3], [1, 1], [1, 1]),
      "/r/w/dist/b.js": file([0, 1], [0, 1], [0, 1]),
    });
    assert.deepEqual(evidence("w", "/r", text), {
      lines: 75,
      branches: 50,
      functions: 50,
      measured: ["w/dist/a.js", "w/dist/b.js"],
      files: [
        { path: "w/dist/a.js", lines: { covered: 3, total: 3 } },
        { path: "w/dist/b.js", lines: { covered: 0, total: 1 } },
      ],
      unexecuted: ["w/dist/b.js"],
    });
  });

  it("fails, naming the workspace, when no summary was produced", () => {
    assert.deepEqual(evidence("w", "/r", undefined), { failed: "w: no coverage summary was produced" });
  });

  it("fails, naming the workspace, when the summary is not JSON", () => {
    assert.match(evidence("w", "/r", "{").failed, /^w: the coverage summary is not JSON/);
  });

  it("fails, naming the workspace, when the summary lacks a valid total or file", () => {
    assert.deepEqual(evidence("w", "/r", "{}"), { failed: "w: the coverage summary has no valid total for lines, branches and functions" });
    const text = JSON.stringify({ total: file([1, 1], [1, 1], [1, 1]), "/r/w/a.js": { lines: m(1, 1) } });
    assert.deepEqual(evidence("w", "/r", text), { failed: "w: the coverage summary has no valid figures for /r/w/a.js" });
  });
});

describe("running coverage", () => {
  it("refuses a report directory that already holds a summary, so an earlier run's report is never evidence", async () => {
    const dir = mkdtempSync(join(tmpdir(), "kaal-testing-cover-"));
    writeFileSync(join(dir, "coverage-summary.json"), "{}");
    const r = await cover("w", ["w/a.js"], { root: dir, dir });
    assert.equal(r.failed, `w: ${dir} already holds a coverage summary; measurement needs a fresh report directory`);
    assert.equal(r.lines, undefined);
  });
});
