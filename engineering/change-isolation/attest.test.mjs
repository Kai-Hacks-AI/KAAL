// The trusted adapter's reads and verdicts, with fake API and Git (no network).
import assert from "node:assert/strict";
import { test } from "node:test";
import { attest } from "./attest.mjs";
import { entryDigest } from "./check.mjs";

const HEAD = "a".repeat(40);
const ENTRY = { id: "e1", paths: ["a/x"], pre: { "a/x": null }, post: { "a/x": "2".repeat(40) } };
const doc = (ts) => JSON.stringify({ version: 1, transitions: ts });
const OWNER = { login: "kaihacksai", id: 111 };
const files = (over = {}) => ({
  "origin/kaal/x": { "engineering/change-isolation/transitions.json": doc([]),
    "engineering/change-isolation/attesters.json": JSON.stringify({ version: 1, attesters: [OWNER] }),
    ".github/CODEOWNERS": "* @kaihacksai\n" },
  [HEAD]: { "engineering/change-isolation/transitions.json": doc([ENTRY]) }, ...over });
const io = (f, { reviews, movedTo } = {}) => {
  let reads = 0;
  return { repo: "o/r", pr: 5,
    show: (rev, path) => f[rev]?.[path] ?? null,
    api: async (path) => {
      if (path.includes("/reviews")) return reviews;
      reads++;
      return { head: { sha: reads > 1 && movedTo ? movedTo : HEAD }, base: { ref: "kaal/x" }, user: { id: 222, login: "ChBrain" } };
    } };
};
const approval = (over = {}) => ({ id: 1, state: "APPROVED", commit_id: HEAD, user: OWNER,
  body: `ledger-entry: e1 sha256:${entryDigest(ENTRY)}`, submitted_at: "2026-11-05T10:00:00Z", ...over });

test("a code owner's approval at the head attests the appended entry", async () => {
  const r = await attest(io(files(), { reviews: [approval()] }));
  assert.equal(r.attested, `e1:${entryDigest(ENTRY)}`);
  assert.equal(r.head, HEAD);
});
test("no approval, or an approval at another head, attests nothing", async () => {
  assert.equal((await attest(io(files(), { reviews: [] }))).attested, null);
  assert.equal((await attest(io(files(), { reviews: [approval({ commit_id: "b".repeat(40) })] }))).attested, null);
});
test("a candidate that does not change the ledger carries nothing to attest", async () => {
  const f = files({ [HEAD]: { "engineering/change-isolation/transitions.json": doc([]) } });
  assert.equal((await attest(io(f, { reviews: [approval()] }))).attested, null);
});
test("a ledger that is not exactly one appended entry attests nothing", async () => {
  const f = files({ [HEAD]: { "engineering/change-isolation/transitions.json": doc([ENTRY, { ...ENTRY, id: "e2" }]) } });
  assert.equal((await attest(io(f, { reviews: [approval()] }))).attested, null);
});
test("a head that moves during the run, or unreadable reviews, cannot be judged", async () => {
  await assert.rejects(attest(io(files(), { reviews: [approval()], movedTo: "c".repeat(40) })), (e) => e.name === "CannotJudge");
  await assert.rejects(attest(io(files(), { reviews: null })), (e) => e.name === "CannotJudge");
});
test("a target without pinned attesters or CODEOWNERS cannot be judged", async () => {
  const f = files();
  delete f["origin/kaal/x"]["engineering/change-isolation/attesters.json"];
  await assert.rejects(attest(io(f, { reviews: [approval()] })), (e) => e.name === "CannotJudge");
});
