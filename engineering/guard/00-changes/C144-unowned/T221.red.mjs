import assert from "node:assert/strict";
import { test } from "node:test";
import { AREA, DELIVERY, KAAL_DELIVERY, baseline, cleanup, commit, hook, kg, ran, rev, scratch, scripts } from "./support.mjs";

test("guard/T221 [guard/F49, guard/F43]: an engineering area is Solution and registers through its own kaal-guard.json like a product, and a copy of its content into .github is Delivery that the repository declares and Guard does not judge", () => {
  const dir = scratch({ ...baseline, ...scripts("area"), [DELIVERY]: KAAL_DELIVERY, [`${AREA}/kaal-guard.json`]: kg("area") });
  try {
    const base = rev(dir, "HEAD");
    // The area's own file owns the area's files, and the check runs; the copy in .github is not judged.
    commit(dir, { [`${AREA}/notes.md`]: "x\n", ".github/workflows/area.yml": "x\n", ".githooks/new/pre-push.d/area": "x\n" });
    const r = hook(dir, base);
    assert.equal(r.status, 0, `an engineering area that registered, or its copy into Delivery, was refused: ${r.out}`);
    assert.deepEqual(ran(r, ["area"]), ["area"], `the engineering area's check did not run: ${r.out}`);
    // An area with no kaal-guard.json is Solution with no owner.
    const base2 = rev(dir, "HEAD");
    commit(dir, { "engineering/unregistered/notes.md": "x\n" });
    const r2 = hook(dir, base2);
    assert.notEqual(r2.status, 0, `an engineering area that never registered passed: ${r2.out}`);
    assert.ok(r2.out.includes("engineering/unregistered/notes.md"), `the unregistered area's file is not named: ${r2.out}`);
  } finally { cleanup(dir); }
});
