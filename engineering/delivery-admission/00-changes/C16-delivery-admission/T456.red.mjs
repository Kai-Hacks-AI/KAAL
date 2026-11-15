// Case engineering/T456 (engineering/C16): migration is explicit: only an accepted migration entry applies the legacy rule, and the verdict reports it
import { test } from "node:test";
import assert from "node:assert/strict";
import { load, facts, okQual, REGISTRY, HEAD } from "./helper.mjs";

test("engineering/T456 [engineering/C16]: migration is explicit: only an accepted migration entry applies the legacy rule, and the verdict reports it", async () => {
  const { admit } = await load();
  const legacy = { ...REGISTRY, admission: { ...REGISTRY.admission, KAAL: { ...REGISTRY.admission.KAAL, migration: "legacy-promotion-source" } } };
  const v = admit(facts("kaal/anything/x", undefined, { registry: legacy }));
  assert.equal(v.kind, "pass");
  assert.match(v.message, /migration/i);
  assert.equal(admit(facts("kaal/anything/x", undefined)).kind, "unknown", "without a migration entry a KAAL head needs its STOCK qualification");
  assert.equal(admit(facts("feature/x", undefined, { registry: legacy })).kind, "fail", "the legacy rule never admits a non-kaal head");
  const v2 = admit(facts("kaal/anything/x", undefined, { registry: legacy }));
  assert.ok(!/fresh/i.test(v2.message) && !(v2.findings ?? []).some((f) => /fresh/i.test(String(f))), "the migration entry never claims to judge freshness");
  const { compare } = await load();
  assert.equal(compare(facts("kaal/x/y", "KAAL")).kind, "agree", "equivalent KAAL route: legacy and admission agree");
  const hf = compare(facts("hotfix/x", "HOTFIX"));
  assert.equal(hf.kind, "expected-difference", "legacy rejects hotfix/* by design, admission admits");
  assert.match(hf.reason, /kaal/i);
  assert.equal(compare(facts("wire/x", "WIRE")).kind, "expected-difference");
  assert.equal(compare(facts("kaal/x/y", undefined, { qualification: { ...okQual("KAAL", "kaal-qual"), verdict: "fail" } })).kind, "regression", "an unexplained difference on a KAAL route is a regression");
});
