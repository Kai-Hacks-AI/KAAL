import assert from "node:assert/strict";
import { test } from "node:test";
import { DELIVERY, baseline, cleanup, commit, delivery, hook, kg, ran, rev, scratch, scripts } from "./support.mjs";

test("guard/T217 [guard/F49, guard/A21]: a Solution or Change file that no kaal-guard.json covers is a fail that names it and says where to register, the selected checks still run, and Delivery paths are neither owned nor refused", () => {
  const dir = scratch({
    ...baseline, ...scripts("alpha"),
    [DELIVERY]: delivery("engineering/release-management"),
    "packages/kaal-alpha/kaal-guard.json": kg("alpha"),
  });
  try {
    const base = rev(dir, "HEAD");
    // Delivery: a root file, a workflow, a hook, a .kaal file and a listed engineering area. Not judged, so not refused.
    commit(dir, {
      "README.md": "x\n", ".github/workflows/x.yml": "x\n", ".githooks/pre-push": "x\n", ".kaal/config/note.md": "x\n",
      "engineering/release-management/wire.md": "x\n", "packages/kaal-alpha/README.md": "x\n",
    });
    let r = hook(dir, base);
    assert.equal(r.status, 0, `Delivery paths were refused: ${r.out}`);
    assert.ok(!/ownership/i.test(r.out), `Delivery paths were judged for ownership: ${r.out}`);
    assert.deepEqual(ran(r, ["alpha"]), ["alpha"], `the package file did not select its check: ${r.out}`);
    // Solution with no owner: a package without a kaal-guard.json, and an engineering area that is not listed as Delivery.
    const base2 = rev(dir, "HEAD");
    commit(dir, { "packages/kaal-orphan/notes.md": "x\n", "engineering/other/notes.md": "x\n", "packages/kaal-alpha/lib/a.mjs": "x\n" });
    r = hook(dir, base2);
    assert.notEqual(r.status, 0, `an unowned file passed: ${r.out}`);
    assert.match(r.out, /ownership/, `the fail is not about ownership: ${r.out}`);
    assert.ok(r.out.includes("packages/kaal-orphan/notes.md"), `the unowned package file is not named: ${r.out}`);
    assert.ok(r.out.includes("engineering/other/notes.md"), `the unlisted engineering area is not named: ${r.out}`);
    assert.match(r.out, /register/i, `it does not say where to register: ${r.out}`);
    assert.ok(r.out.includes("kaal-guard.json"), `it does not name the file to write: ${r.out}`);
    assert.deepEqual(ran(r, ["alpha"]), ["alpha"], `the selected checks did not run beside the fail: ${r.out}`);
  } finally { cleanup(dir); }
});
