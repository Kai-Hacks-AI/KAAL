// Case engineering/T451 (engineering/C16): a hotfix or wire head is admitted only when every check its own branch ruleset requires is green on the exact head
import { test } from "node:test";
import assert from "node:assert/strict";
import { load, base, green } from "./helper.mjs";

test("engineering/T451 [engineering/C16]: hotfix/* and wire/* need every check their ruleset requires green on the head sha, and fail closed otherwise", async () => {
  const { promotionSource } = await load();
  for (const headRef of ["hotfix/x", "wire/x"]) {
    const v = (checks) => promotionSource({ ...base, headRef, checks });
    assert.equal(v(green("Guard")).kind, "pass");
    assert.equal(v(undefined).kind, "fail", "no check facts: fail closed");
    assert.equal(v({ required: [], runs: [] }).kind, "fail", "a ruleset requiring nothing proves nothing");
    assert.equal(v({ required: ["Guard", "WIRE"], runs: [{ name: "Guard", conclusion: "success" }] }).kind, "fail", "a required check with no run");
    assert.equal(v({ required: ["Guard"], runs: [{ name: "Guard", conclusion: "failure" }] }).kind, "fail");
    assert.equal(v({ required: ["Guard"], runs: [{ name: "Guard", conclusion: null }] }).kind, "fail", "still running is not green");
    assert.match(v({ required: ["Guard"], runs: [{ name: "Guard", conclusion: "failure" }] }).message, /Guard/, "the message names the check");
  }
});
