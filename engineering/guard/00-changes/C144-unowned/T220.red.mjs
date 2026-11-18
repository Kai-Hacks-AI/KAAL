import assert from "node:assert/strict";
import { test } from "node:test";
import { baseline, cleanup, commit, hook, kg, ran, rev, scratch, scripts } from "./support.mjs";

test("guard/T220 [guard/F49, guard/F43]: closing a Change by removing its folder and its kaal-guard.json is not refused, and a file left behind in the closed folder is", () => {
  const dir = scratch({
    ...baseline, ...scripts("alpha", "c7"),
    "packages/kaal-alpha/kaal-guard.json": kg("alpha"),
    "somewhere/else/00-changes/C7-x/kaal-guard.json": kg("c7"),
    "somewhere/else/00-changes/C7-x/note.md": "x\n",
    "somewhere/else/00-changes/C7-x/more.md": "x\n",
  });
  try {
    const base = rev(dir, "HEAD");
    commit(dir, { "somewhere/else/00-changes/C7-x/kaal-guard.json": null, "somewhere/else/00-changes/C7-x/note.md": null, "somewhere/else/00-changes/C7-x/more.md": null, "packages/kaal-alpha/README.md": "x\n" });
    let r = hook(dir, base);
    assert.equal(r.status, 0, `closing a Change was refused for the paths it removed: ${r.out}`);
    assert.deepEqual(ran(r, ["alpha", "c7"]), ["alpha"], `a closed Change's check ran: ${r.out}`);
    // The file left behind is on disk and has no owner once the Change's file is gone.
    const base2 = rev(dir, "HEAD");
    commit(dir, { "somewhere/else/00-changes/C8-y/note.md": "x\n" });
    r = hook(dir, base2);
    assert.notEqual(r.status, 0, `a file with no owner passed: ${r.out}`);
    assert.ok(r.out.includes("somewhere/else/00-changes/C8-y/note.md"), `the file left behind is not named: ${r.out}`);
  } finally { cleanup(dir); }
});
