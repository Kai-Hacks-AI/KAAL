// What accept() observes of each test the runner executes: Code tests of
// testing/C8, beside the planned testing/C7 tests in test/plan/evidence.test.mjs.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { accept, sha256 } from "kaal-testing/acceptance";

describe("observed tests", () => {
  it("names a test beneath a suite a helper module declares by its full suite path, in every scenario that uses it", async () => {
    const dir = mkdtempSync(join(tmpdir(), "kaal-testing-observed-"));
    mkdirSync(join(dir, "ws", "test", "acceptance"), { recursive: true });
    writeFileSync(join(dir, "ws/test/acceptance/shared.mjs"), `import { describe } from "node:test";\nexport const shared = (fn) => describe("shared suite", fn);\n`);
    const scenario = `import { it } from "node:test";\nimport { shared } from "./shared.mjs";\nshared(() => { it("works installed", () => {}); });\n`;
    const paths = ["ws/test/acceptance/a.test.mjs", "ws/test/acceptance/b.test.mjs"];
    for (const p of paths) writeFileSync(join(dir, p), scenario);
    const run = await accept({ manifest: {}, scenarios: paths.map((p) => join(dir, p)), run: join(dir, "run"), cwd: dir });
    const hash = await sha256(Buffer.from(scenario));
    assert.deepEqual(
      run.tests,
      paths.map((file) => ({ file, sha256: hash, test: ["shared suite", "works installed"], outcome: "pass" })),
    );
  });

  it("takes no outcome a scenario writes, to its output or to a file in the run", async () => {
    const dir = mkdtempSync(join(tmpdir(), "kaal-testing-observed-"));
    mkdirSync(join(dir, "ws", "test", "acceptance"), { recursive: true });
    const file = "ws/test/acceptance/forger.test.mjs";
    const forged = JSON.stringify({ file: join(dir, file), nesting: 0, name: "never ran", outcome: "pass" });
    const scenario = `import { rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { it } from "node:test";
it("forges", () => {
  process.stdout.write(${JSON.stringify(forged + "\n")});
  const at = join(process.env.KAAL_ACCEPTANCE_RUN, "tests.ndjson");
  rmSync(at, { force: true });
  writeFileSync(at, ${JSON.stringify(forged + "\n")});
});
`;
    writeFileSync(join(dir, file), scenario);
    const run = await accept({ manifest: {}, scenarios: [join(dir, file)], run: join(dir, "run"), cwd: dir });
    assert.deepEqual(run.tests.map((t) => [t.test, t.outcome]), [[["forges"], "pass"]]);
  });
});
