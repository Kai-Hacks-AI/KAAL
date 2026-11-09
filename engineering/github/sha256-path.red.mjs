// Engineering RED Cases: Foundation's one SHA-256 moves with the package layout, and the judge, which reads it from the
// target's tip, must find it at the new path and still at the old one. Static: the Cases read sources, they run nothing.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const NEW = "packages/kaal-foundation/05-src/skills/kaal-foundation/scripts/sha256.mjs";
const OLD = "packages/kaal-foundation/lib/sha256.mjs";

describe("Foundation's SHA-256 path in the Change Isolation judge", () => {
  const script = read("engineering/github/change-isolation.sh");
  it("T1 (RED until the fix): the wrapper reads the new path from the target's tip", () => {
    assert.ok(script.includes(`$BASE:${NEW}`), "change-isolation.sh does not read the new layout path");
  });
  it("T2 (control): the wrapper still reads the old path, and tries the new one first", () => {
    const o = script.indexOf(`$BASE:${OLD}`);
    assert.ok(o >= 0, "the old path is no longer read");
    const n = script.indexOf(`$BASE:${NEW}`);
    assert.ok(n < 0 || n < o, "the new path must be tried before the old one");
  });
  it("T3 (RED until the fix): no Engineering test requires the old path to exist", () => {
    for (const f of ["engineering/change-isolation/carried-entry.test.mjs", "engineering/guard/acceptance/package.test.mjs", "engineering/github/handler-deferred.red.mjs"]) {
      const s = read(f);
      assert.ok(s.includes(NEW), `${f} does not know the new layout path`);
    }
  });
});
