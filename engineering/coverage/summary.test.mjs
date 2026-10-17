import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evidence } from "./summary.mjs";

const m = (covered, total) => ({ total, covered, skipped: 0, pct: total ? Math.round((covered / total) * 10000) / 100 : 100 });
const file = (l, b, f) => ({ lines: m(...l), statements: m(...l), branches: m(...b), functions: m(...f) });

describe("coverage evidence from a c8 summary", () => {
  it("reports totals, the files measured and the delivered files never executed", () => {
    const text = JSON.stringify({
      total: file([3, 4], [1, 2], [1, 2]),
      "/r/w/dist/a.js": file([3, 3], [1, 1], [1, 1]),
      "/r/w/dist/b.js": file([0, 1], [0, 1], [0, 1]),
    });
    assert.deepEqual(evidence("w", "/r", text), { lines: 75, branches: 50, functions: 50, measured: ["w/dist/a.js", "w/dist/b.js"], unexecuted: ["w/dist/b.js"] });
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
