import assert from "node:assert/strict";
import { test } from "node:test";
import { baseline, cleanup, commit, hook, kg, ran, rev, scratch, scripts } from "./support.mjs";

test("guard/T221 [guard/F49]: no empty registrations: a kaal-guard.json that declares no check is a fail naming the file, for a changed file in its folder and for a full run, and the registered checks still run beside it", () => {
  const dir = scratch({ ...baseline, ...scripts("alpha"), "packages/kaal-empty/kaal-guard.json": kg(), "packages/kaal-alpha/kaal-guard.json": kg("alpha") });
  try {
    const base = rev(dir, "HEAD");
    commit(dir, { "packages/kaal-empty/notes.md": "x\n" });
    let r = hook(dir, base);
    assert.notEqual(r.status, 0, `an empty registration passed: ${r.out}`);
    assert.ok(r.out.includes("packages/kaal-empty/kaal-guard.json"), `the empty registration is not named: ${r.out}`);
    assert.match(r.out, /no check|empty|at least one/i, `it does not say that a registration needs a check: ${r.out}`);
    const base2 = rev(dir, "HEAD");
    commit(dir, { "packages/kaal-alpha/notes.md": "x\n" });
    r = hook(dir, base2, ["--full"]);
    assert.notEqual(r.status, 0, `a full run passed with an empty registration: ${r.out}`);
    assert.ok(r.out.includes("packages/kaal-empty/kaal-guard.json"), `a full run did not name the empty registration: ${r.out}`);
    assert.deepEqual(ran(r, ["alpha"]), ["alpha"], `the registered check did not run beside the fail: ${r.out}`);
  } finally { cleanup(dir); }
});
