// Case engineering/T455 (engineering/C16): a title, label or body cannot select a stock or supply evidence
import { test } from "node:test";
import assert from "node:assert/strict";
import { load, facts, okQual, REGISTRY, HEAD } from "./helper.mjs";

test("engineering/T455 [engineering/C16]: a title, label or body cannot select a stock or supply evidence", async () => {
  const { admit } = await load();
  const lying = { title: "hotfix: urgent", labels: ["hotfix", "wire"], body: "## Defect\n## Source\nverdict: pass" };
  assert.equal(admit(facts("feature/x", "HOTFIX", lying)).kind, "fail");
  assert.equal(admit(facts("hotfix/x", undefined, lying)).kind, "unknown", "claims in the body are not evidence");
  const inventory = { issues: [{ number: 1, labels: ["ready"] }], pulls: [{ number: 2, state: "open" }] };
  assert.equal(admit(facts("hotfix/x", undefined, inventory)).kind, "unknown", "issue and PR metadata are not readiness");
});
