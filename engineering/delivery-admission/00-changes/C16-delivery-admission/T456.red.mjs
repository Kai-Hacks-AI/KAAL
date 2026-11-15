// Case engineering/T456 (engineering/C16): migration is explicit: only an accepted migration entry applies the legacy rule, and the verdict reports it
import { test } from "node:test";
import assert from "node:assert/strict";
import { load, facts, okOut, entry, REGISTRATION, HEAD } from "./helper.mjs";

test("engineering/T456 [engineering/C16]: migration is explicit: only an accepted migration entry applies the legacy rule, and the verdict reports it", async () => {
  const { admit } = await load();
  const registration = { accepted: true, entries: [entry("kaal-legacy", "kaal/**", "none", { migration: "legacy-promotion-source" })] };
  const v = admit(facts("kaal/anything/x", undefined, { registration }));
  assert.equal(v.kind, "pass");
  assert.match(v.message, /migration/i);
  assert.equal(admit(facts("kaal/anything/x", undefined, { registration: { accepted: true, entries: [] } })).kind, "fail", "no entry, no fallback");
  assert.equal(admit(facts("feature/x", undefined, { registration })).kind, "fail", "the legacy rule never admits a non-kaal head");
});
