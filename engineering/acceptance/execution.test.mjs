// Existing Acceptance discovery runs these on Linux, Windows and macOS.
// Controlled integration fixtures are not live qualification or activation.
import assert from "node:assert/strict";
import { it } from "node:test";
import { fileURLToPath } from "node:url";
import { execute, readFile } from "kaal-hosting";
import { install } from "kaal-testing/acceptance";
import { sha256 } from "@kaihacksai/kaal-foundation/sha256";

const root = new URL("../../", import.meta.url);
it("Engineering C51 frozen boundary, error handling and eight behavioural mutations", async () => {
  const boundary = JSON.parse(Buffer.from(await readFile(fileURLToPath(new URL("engineering/execution/plan/boundary.json", root)))).toString());
  for (const file of boundary.files) assert.equal(sha256(await readFile(fileURLToPath(new URL(file.path, root)))), file.sha256, `immutable accepted bytes: ${file.path}`);
  const cwd = fileURLToPath(root);
  const { NODE_TEST_CONTEXT: parentTestContext, ...env } = process.env;
  const tests = await execute(process.execPath, ["--test", "--test-reporter=tap", "engineering/execution/test/plan/adoption.case.mjs", "engineering/execution/test/adopt.test.mjs"], { cwd, env });
  assert.equal(tests.status, 0, tests.stdout + tests.stderr);
  assert.match(tests.stdout, /# tests 23/);
  assert.match(tests.stdout, /# skipped 0/);
  const mutation = await execute(process.execPath, ["engineering/execution/test/mutations.mjs"], { cwd, env });
  assert.equal(mutation.status, 0, mutation.stdout + mutation.stderr);
  const evidence = JSON.parse(mutation.stdout);
  assert.equal(evidence.independentRed.assertionFailures, 16);
  assert.equal(evidence.results.length, 8);
  assert.ok(evidence.results.every(r => r.status === "killed"));
  console.log(`execution adapter assurance: ${JSON.stringify(evidence)}`);
});

it("Engineering adapter consumes once-packed Testing and preserves real child exits and observations", async () => {
  const host = await install(["kaal-testing", "kaal-hosting"]);
  const script = `
    import assert from "node:assert/strict";
    import { execute } from "kaal-hosting";
    import * as testing from "kaal-testing/duplicates";
    import { run } from ${JSON.stringify(new URL("engineering/execution/adopt.mjs", root).href)};
    // Only the repository mechanism is imported by absolute URL. Testing and
    // Hosting resolve from this fresh installed host; no workspace fallback.
    assert.ok(import.meta.resolve("kaal-testing/duplicates").startsWith(new URL("./node_modules/", import.meta.url).href));
    const file = { path: "controlled-child", sha256: "1".repeat(64) };
    const context = { mode: "reuse", platform: process.platform, node: process.version };
    const requests = ["a", "b"].map(id => ({ id, owner: "controlled acceptance fixture", entrypoint: "controlled original child", files: [file], subject: "a".repeat(64), platform: process.platform, node: process.version }));
    for (const [outcome, exit, complete] of [["passed", 0, true], ["failed", 1, true], ["unknown", 2, false]]) {
      let starts = 0;
      const spawn = async () => {
        starts++;
        const child = await execute(process.execPath, ["-e", 'console.log(JSON.stringify({outcome:' + JSON.stringify(outcome) + ',exit:' + exit + ',complete:' + complete + ',cases:[{id:"controlled/T1",outcome:' + JSON.stringify(outcome) + '}],events:[],provenance:{pid:process.pid}}));process.exit(' + exit + ')'], { cwd: process.cwd() });
        assert.equal(child.status, exit);
        const observation = JSON.parse(child.stdout);
        assert.equal(observation.exit, child.status);
        return observation;
      };
      const verdict = Object.freeze({ result: outcome, exit });
      const ports = { testing, authorize: () => ({ source: "controlled test grant" }), qualify: q => ({ domain: "controlled fixture domain", request: { by: q.id, files: q.files, subject: q.subject, platform: q.platform, node: q.node } }), execute: spawn, original: spawn, evaluate: () => verdict, publish: () => {} };
      const report = await run({ requests, context }, ports);
      assert.equal(starts, 1);
      assert.strictEqual(report.verdict, verdict);
      const original = report.executions[0].observation;
      assert.strictEqual(report.requestResults[0].observations[0], original);
      assert.strictEqual(report.requestResults[1].observations[0], original);
      assert.equal(original.outcome, outcome);
      assert.deepEqual(original.cases, [{ id: "controlled/T1", outcome }]);
      assert.equal(original.complete, complete);
      assert.ok(Number.isInteger(original.provenance.pid));
      // With no grant even identical requests acquire their own child results.
      starts = 0; ports.authorize = () => undefined;
      const refused = await run({ requests, context }, ports);
      assert.equal(starts, 2);
      assert.equal(refused.mode, "original");
      assert.strictEqual(refused.verdict, verdict);
      assert.notStrictEqual(refused.requestResults[0].observations[0], refused.requestResults[1].observations[0]);
    }
    console.log("packed Engineering transport fixtures passed on " + process.platform);
  `;
  const result = await execute(process.execPath, ["--input-type=module", "-e", script], { cwd: host });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /packed Engineering transport fixtures passed/);
});
