import assert from "node:assert/strict";
import { test } from "node:test";
import { ROOT_WHEN, baseline, cleanup, commit, hook, kg, ran, rev, scratch, scripts } from "./support.mjs";

test("guard/T217 [guard/F49, guard/A21]: a changed file that no kaal-guard.json covers is a fail that names it and says where to register, the selected checks still run, and the root file owns root and delivery-tooling files", () => {
  const dir = scratch({
    ...baseline, ...scripts("alpha", "root"),
    "kaal-guard.json": kg({ id: "root", when: ROOT_WHEN }),
    "packages/kaal-alpha/kaal-guard.json": kg("alpha"),
  });
  try {
    const base = rev(dir, "HEAD");
    // Owned: a package file, a root file, a workflow and a hook. Nothing is refused.
    commit(dir, { "packages/kaal-alpha/README.md": "x\n", "README.md": "x\n", ".github/workflows/x.yml": "x\n", ".githooks/pre-push": "x\n" });
    let r = hook(dir, base);
    assert.deepEqual(ran(r, ["alpha", "root"]), ["alpha", "root"], `owned files did not select their checks: ${r.out}`);
    assert.equal(r.status, 0, `owned files were refused: ${r.out}`);
    // Unowned: no kaal-guard.json above it, and the root file does not cover packages/.
    const base2 = rev(dir, "HEAD");
    commit(dir, { "packages/kaal-orphan/notes.md": "x\n", "packages/kaal-alpha/lib/a.mjs": "x\n" });
    r = hook(dir, base2);
    assert.notEqual(r.status, 0, `an unowned file passed: ${r.out}`);
    assert.match(r.out, /ownership/, `the fail is not about ownership: ${r.out}`);
    assert.ok(r.out.includes("packages/kaal-orphan/notes.md"), `the unowned file is not named: ${r.out}`);
    assert.ok(!r.out.includes("packages/kaal-alpha/lib/a.mjs") || !/ownership[^\n]*kaal-alpha\/lib/.test(r.out), `an owned file was named as unowned: ${r.out}`);
    assert.match(r.out, /register/i, `it does not say where to register: ${r.out}`);
    assert.ok(r.out.includes("kaal-guard.json"), `it does not name the file to write: ${r.out}`);
    assert.deepEqual(ran(r, ["alpha", "root"]), ["alpha"], `the selected checks did not run beside the fail: ${r.out}`);
  } finally { cleanup(dir); }
});
