// Case engineering/T452 (engineering/C16): how the latest runs are read: reruns, concurrent runs of the promotion PR, itself, and the right app
import { test } from "node:test";
import assert from "node:assert/strict";
import { load, base, need, run } from "./helper.mjs";

test("engineering/T452 [engineering/C16]: the latest completed run per required check decides; Promotion Source is not its own input; a same-named check from another app does not count", async () => {
  const { promotionSource } = await load();
  const v = (required, runs) => promotionSource({ ...base, headRef: "kaal/a/b", checks: { required, runs } }).kind;
  assert.equal(v(need("Branching"), [run("Branching", "failure"), run("Branching", "success")]), "pass", "a later success after a failure (a rerun) is green");
  assert.equal(v(need("Branching"), [run("Branching", "success"), run("Branching", "failure")]), "fail", "a later failure is red");
  assert.equal(v(need("Guard"), [run("Guard", "success"), run("Guard", null)]), "pass", "a run in progress (the promotion PR's own) does not hide the completed one");
  assert.equal(v(need("Guard", "Promotion Source"), [run("Guard"), run("Promotion Source", null)]), "pass", "the check being judged is not required of the head");
  assert.equal(v(need("Guard"), [run("Guard", "success", { appId: 999 })]), "fail", "the required app's run is what counts");
});
