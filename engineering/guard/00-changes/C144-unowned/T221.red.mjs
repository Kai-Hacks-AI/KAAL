import assert from "node:assert/strict";
import { test } from "node:test";
import { DELIVERY, baseline, cleanup, commit, delivery, hook, rev, scratch } from "./support.mjs";

test("guard/T221 [guard/F49]: the list of Delivery areas is read from the base, so a change cannot exempt its own files by editing it, and a listing that main already has takes effect", () => {
  const dir = scratch({ ...baseline, [DELIVERY]: delivery("engineering/release-management"), "packages/kaal-alpha/kaal-guard.json": JSON.stringify({ checks: [] }) });
  try {
    const base = rev(dir, "HEAD");
    // The candidate lists its own area and changes a file in it, in one push.
    commit(dir, { [DELIVERY]: delivery("engineering/release-management", "engineering/sneaky"), "engineering/sneaky/x.md": "x\n" });
    const r = hook(dir, base);
    assert.notEqual(r.status, 0, `a change exempted its own files by editing the Delivery list: ${r.out}`);
    assert.ok(r.out.includes("engineering/sneaky/x.md"), `the file the change tried to exempt is not named: ${r.out}`);
    // Once the base has the listing, the same file is Delivery and is not judged.
    const base2 = rev(dir, "HEAD");
    commit(dir, { "engineering/sneaky/y.md": "x\n" });
    const r2 = hook(dir, base2);
    assert.equal(r2.status, 0, `a listing in the base was not honoured: ${r2.out}`);
  } finally { cleanup(dir); }
});
