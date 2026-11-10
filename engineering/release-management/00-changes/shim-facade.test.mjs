// release-management/T12 and T14 (F20): a Change Case of the migration. While a shim stands at an old path, it is a full facade of the
// moved module, and the old folder holds nothing else. Deleted with the shims by the terminate Change.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OLD = join(HERE, "../../release");
const MOVED = join(HERE, "../05-src/release-engine");

describe("release-management/T14 the old folder holds only the shims", () => {
  it("the old folder holds only release.mjs and run.mjs, which point at the moved modules (run.mjs is main's release.yml caller until the workflow rename)", () => {
    assert.deepEqual(readdirSync(OLD).sort(), ["release.mjs", "run.mjs"], "engineering/release/ holds exactly the two shims");
    assert.match(readFileSync(join(OLD, "run.mjs"), "utf8"), /import \{ main \} from "\.\.\/release-management\/05-src\/release-engine\/run\.mjs"/);
    assert.match(readFileSync(join(OLD, "release.mjs"), "utf8"), /export \* from "\.\.\/release-management\/05-src\/release-engine\/release\.mjs"/);
  });
});

describe("release-management/T12 a shim is a full facade of the moved module", () => {
  for (const f of ["release.mjs"]) {
    it(`the shim ${f} exports exactly what the moved module exports`, async () => {
      const old = await import(join(OLD, f));
      const moved = await import(join(MOVED, f));
      assert.deepEqual(Object.keys(old).sort(), Object.keys(moved).sort());
      for (const k of Object.keys(moved)) assert.equal(old[k], moved[k], k);
    });
  }
});
