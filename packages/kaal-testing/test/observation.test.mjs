// testing/C82 unit tests: the split form of observe-at (a report produced elsewhere is read as untrusted data) and the record's relation to observe.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { assembleObservation, observeAt } from "../lib/observation.mjs";
import { runCases } from "../lib/run.mjs";

const BIN = fileURLToPath(new URL("../bin/kaal-testing.mjs", import.meta.url));
const REV = "c".repeat(40);
const CASE = (n, body) => `export const id = 'x/T${n}';\nexport const tests = ['x/F1'];\n${body}\n`;
const args = (root, out, extra = []) => ["observe-at", "--root", root, "--revision", REV, "--expect-revision", REV, "--run-id", "r", "--produced-by", "unit", "--out", out, ...extra];

function tree() {
  const root = mkdtempSync(join(tmpdir(), "obs-"));
  writeFileSync(join(root, "T1.test.mjs"), CASE(1, "export async function run() {}"));
  writeFileSync(join(root, "T2.test.mjs"), `import assert from 'node:assert/strict';\n${CASE(2, "export async function run() { assert.equal(1, 2); }")}`);
  return root;
}

describe("observe-at, the split form (testing/F175)", () => {
  it("assembles the record from a run report produced elsewhere, with the same pair as the one-step form", async () => {
    const root = tree();
    try {
      const report = await runCases({ files: ["T1.test.mjs", "T2.test.mjs"], root });
      writeFileSync(join(root, "run-report.json"), JSON.stringify(report));
      const out = join(root, "out");
      const r = spawnSync(process.execPath, [BIN, ...args(root, out, ["--report", join(root, "run-report.json"), "T1.test.mjs", "T2.test.mjs"])], { encoding: "utf8" });
      assert.equal(r.status, 0, r.stderr);
      const split = JSON.parse(readFileSync(join(out, "observation.json"), "utf8"));
      const one = await observeAt({ root, files: ["T1.test.mjs", "T2.test.mjs"], revision: REV, expectedRevision: REV, runId: "r", producedBy: "unit" });
      assert.deepEqual(split.observed, one.observed);
      assert.deepEqual(split.observed, { "x/T1": "GREEN", "x/T2": "RED" });
      assert.deepEqual(split.evidence.integrity, []);
      assert.equal(split.evidence.execution.complete, true);
    } finally { rmSync(root, { recursive: true, force: true }); }
  });

  it("a report that is not JSON, or omits a requested file, gives UNKNOWN for every Case and exit 0", async () => {
    const root = tree();
    try {
      writeFileSync(join(root, "garbage.json"), "not json");
      const out = join(root, "out");
      const r = spawnSync(process.execPath, [BIN, ...args(root, out, ["--report", join(root, "garbage.json"), "T1.test.mjs"])], { encoding: "utf8" });
      assert.equal(r.status, 0, r.stderr);
      const rec = JSON.parse(readFileSync(join(out, "observation.json"), "utf8"));
      assert.ok(Object.values(rec.observed).every((s) => s === "UNKNOWN"));
      assert.equal(rec.evidence.integrity[0].kind, "not-a-run-report");
      const partial = await runCases({ files: ["T1.test.mjs"], root });
      const o = assembleObservation({ report: partial, requested: ["T1.test.mjs", "T2.test.mjs"], cases: [{ id: "x/T1", file: "T1.test.mjs" }, { id: "x/T2", file: "T2.test.mjs" }], revision: REV, expectedRevision: REV, runId: "r", producedBy: "u" });
      assert.deepEqual(o.evidence.integrity.map((f) => f.kind), ["missing-file"]);
      assert.ok(Object.values(o.observed).every((s) => s === "UNKNOWN"));
    } finally { rmSync(root, { recursive: true, force: true }); }
  });

  it("a malformed test entry or a null report is a finding, never a crash or a GREEN", () => {
    const cases = [{ id: "x/T1", file: "T1.test.mjs" }];
    const base = { requested: ["T1.test.mjs"], cases, revision: REV, expectedRevision: REV, runId: "r", producedBy: "u" };
    const bad = { schema: "kaal-testing/run-report@1", counts: {}, diagnostics: [], tests: [null, { id: 3 }], execution: { complete: true, files: ["T1.test.mjs"], problems: [] } };
    for (const report of [bad, null, undefined, "x"]) {
      const o = assembleObservation({ ...base, report });
      assert.equal(o.observed["x/T1"], "UNKNOWN");
      assert.equal(o.evidence.execution.complete, false);
      assert.ok(o.evidence.integrity.length > 0);
    }
  });

  it("invalid input writes nothing: no files, a missing report file", () => {
    const root = tree();
    try {
      const out = join(root, "out");
      mkdirSync(out);
      const none = spawnSync(process.execPath, [BIN, ...args(root, out)], { encoding: "utf8" });
      assert.equal(none.status, 2);
      const gone = spawnSync(process.execPath, [BIN, ...args(root, out, ["--report", join(root, "absent.json"), "T1.test.mjs"])], { encoding: "utf8" });
      assert.equal(gone.status, 2);
      assert.equal(existsSync(join(out, "observation.json")), false);
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
});
