// Case engineering/T451 (engineering/C16): a head is GREEN only when every check its ruleset requires has a successful latest run on the exact head
import assert from "node:assert/strict";
import { load, base, green, need, mk } from "./helper.mjs";

export const id = "engineering/T451";
export const tests = ["engineering/C16"];
export const title = "GREEN means every required check's newest run on the head succeeded; empty, missing, failed or running fails closed and names the check";
export async function run() {
  const { promotionSource } = await load();
  for (const headRef of ["kaal/a/b", "hotfix/x", "wire/x"]) {
    const v = (checks) => promotionSource({ ...base, headRef, checks });
    assert.equal(v(green("Guard")).kind, "pass");
    assert.equal(v({ required: [], runs: [] }).kind, "fail", "a ruleset requiring nothing proves nothing");
    assert.equal(v({ required: need("Guard", "WIRE"), runs: [mk("Guard")] }).kind, "fail", "a required check with no run");
    assert.equal(v({ required: need("Guard"), runs: [mk("Guard", null)] }).kind, "fail", "still running is not green");
    const f = v({ required: need("Guard"), runs: [mk("Guard", "failure")] });
    assert.equal(f.kind, "fail");
    assert.match(f.message, /Guard/, "the message names the check");
  }
}
