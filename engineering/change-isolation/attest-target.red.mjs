// Defect: a target branch that holds no ledger makes the attestation adapter end in "cannot judge", so the approval-event
// handler completes Change Isolation as failed on a synchronization that gives that very branch its ledger (#1204, kaal/foundation).
// RED on main today: Case 1 fails. Case 2 and 3 are controls that pass before and after the fix. Run by hand:
//   node --test engineering/change-isolation/attest-target.red.mjs
// Do not edit a Case to make it pass.
import assert from "node:assert/strict";
import { test } from "node:test";
import { attest } from "./attest.mjs";
import { entryDigest } from "./check.mjs";

const HEAD = "a".repeat(40);
const ENTRY = { id: "e1", paths: ["a/x"], pre: { "a/x": null }, post: { "a/x": "2".repeat(40) } };
const doc = (ts) => JSON.stringify({ version: 1, transitions: ts });
const OWNER = { login: "kaihacksai", id: 111 };
const LEDGER = "engineering/change-isolation/transitions.json", ATTESTERS = "engineering/change-isolation/attesters.json";
const pinned = { [ATTESTERS]: JSON.stringify({ version: 1, attesters: [OWNER] }), ".github/CODEOWNERS": "* @kaihacksai\n" };
const io = (files, reviews) => ({ repo: "o/r", pr: 5,
  show: (rev, path) => files[rev]?.[path] ?? null,
  api: async (path) => path.includes("/reviews") ? reviews
    : { head: { sha: HEAD }, base: { ref: "kaal/x" }, user: { id: 222, login: "ChBrain" } } });
const approval = { id: 1, state: "APPROVED", commit_id: HEAD, user: OWNER,
  body: `ledger-entry: e1 sha256:${entryDigest(ENTRY)}`, submitted_at: "2026-11-08T10:00:00Z" };

test("engineering/attest-target Case 1: a target that holds no ledger yields no attestation, not 'cannot judge'", async () => {
  const files = { "origin/kaal/x": {}, [HEAD]: { [LEDGER]: doc([ENTRY]) } };
  const r = await attest(io(files, []));
  assert.equal(r.attested, null);
  assert.equal(r.head, HEAD);
});
test("engineering/attest-target Case 2 (control): a target that holds no ledger never lets an approval attest", async () => {
  const files = { "origin/kaal/x": {}, [HEAD]: { [LEDGER]: doc([ENTRY]) } };
  let r;
  try { r = await attest(io(files, [approval])); } catch (e) { assert.equal(e.name, "CannotJudge"); return; }
  assert.equal(r.attested, null);
});
test("engineering/attest-target Case 3 (control): a target with a ledger but no pinned attesters or CODEOWNERS still cannot be judged", async () => {
  const files = { "origin/kaal/x": { [LEDGER]: doc([]) }, [HEAD]: { [LEDGER]: doc([ENTRY]) } };
  await assert.rejects(attest(io(files, [approval])), (e) => e.name === "CannotJudge");
});
