import assert from "node:assert/strict";
import { test } from "node:test";
import { baseline, cleanup, commit, hook, kg, ran, rev, scratch, scripts } from "./support.mjs";

test("guard/T217 [guard/F49, guard/A21]: inside a folder that has a kaal-guard.json, a changed file that none of its checks cover is a fail that names it and says where to register, the selected checks still run, and a folder with no declaration is not judged", () => {
  const dir = scratch({
    ...baseline, ...scripts("alpha"),
    "packages/kaal-alpha/kaal-guard.json": kg({ id: "alpha", when: ["lib/**"] }),
  });
  try {
    const base = rev(dir, "HEAD");
    // Not Guard's business: no kaal-guard.json above these, so they are neither judged nor refused.
    commit(dir, { "README.md": "x\n", ".github/workflows/x.yml": "x\n", ".githooks/pre-push": "x\n", "engineering/area/notes.md": "x\n", "packages/kaal-orphan/notes.md": "x\n", "packages/kaal-alpha/lib/a.mjs": "x\n" });
    let r = hook(dir, base);
    assert.equal(r.status, 0, `files in folders with no declaration were judged or refused: ${r.out}`);
    assert.ok(!/registration/i.test(r.out), `files in folders with no declaration were mentioned: ${r.out}`);
    assert.deepEqual(ran(r, ["alpha"]), ["alpha"], `the covered file did not select its check: ${r.out}`);
    // Inside the declared folder, a file that no check covers fails, naming the file and where to register.
    const base2 = rev(dir, "HEAD");
    commit(dir, { "packages/kaal-alpha/docs/guide.md": "x\n", "packages/kaal-alpha/lib/b.mjs": "x\n" });
    r = hook(dir, base2);
    assert.notEqual(r.status, 0, `a file inside a declared folder that no check covers passed: ${r.out}`);
    assert.match(r.out, /registration/, `the fail is not about registration: ${r.out}`);
    assert.ok(r.out.includes("packages/kaal-alpha/docs/guide.md"), `the uncovered file is not named: ${r.out}`);
    assert.ok(!/registration[^\n]*lib\/b\.mjs/.test(r.out), `a covered file was named as uncovered: ${r.out}`);
    assert.match(r.out, /register|when/i, `it does not say where to register: ${r.out}`);
    assert.ok(r.out.includes("kaal-guard.json"), `it does not name the file to change: ${r.out}`);
    assert.deepEqual(ran(r, ["alpha"]), ["alpha"], `the selected checks did not run beside the fail: ${r.out}`);
  } finally { cleanup(dir); }
});
