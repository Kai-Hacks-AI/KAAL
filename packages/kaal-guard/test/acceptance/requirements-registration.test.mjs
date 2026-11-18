// kaal-guard outer acceptance, Requirements verification, part 5: registration inside a declared folder (guard/F49).
// kaal-guard is opt-in: it guards only folders that have a kaal-guard.json. Each Case runs this package's Guard in a scratch repository.
import assert from "node:assert/strict";
import { test } from "node:test";
import { AREA, baseline, cleanup, commit, hook, kg, ran, rev, scratch, scripts } from "./discovery-support.mjs";

test("guard/T217 [guard/F49, guard/A21]: inside a folder that has a kaal-guard.json, a changed file that none of its checks cover is a fail that names it and says where to register, the selected checks still run, and a folder with no declaration is not judged", () => {
  const dir = scratch({
    ...baseline, ...scripts("alpha"),
    "packages/kaal-alpha/kaal-guard.json": kg({ id: "alpha", when: ["lib/**"] }),
  });
  try {
    const base = rev(dir, "HEAD");
    // Not Guard's business: no kaal-guard.json above these, so they are neither judged nor refused.
    commit(dir, { "README.md": "x\n", ".github/workflows/x.yml": "x\n", ".githooks/pre-push": "x\n", [`${AREA}/notes.md`]: "x\n", "packages/kaal-orphan/notes.md": "x\n", "packages/kaal-alpha/lib/a.mjs": "x\n" });
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

test("guard/T219 [guard/F49, guard/F45]: a repository with no kaal-guard.json behaves as before, and an unknown selection runs everything and says that registration was not judged", () => {
  // No kaal-guard.json anywhere: the run says nothing about ownership and passes.
  const bare = scratch({ ...baseline });
  try {
    const base = rev(bare, "HEAD");
    commit(bare, { "anything/at/all.md": "x\n" });
    const r = hook(bare, base);
    assert.equal(r.status, 0, `a repository that never adopted kaal-guard.json was refused: ${r.out}`);
    assert.ok(!/registration/i.test(r.out), `a repository that never adopted kaal-guard.json heard about registration: ${r.out}`);
  } finally { cleanup(bare); }
  // An unknown selection (--full): every file runs, ownership is not judged, and the run says so.
  const dir = scratch({ ...baseline, ...scripts("alpha"), "packages/kaal-alpha/kaal-guard.json": kg({ id: "alpha", when: ["lib/**"] }) });
  try {
    const base = rev(dir, "HEAD");
    commit(dir, { "packages/kaal-alpha/notes.md": "x\n" });
    const r = hook(dir, base, ["--full"]);
    assert.deepEqual(ran(r, ["alpha"]), ["alpha"], `an unknown selection did not run every kaal-guard.json: ${r.out}`);
    assert.equal(r.status, 0, `an unknown selection was refused for registration: ${r.out}`);
    assert.match(r.out, /registration[^\n]*not judged/i, `it does not say that registration was not judged: ${r.out}`);
  } finally { cleanup(dir); }
});

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
