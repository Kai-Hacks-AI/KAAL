// Case engineering/T452 (engineering/C16): how the latest runs are read: reruns, concurrent runs of the promotion PR, itself, and the right app
import assert from "node:assert/strict";
import { load, base, need, mk } from "./helper.mjs";

export const id = "engineering/T452";
export const tests = ["engineering/C16"];
export const title = "the newest run on the exact head decides (a newer run in progress is not green); Promotion Source is not its own input; a same-named check from another app does not count";
export async function run() {
  const { promotionSource } = await load();
  const v = (required, runs) => promotionSource({ ...base, headRef: "kaal/a/b", checks: { required, runs } }).kind;
  assert.equal(v(need("Branching"), [mk("Branching", "failure"), mk("Branching", "success")]), "pass", "a later success after a failure (a rerun) is green");
  assert.equal(v(need("Branching"), [mk("Branching", "success"), mk("Branching", "failure")]), "fail", "a later failure is red");
  assert.equal(v(need("Guard"), [mk("Guard", "success"), mk("Guard", null)]), "fail", "a newer evaluation still in progress is not green, whatever an earlier run said");
  assert.equal(v(need("Guard"), [mk("Guard", null), mk("Guard", "success")]), "pass", "an older run still showing in progress does not outrank the newer completed one");
  assert.equal(v(need("Guard"), [mk("Guard", "success", { headSha: "b".repeat(40) })]), "fail", "a run on another commit is no evidence for this head");
  assert.equal(v(need("Guard", "Promotion Source"), [mk("Guard"), mk("Promotion Source", null)]), "pass", "the check being judged is not required of the head");
  assert.equal(v(need("Guard"), [mk("Guard", "success", { appId: 999 })]), "fail", "the required app's run is what counts");
}
