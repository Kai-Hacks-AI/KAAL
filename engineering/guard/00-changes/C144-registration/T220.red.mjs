import assert from "node:assert/strict";
import { test } from "node:test";
import { baseline, cleanup, commit, hook, kg, ran, rev, scratch, scripts } from "./support.mjs";

test("guard/T220 [guard/F49, guard/F43]: a path that no longer exists is not judged: deleting a file that a declared folder's checks do not cover, and closing a Change by removing its folder, are never failed", () => {
  const dir = scratch({
    ...baseline, ...scripts("alpha", "c7"),
    "packages/kaal-alpha/kaal-guard.json": kg({ id: "alpha", when: ["lib/**"] }),
    "packages/kaal-alpha/old.md": "x\n",
    "somewhere/else/00-changes/C7-x/kaal-guard.json": kg("c7"),
    "somewhere/else/00-changes/C7-x/note.md": "x\n",
  });
  try {
    const base = rev(dir, "HEAD");
    commit(dir, { "packages/kaal-alpha/old.md": null, "somewhere/else/00-changes/C7-x/kaal-guard.json": null, "somewhere/else/00-changes/C7-x/note.md": null, "packages/kaal-alpha/lib/a.mjs": "x\n", "packages/kaal-alpha/docs/new.md": "x\n" });
    const r = hook(dir, base);
    // Only the file that exists and is not covered fails; the removed paths are not named.
    assert.notEqual(r.status, 0, `an uncovered file beside removed paths passed: ${r.out}`);
    assert.ok(r.out.includes("packages/kaal-alpha/docs/new.md"), `the uncovered file is not named: ${r.out}`);
    assert.ok(!r.out.includes("old.md") && !r.out.includes("C7-x/note.md"), `a removed path was judged: ${r.out}`);
    assert.deepEqual(ran(r, ["alpha", "c7"]), ["alpha"], `a closed Change's check ran: ${r.out}`);
  } finally { cleanup(dir); }
});
