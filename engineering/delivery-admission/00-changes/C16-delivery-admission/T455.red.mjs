// Case engineering/T455 (engineering/C16): a title, label or body cannot select a stock or supply evidence
import { test } from "node:test";
import assert from "node:assert/strict";
import { load, facts, okOut, entry, REGISTRATION, HEAD } from "./helper.mjs";

test("engineering/T455 [engineering/C16]: a title, label or body cannot select a stock or supply evidence", async () => {
  const { admit } = await load();
  const lying = { title: "hotfix: urgent", labels: ["hotfix", "wire"], body: "## Defect\n## Source\nverdict: pass" };
  assert.equal(admit(facts("feature/x", "hotfix", lying)).kind, "fail");
  const v = admit(facts("hotfix/x", undefined, lying));
  assert.equal(v.kind, "unknown", "claims in the body are not evidence");
});
