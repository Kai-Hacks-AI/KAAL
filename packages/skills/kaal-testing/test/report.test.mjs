import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { attribute } from "kaal-testing/attribution";
import { inventory } from "kaal-testing/inventory";
import { report, STATUSES } from "kaal-testing/report";

const ID = (c) => c.repeat(64);
const A = { kind: "capability", name: "Alpha", id: ID("a") };
const B = { kind: "skill", name: "Beta", id: ID("b") };
const text = (n) => Buffer.from(Array.from({ length: n }, (_, i) => `line ${i}`).join("\n"));
const claim = (path, owner, paths) => ({ path, bytes: Buffer.from(JSON.stringify({ owner, paths })) });

// A tree with one file per reconciliation case: owned by Alpha, owned by Beta,
// unclaimed, and claimed by both. Built output (w/dist/) is delivered but untracked.
function attribution() {
  const files = [
    { path: "w/lib/a.mjs", bytes: text(4) },
    { path: "w/lib/b.mjs", bytes: text(3) },
    { path: "w/lib/loose.mjs", bytes: text(2) },
    { path: "w/lib/shared.mjs", bytes: text(5) },
    { path: "w/README.md", bytes: text(6) },
  ];
  const claims = [claim("w/ownership.kaal.json", A, ["w/lib/a.mjs", "w/lib/shared.mjs", "w/README.md"]), claim("w/lib/ownership.kaal.json", B, ["w/lib/b.mjs", "w/lib/shared.mjs"])];
  return attribute(inventory([...files, ...claims]), claims, [A, B]);
}

const lines = (covered, total) => ({ covered, total });
const measured = (workspace, files, extra = {}) => ({
  workspace,
  tests: "pass",
  delivered: files.map((f) => f.path),
  lines: 50,
  branches: 50,
  functions: 50,
  unexecuted: [],
  files,
  ...extra,
});

const W = measured("w", [
  { path: "w/lib/a.mjs", lines: lines(3, 4) },
  { path: "w/lib/b.mjs", lines: lines(0, 2) },
  { path: "w/lib/loose.mjs", lines: lines(1, 1) },
  { path: "w/lib/shared.mjs", lines: lines(2, 2) },
  { path: "w/dist/built.js", lines: lines(5, 10) },
]);

describe("reconciling package coverage with CASE ownership", () => {
  it("joins a delivered file to an owner only when attribution attributes that exact tracked path", () => {
    const r = report(attribution(), [W]);
    assert.deepEqual(
      r.reconciliation.entries.map(({ path, status, owner }) => ({ path, status, owner: owner?.name })),
      [
        { path: "w/dist/built.js", status: "no tracked identity", owner: undefined },
        { path: "w/lib/a.mjs", status: "attributed", owner: "Alpha" },
        { path: "w/lib/b.mjs", status: "attributed", owner: "Beta" },
        { path: "w/lib/loose.mjs", status: "unclaimed", owner: undefined },
        { path: "w/lib/shared.mjs", status: "conflicting claims", owner: undefined },
      ],
    );
    assert.deepEqual(r.reconciliation.owners, [
      { ...A, deliveredFiles: 1, executableLines: { executed: 3, total: 4, unmeasured: 0 } },
      { ...B, deliveredFiles: 1, executableLines: { executed: 0, total: 2, unmeasured: 0 } },
    ]);
  });

  it("keeps built output unreconciled, with no source guessed for it", () => {
    const r = report(attribution(), [W]);
    const built = r.reconciliation.entries.find((e) => e.path === "w/dist/built.js");
    assert.deepEqual(built, { workspace: "w", path: "w/dist/built.js", status: "no tracked identity", executableLines: { executed: 5, total: 10 } });
    assert.ok(!r.reconciliation.owners.some((o) => o.executableLines.total >= 10));
  });

  it("reconciles every delivered file exactly once, by status", () => {
    const r = report(attribution(), [W]);
    assert.deepEqual(
      r.reconciliation.statuses.map(({ status, deliveredFiles }) => [status, deliveredFiles]),
      STATUSES.map((s) => [s, { attributed: 2, unclaimed: 1, "conflicting claims": 1, "no tracked identity": 1 }[s]]),
    );
    assert.equal(
      r.reconciliation.statuses.reduce((n, s) => n + s.deliveredFiles, 0),
      W.delivered.length,
    );
  });

  it("keeps the two metrics apart: ownership keeps attribution's non-blank text lines, unchanged and never combined with executed lines", () => {
    const a = attribution();
    const r = report(a, [W]);
    assert.equal(r.ownership.nonBlankLines, a.lines);
    assert.equal(r.ownership.owners.reduce((n, o) => n + o.nonBlankLines, 0) + r.ownership.unassigned.nonBlankLines, a.lines);
    assert.deepEqual(
      r.ownership.owners.map(({ name, files, nonBlankLines }) => ({ name, files, nonBlankLines })),
      a.owners.map(({ name, files, lines }) => ({ name, files, nonBlankLines: lines })),
    );
    for (const o of r.ownership.owners) assert.equal("executableLines" in o, false);
    for (const o of r.reconciliation.owners) assert.equal("nonBlankLines" in o, false);
  });

  it("reports an owner delivered by no workspace, and the package dimension, without deriving one from the other", () => {
    const r = report(attribution(), []);
    assert.deepEqual(r.packages, []);
    assert.deepEqual(
      r.reconciliation.owners.map((o) => o.deliveredFiles),
      [0, 0],
    );
    assert.equal(r.ownership.owners.length, 2);
  });

  it("counts a workspace whose coverage failed as unmeasured, and reports the failure as a verified failure", () => {
    const failed = { workspace: "w", tests: "fail", delivered: ["w/lib/a.mjs"], failed: "w: no coverage summary was produced" };
    const r = report(attribution(), [failed]);
    assert.deepEqual(r.packages, [{ workspace: "w", tests: "fail", deliveredFiles: 1, failed: failed.failed }]);
    assert.deepEqual(r.reconciliation.owners[0].executableLines, { executed: 0, total: 0, unmeasured: 1 });
    assert.deepEqual(
      r.findings.filter((f) => f.subject === "w"),
      [
        { kind: "verified failure", subject: "w", evidence: "w: no coverage summary was produced" },
        { kind: "verified failure", subject: "w", evidence: "w: its tests failed" },
      ],
    );
  });

  it("carries attribution's findings through unchanged", () => {
    const a = attribution();
    const r = report(a, [W]);
    assert.deepEqual(r.findings, a.findings);
    assert.ok(r.findings.some((f) => f.kind === "architectural concern" && f.subject === "w/lib/shared.mjs"));
  });

  it("does not depend on the order of the workspaces or their files", () => {
    const other = measured("v", [{ path: "v/x.js", lines: lines(1, 1) }]);
    const reversed = { ...W, delivered: [...W.delivered].reverse(), files: [...W.files].reverse() };
    assert.deepEqual(report(attribution(), [W, other]), report(attribution(), [other, reversed]));
  });

  it("refuses a workspace that reports the same delivered file twice", () => {
    const twice = { ...W, delivered: [...W.delivered, "w/lib/a.mjs"] };
    assert.throws(() => report(attribution(), [twice]), /w reports w\/lib\/a\.mjs as delivered more than once/);
  });
});
