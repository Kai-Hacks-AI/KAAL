// Case engineering/T450 (engineering/C16): main admits the three delivery stocks and nothing else, and every stock needs GREEN: no exception for kaal collectors
import assert from "node:assert/strict";
import { load, base, green, need, mk } from "./helper.mjs";

export const id = "engineering/T450";
export const tests = ["engineering/C16"];
export const title = "kaal/<capability>/*, hotfix/* and wire/* are admitted only with their ruleset's checks green; every other branch and any fork fails";
export async function run() {
  const { promotionSource } = await load();
  const ok = green("Guard", "Hosting (Linux)");
  for (const headRef of ["kaal/release/pull-lane", "hotfix/x", "wire/githooks-split"]) {
    assert.equal(promotionSource({ ...base, headRef, checks: ok }).kind, "pass", headRef);
    assert.equal(promotionSource({ ...base, headRef }).kind, "fail", `${headRef}: no check facts, no admission`);
    assert.equal(promotionSource({ ...base, headRef, checks: { required: need("Engineering"), runs: [mk("Engineering", "failure")] } }).kind, "fail", `${headRef}: RED is not OUT-ready`);
  }
  assert.equal(promotionSource({ ...base, headRef: "kaal/x", checks: ok }).kind, "fail", "kaal/<capability>/*: a bare kaal/<name> is not a collector");
  assert.equal(promotionSource({ ...base, headRef: "claude/z", checks: ok }).kind, "fail", "every other branch is development stock, not deliverable");
  assert.equal(promotionSource({ ...base, headRef: "hotfix/x", headRepo: "fork/r", checks: ok }).kind, "fail", "a fork is never admitted");
  assert.equal(promotionSource({ ...base, baseRef: "kaal/y", headRef: "wire/x", checks: ok }).kind, "not-applicable");
}
