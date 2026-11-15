// Case engineering/T451 (engineering/C16): a head is GREEN only when every check its ruleset requires has a successful latest run on the exact head
import { test } from "node:test";
import assert from "node:assert/strict";
import { load, base, green, need, run } from "./helper.mjs";

test("engineering/T451 [engineering/C16]: GREEN means every required check has a successful latest completed run; empty, missing, failed or running fails closed and names the check", async () => {
  const { promotionSource } = await load();
  for (const headRef of ["kaal/a/b", "hotfix/x", "wire/x"]) {
    const v = (checks) => promotionSource({ ...base, headRef, checks });
    assert.equal(v(green("Guard")).kind, "pass");
    assert.equal(v({ required: [], runs: [] }).kind, "fail", "a ruleset requiring nothing proves nothing");
    assert.equal(v({ required: need("Guard", "WIRE"), runs: [run("Guard")] }).kind, "fail", "a required check with no run");
    assert.equal(v({ required: need("Guard"), runs: [run("Guard", null)] }).kind, "fail", "still running is not green");
    const f = v({ required: need("Guard"), runs: [run("Guard", "failure")] });
    assert.equal(f.kind, "fail");
    assert.match(f.message, /Guard/, "the message names the check");
  }
});
