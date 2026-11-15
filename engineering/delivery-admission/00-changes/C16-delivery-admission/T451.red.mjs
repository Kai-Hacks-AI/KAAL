// Case engineering/T451 (engineering/C16): no claiming route, ambiguous claims, or an absent, unaccepted or non-main registry fail closed
import { test } from "node:test";
import assert from "node:assert/strict";
import { load, facts, okQual, REGISTRY, HEAD } from "./helper.mjs";

test("engineering/T451 [engineering/C16]: no claiming route, ambiguous claims, or an absent, unaccepted or non-main registry fail closed", async () => {
  const { admit } = await load();
  assert.equal(admit(facts("feature/x", "HOTFIX")).kind, "fail", "no route claims it");
  const twice = { ...REGISTRY, admission: { ...REGISTRY.admission, OTHER: { qualifier: "o-q", routes: ["hotfix/*"] } } };
  assert.equal(admit(facts("hotfix/x", "HOTFIX", { registry: twice })).kind, "fail", "two stocks claim one route");
  for (const registry of [null, undefined, { ...REGISTRY, accepted: false }, { ...REGISTRY, source: "kaal/release/pull-lane" }, { ...REGISTRY, admission: "x" }]) {
    assert.equal(admit(facts("hotfix/x", "HOTFIX", { registry })).kind, "unknown");
  }
  const noEntry = { ...REGISTRY, admission: { KAAL: REGISTRY.admission.KAAL } };
  assert.equal(admit(facts("hotfix/x", "HOTFIX", { registry: noEntry })).kind, "fail", "a class route without an admission entry has no qualifier");
});
