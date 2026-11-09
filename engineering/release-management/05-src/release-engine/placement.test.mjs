// release-management/T11 (F1, F2, F3): the Release engine's home is this component; the old path holds only shims until release.yml is rewired.
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OLD = join(HERE, "../../../release");

describe("release-management/T11 the Release engine is placed in its component", () => {
  it("the engine, its runner and its Cases are in this component", () => {
    for (const f of ["release.mjs", "run.mjs", "release.test.mjs"]) assert.ok(existsSync(join(HERE, f)), f);
  });
  it("the old folder holds only the two shims", () => {
    assert.deepEqual(readdirSync(OLD).sort(), ["release.mjs", "run.mjs"]);
    assert.match(readFileSync(join(OLD, "release.mjs"), "utf8"), /export \* from "\.\.\/release-management\/05-src\/release-engine\/release\.mjs"/);
    assert.match(readFileSync(join(OLD, "run.mjs"), "utf8"), /import \{ main \} from "\.\.\/release-management\/05-src\/release-engine\/run\.mjs"/);
  });
});
