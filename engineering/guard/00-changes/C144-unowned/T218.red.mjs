import assert from "node:assert/strict";
import { test } from "node:test";
import { baseline, cleanup, commit, hook, kg, ran, rev, scratch, scripts } from "./support.mjs";

test("guard/T218 [guard/F49, guard/A21]: a nearest kaal-guard.json whose checks do not cover the file does not own it, while a covered file beside it passes", () => {
  const dir = scratch({
    ...baseline, ...scripts("lib-only"),
    "packages/kaal-alpha/kaal-guard.json": kg({ id: "lib-only", when: ["lib/**"] }),
  });
  try {
    const base = rev(dir, "HEAD");
    commit(dir, { "packages/kaal-alpha/lib/a.mjs": "x\n" });
    let r = hook(dir, base);
    assert.deepEqual(ran(r, ["lib-only"]), ["lib-only"], `the covered file did not select its check: ${r.out}`);
    assert.equal(r.status, 0, `a covered file was refused: ${r.out}`);
    const base2 = rev(dir, "HEAD");
    commit(dir, { "packages/kaal-alpha/README.md": "x\n" });
    r = hook(dir, base2);
    assert.notEqual(r.status, 0, `a file that the nearest kaal-guard.json does not cover passed: ${r.out}`);
    assert.ok(r.out.includes("packages/kaal-alpha/README.md"), `the uncovered file is not named: ${r.out}`);
    assert.match(r.out, /when/, `it does not say to widen the when: ${r.out}`);
  } finally { cleanup(dir); }
});
