// Capability acceptance: only caller-packed packages, installed fresh by Testing.
import assert from "node:assert/strict";
import { it } from "node:test";
import { execute } from "kaal-hosting";
import { install } from "kaal-testing/acceptance";

it("the packed duplicates API retains failed, unknown and independently required observations", async () => {
  const host = await install(["kaal-testing", "kaal-hosting"]);
  const script = `
    import assert from "node:assert/strict";
    import { duplicates, schedule } from "kaal-testing/duplicates";
    const file = { path: "cases.mjs", sha256: "1".repeat(64) };
    const on = { subject: "a".repeat(64), platform: process.platform, node: process.version };
    const q = (by, extra = {}) => ({ by, files: [file], ...on, ...extra });
    const planned = schedule([q("suite"), q("nested")]);
    assert.equal(planned.runs.length, 1);
    for (const outcome of ["failed", "unknown"]) {
      const observation = Object.freeze({ outcome, provenance: "this execution" });
      const observations = [observation];
      assert.ok(planned.reads.every((r) => observations[r.run] === observation));
      assert.equal(schedule([q("suite")]).runs.length, 1);
    }
    for (const changed of [{ subject: "b".repeat(64) }, { platform: "another host" }, { node: "another Node" }, { files: [{ ...file, sha256: "2".repeat(64) }] }]) {
      assert.equal(schedule([q("suite"), q("independent", changed)]).runs.length, 2);
    }
    const ran = { case: "T1", file: file.path, sha256: file.sha256, ...on, ms: 10 };
    const runs = [{ ...ran, outcome: "fail" }, { ...ran, outcome: "pass", by: "nested" }];
    const before = structuredClone(runs);
    const d = duplicates({ runs });
    assert.equal(d.result, "challenged");
    assert.equal(d.wastedMs, 10);
    assert.deepEqual(runs, before);
    assert.ok(!("outcome" in d.challenges[0]));
    assert.equal(duplicates({ runs: [{ ...ran, ms: NaN }] }).result, "unknown");
    assert.deepEqual(schedule([q("valid"), { by: "bad" }]).runs, []);
    console.log("packed duplicates assertions passed");
  `;
  const r = await execute(process.execPath, ["--input-type=module", "-e", script], { cwd: host });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /packed duplicates assertions passed/);
});
