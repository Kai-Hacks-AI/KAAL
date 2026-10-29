// testing/C23 planned outer tests: which script coverage runs.
// Immutable to DO and CHECK; the DO of testing/C23 turns them GREEN. Each
// title names the contracts it checks (plan/coverage/*.md). They use
// kaal-testing's public interface only, on a fixture npm workspace built in a
// fresh temporary directory.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { cover } from "kaal-testing/coverage";

/**
 * A root with one workspace `w`: `w/a.mjs` is delivered. Its `test` script
 * fails and executes nothing, and its `test:publisher` script exercises
 * `a.mjs` and passes, so which script ran shows in the result.
 */
function fixture(scripts = { test: "node -e \"process.exit(1)\"", "test:publisher": "node a.test.mjs" }) {
  const root = mkdtempSync(join(tmpdir(), "kaal-testing-c23-"));
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "c23-root", private: true, workspaces: ["w"] }));
  mkdirSync(join(root, "w"));
  writeFileSync(join(root, "w", "package.json"), JSON.stringify({ name: "w", private: true, type: "module", scripts }));
  writeFileSync(join(root, "w", "a.mjs"), "export const twice = (n) => n * 2;\n");
  writeFileSync(join(root, "w", "a.test.mjs"), "import { twice } from './a.mjs';\nif (twice(2) !== 4) process.exit(1);\n");
  const dir = join(root, "report");
  mkdirSync(dir);
  return { root, dir };
}

describe("The script coverage runs (testing/C23)", () => {
  it("testing/T42 [testing/F34]: cover runs the script the caller names, and `test` when it names none", async () => {
    const named = fixture();
    const r = await cover("w", ["w/a.mjs"], { ...named, script: "test:publisher" });
    assert.equal(r.failed, undefined, `the named script's run is measured: ${r.failed}`);
    assert.equal(r.tests, "pass", "the named script ran, not `test`");
    assert.deepEqual(r.unexecuted, [], "the named script executed the delivered file");
    const plain = fixture();
    assert.equal((await cover("w", ["w/a.mjs"], plain)).tests, "fail", "with no script named, `test` runs, as before");
  });

  it("testing/T43 [testing/F34]: a named script the workspace does not declare is a failed measurement, never a passing run", async () => {
    const missing = fixture({ test: "node a.test.mjs" });
    const r = await cover("w", ["w/a.mjs"], { ...missing, script: "test:publisher" });
    assert.notEqual(r.tests, "pass", "an absent script never passes");
    assert.match(r.failed ?? "", /test:publisher/, "the failure names the script");
    assert.equal(r.lines, undefined, "no coverage is reported for a run that did not happen");
  });

  it("testing/T44 [testing/F34]: a script option that is not a script name is refused before anything runs", async () => {
    for (const script of ["", 7, "--if-present", "test publisher", null]) {
      const f = fixture();
      const r = await cover("w", ["w/a.mjs"], { ...f, script });
      assert.match(r.failed ?? "", /script/, `${JSON.stringify(script)} is refused`);
      assert.equal(r.tests, undefined, `${JSON.stringify(script)} runs nothing`);
      assert.equal(r.lines, undefined);
    }
  });
});
