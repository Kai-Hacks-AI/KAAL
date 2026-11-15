// Case engineering/T458 (engineering/C16): admission shares the registry with pull but never reads the auto-pull opt-in: a judge-pulled candidate is admissible, an auto-pulled one still needs evidence
import { test } from "node:test";
import assert from "node:assert/strict";
import { load, facts, okOut, REGISTRY, HEAD } from "./helper.mjs";

test("engineering/T458 [engineering/C16]: admission shares the registry with pull but never reads the auto-pull opt-in: a judge-pulled candidate is admissible, an auto-pulled one still needs evidence", async () => {
  const { admit } = await load();
  assert.ok(!REGISTRY.stocks.some((s) => s.capability === "retro"));
  assert.equal(admit(facts("kaal/retro/skill", "KAAL")).kind, "pass", "not registered for auto-pull, still admissible");
  assert.equal(admit(facts("kaal/release/pull-lane", undefined)).kind, "unknown", "registered for auto-pull, still needs OUT evidence");
  const stripped = { ...REGISTRY, stocks: [], classRoutes: REGISTRY.classRoutes };
  assert.equal(admit(facts("kaal/release/pull-lane", "KAAL", { registry: stripped })).kind, "pass", "the stocks registrations are not an admission input");
});
