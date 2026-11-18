import assert from "node:assert/strict";
import { test } from "node:test";
import { baseline, cleanup, commit, hook, kg, ran, rev, scratch, scripts } from "./support.mjs";

test("guard/T218 [guard/F49, guard/A21]: a nested declaration is the declared folder of its own files: a file under a Change's kaal-guard.json is judged against that file's checks, never the enclosing package's", () => {
  const dir = scratch({
    ...baseline, ...scripts("pkg", "chg"),
    "packages/kaal-alpha/kaal-guard.json": kg("pkg"),
    "packages/kaal-alpha/00-changes/C1-x/kaal-guard.json": kg({ id: "chg", when: ["*.mjs"] }),
  });
  try {
    const base = rev(dir, "HEAD");
    commit(dir, { "packages/kaal-alpha/00-changes/C1-x/case.mjs": "x\n" });
    let r = hook(dir, base);
    assert.equal(r.status, 0, `a covered file in the Change folder failed: ${r.out}`);
    assert.deepEqual(ran(r, ["pkg", "chg"]), ["chg"], `the wrong declaration selected: ${r.out}`);
    const base2 = rev(dir, "HEAD");
    commit(dir, { "packages/kaal-alpha/00-changes/C1-x/notes.md": "x\n" });
    r = hook(dir, base2);
    assert.notEqual(r.status, 0, `a file in the Change folder that its own checks do not cover passed because the package's check would: ${r.out}`);
    assert.ok(r.out.includes("packages/kaal-alpha/00-changes/C1-x/notes.md"), `the uncovered Change file is not named: ${r.out}`);
  } finally { cleanup(dir); }
});
