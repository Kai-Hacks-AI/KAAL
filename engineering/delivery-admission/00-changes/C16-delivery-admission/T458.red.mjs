// Case engineering/T458 (engineering/C16): the pull section and its auto flag are never read by admission
import { test } from "node:test";
import assert from "node:assert/strict";
import { load, facts, okOut, entry, REGISTRATION, HEAD } from "./helper.mjs";

test("engineering/T458 [engineering/C16]: the pull section and its auto flag are never read by admission", async () => {
  const { admit } = await load();
  const pullOnly = { accepted: true, entries: [{ stock: "hotfix", route: "hotfix/*", pull: { auto: true } }] };
  assert.equal(admit(facts("hotfix/x", "hotfix", { registration: pullOnly })).kind, "fail", "auto-pull opt-in is not an admission entry");
  const judged = { accepted: true, entries: [entry("hotfix", "hotfix/*", "hotfix-out", { pull: { auto: false } })] };
  assert.equal(admit(facts("hotfix/x", "hotfix", { registration: judged })).kind, "pass", "a judge-pulled candidate is admissible");
  const auto = { accepted: true, entries: [entry("hotfix", "hotfix/*", "hotfix-out", { pull: { auto: true } })] };
  assert.equal(admit(facts("hotfix/x", undefined, { registration: auto })).kind, "unknown", "an auto-pulled one still needs OUT evidence");
});
