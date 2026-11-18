import assert from "node:assert/strict";
import { test } from "node:test";
import { baseline, cleanup, commit, hook, kg, ran, rev, scratch, scripts } from "./support.mjs";

test("guard/T219 [guard/F49, guard/F45]: a repository with no kaal-guard.json behaves as before, and an unknown selection runs everything and says that ownership was not judged", () => {
  // No kaal-guard.json anywhere: the run says nothing about ownership and passes.
  const bare = scratch({ ...baseline });
  try {
    const base = rev(bare, "HEAD");
    commit(bare, { "anything/at/all.md": "x\n" });
    const r = hook(bare, base);
    assert.equal(r.status, 0, `a repository that never adopted kaal-guard.json was refused: ${r.out}`);
    assert.ok(!/ownership/i.test(r.out), `a repository that never adopted kaal-guard.json heard about ownership: ${r.out}`);
  } finally { cleanup(bare); }
  // An unknown selection (--full): every file runs, ownership is not judged, and the run says so.
  const dir = scratch({ ...baseline, ...scripts("alpha"), "packages/kaal-alpha/kaal-guard.json": kg("alpha") });
  try {
    const base = rev(dir, "HEAD");
    commit(dir, { "packages/kaal-orphan/notes.md": "x\n" });
    const r = hook(dir, base, ["--full"]);
    assert.deepEqual(ran(r, ["alpha"]), ["alpha"], `an unknown selection did not run every kaal-guard.json: ${r.out}`);
    assert.equal(r.status, 0, `an unknown selection was refused for ownership: ${r.out}`);
    assert.match(r.out, /ownership[^\n]*not judged/i, `it does not say that ownership was not judged: ${r.out}`);
  } finally { cleanup(dir); }
});
