import assert from "node:assert/strict";
import { test } from "node:test";
import { DELIVERY, KAAL_DELIVERY, baseline, cleanup, commit, delivery, hook, kg, rev, scratch, scripts } from "./support.mjs";

test("guard/T222 [guard/F49]: Guard names no Delivery path of its own: with none declared, .github and .githooks are Solution with no owner, and the declaration is read from the base, so a change cannot exempt its own files by editing it", () => {
  // A project that declares nothing: no path is Delivery.
  const bare = scratch({ ...baseline, ...scripts("alpha"), "packages/kaal-alpha/kaal-guard.json": kg("alpha") });
  try {
    const base = rev(bare, "HEAD");
    commit(bare, { ".github/workflows/x.yml": "x\n", ".githooks/pre-push": "x\n" });
    const r = hook(bare, base);
    assert.notEqual(r.status, 0, `Guard treated .github or .githooks as Delivery without being told: ${r.out}`);
    assert.ok(r.out.includes(".github/workflows/x.yml"), `the undeclared .github file is not named: ${r.out}`);
  } finally { cleanup(bare); }
  // The declaration is the base's. A push that adds a path to it and changes a file there is still judged.
  const dir = scratch({ ...baseline, ...scripts("alpha"), [DELIVERY]: KAAL_DELIVERY, "packages/kaal-alpha/kaal-guard.json": kg("alpha") });
  try {
    const base = rev(dir, "HEAD");
    commit(dir, { [DELIVERY]: delivery(".github/**", ".githooks/**", ".kaal/**", "*", "engineering/sneaky/**"), "engineering/sneaky/x.md": "x\n" });
    const r = hook(dir, base);
    assert.notEqual(r.status, 0, `a change exempted its own files by editing the Delivery declaration: ${r.out}`);
    assert.ok(r.out.includes("engineering/sneaky/x.md"), `the file the change tried to exempt is not named: ${r.out}`);
    // Once the base has the declaration, the same path is Delivery.
    const base2 = rev(dir, "HEAD");
    commit(dir, { "engineering/sneaky/y.md": "x\n" });
    const r2 = hook(dir, base2);
    assert.equal(r2.status, 0, `a declaration in the base was not honoured: ${r2.out}`);
  } finally { cleanup(dir); }
});
