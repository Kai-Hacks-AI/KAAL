import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { attribute } from "kaal-testing/attribution";
import { inventory } from "kaal-testing/inventory";
import { markdown, report, STATUSES } from "kaal-testing/report";

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

  it("reports a workspace with no evidence as unknown: no figures, no delivered count, never zero", () => {
    const r = report(attribution(), [W, { workspace: "v", unknown: "v: no evidence was captured for this run" }]);
    assert.deepEqual(r.packages.find((p) => p.workspace === "v"), { workspace: "v", tests: undefined, unknown: "v: no evidence was captured for this run" });
    assert.deepEqual(r.findings.at(-1), { kind: "unknown", subject: "v", evidence: "v: no evidence was captured for this run" });
    assert.equal(r.reconciliation.entries.length, W.delivered.length);
  });
});

describe("the report in Markdown", () => {
  const LINUX = { workspace: "w", commit: "c".repeat(40), platform: "linux", arch: "x64", node: "v24.0.0" };
  const PROVENANCE = { commit: "c".repeat(40), run: "123", attempt: "2", captured: [LINUX] };

  it("opens with the commit, the run and where coverage was captured", () => {
    const md = markdown(report(attribution(), [W]), PROVENANCE);
    assert.match(md, new RegExp(`^## Testing evidence\n\nCommit \`${"c".repeat(40)}\`, run 123 attempt 2\.\nCoverage was captured on linux x64, Node v24\.0\.0 only\.\n`));
  });

  it("keeps coverage, ownership, reconciliation, findings and capability contracts in separate sections, each saying what it is not", () => {
    const md = markdown(report(attribution(), [W]), PROVENANCE);
    const headings = md.split("\n").filter((l) => l.startsWith("#"));
    assert.deepEqual(headings, ["## Testing evidence", "### Code coverage", "### CASE ownership", "### Reconciliation", "### Findings", "### Capability contracts"]);
    assert.match(md, /This is execution, not correctness\./);
    assert.match(md, /not obligations met\./);
    assert.match(md, /never combined\./);
    assert.match(md, /### Capability contracts\n\nNot reported here\./);
  });

  it("shows a failed and an unknown measurement as such, never as a figure", () => {
    const failed = { workspace: "f", tests: "fail", delivered: ["f/x.js"], failed: "f: no coverage summary was produced" };
    const unknown = { workspace: "u", unknown: "u: no evidence was captured for this run" };
    const md = markdown(report(attribution(), [W, failed, unknown]), PROVENANCE);
    assert.match(md, /^\| f \| fail \| 1 \| not measured \| not measured \| not measured \|$/m);
    assert.match(md, /^\| u \| unknown \| unknown \| unknown \| unknown \| unknown \|$/m);
    assert.match(md, /\*\*verified failure\*\* \(2\)\n\n- f: f: no coverage summary was produced\n- f: f: its tests failed/);
    assert.match(md, /\*\*unknown\*\* \(1\)\n\n- u: u: no evidence was captured for this run/);
  });

  it("shows no percentage but coverage's own", () => {
    const md = markdown(report(attribution(), [W]), PROVENANCE);
    assert.deepEqual(md.match(/\d+(\.\d+)?%/g), ["50%", "50%", "50%"]);
  });

  it("says when nothing was captured, and that the commit is unknown", () => {
    const md = markdown(report(attribution(), []), { captured: [] });
    assert.match(md, /Commit `unknown`\.\nNo coverage was captured\./);
  });

  it("keeps a table intact when a value holds a pipe or a line break", () => {
    const odd = { workspace: "o", unknown: "o: a | b\nc" };
    const md = markdown(report(attribution(), [odd]), PROVENANCE);
    assert.match(md, /- o: o: a \\\| b c$/m);
  });
});
