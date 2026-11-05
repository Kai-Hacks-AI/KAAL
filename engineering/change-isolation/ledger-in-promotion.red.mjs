// engineering/T90 to T110: a promotion carries its own transition ledger entry (PLAN #1019, Cases R1 to R21).
//
// These are the RED Cases of the plan "a promotion carries its own transition ledger entry"
// (engineering/change-isolation/ledger-in-promotion-plan.md). They are written before any code and are
// RED by design: no suite, lane or script names this file, so required CI does not run it. Run it by hand:
//
//   node --test engineering/change-isolation/ledger-in-promotion.red.mjs
//
// A Case answers the plan only when the same unchanged file is GREEN in the Change that implements it.
// Do not edit it to pass. Each test title names its plan Case (Rn) and its identity; R11 (hook agreement) is
// planned with the hook change and is not in this file.
//
// The interface these Cases fix (the checker Change implements exactly this; it may add, not change):
//
//   check.mjs  check(paths, { ledger, facts, carried, attested })
//       carried:  the one entry the candidate appended to the ledger, or undefined.
//       attested: { id, digest } the trusted adapter derived from a valid attestation, or undefined.
//       A carried entry admits the change only when attested.id === carried.id, attested.digest equals the
//       entry's canonical digest, carried.paths equal the changed paths minus the ledger file, and every
//       blob in the entry equals the target's (pre) and the candidate's (post), as for a target-held entry.
//       The ledger file is the one path the entry does not list. Without attestation a carried entry
//       admits nothing, and the change is judged by the default rules.
//   attestation.mjs
//       canonicalEntry(entry) -> Buffer         RFC 8785 bytes of the entry; throws NotCanonical.
//       entryDigest(entry) -> string            lowercase hex SHA-256 via Foundation, never node:crypto.
//       appendedEntry(targetText, candidateText) -> { entry } | { violation }
//       judgeAttestation({ entry, reviews, pr, judgedSha, headAtEnd, attesters, codeowners })
//           -> { attested: { id, digest } | null, violations: string[] }; throws CannotJudge when it cannot read.
//   .github/workflows/change-isolation-review-relay.yml and change-isolation-review.yml (R20, R21).
//
// Controls (R2, R3, R5, R7 to R10) pass today and must keep passing, so a design that admits everything turns them RED. The
// negatives (R4, R15 to R18) can only be written against the new functions; they are RED today and guard the same thing.
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { sha256 } from "@kaihacksai/kaal-foundation/sha256";
import { check, LEDGER } from "./check.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CHECKER = "engineering/change-isolation/check.mjs";
const attestation = () => import("./attestation.mjs");

// A fixed entry, its canonical bytes and its digest. Computed once with `sha256sum` over the bytes below
// (printf '%s' | sha256sum), held as constants so the vector is independent of the implementation.
const ENTRY = { id: "v1", paths: ["a/x", "packages/kaal-core/y"],
  pre: { "a/x": null, "packages/kaal-core/y": "1".repeat(40) },
  post: { "a/x": "2".repeat(40), "packages/kaal-core/y": "3".repeat(40) } };
const CANONICAL = '{"id":"v1","paths":["a/x","packages/kaal-core/y"],"post":{"a/x":"' + "2".repeat(40) +
  '","packages/kaal-core/y":"' + "3".repeat(40) + '"},"pre":{"a/x":null,"packages/kaal-core/y":"' + "1".repeat(40) + '"}}';
const DIGEST = "f7f3fc903262567ec4b686963e0a30bc574ca642b5b05e2062ba17f4e6e8ff4c";

const facts = (entry = ENTRY, over = {}) => (path) => ({
  base: over.base && path in over.base ? over.base[path] : entry.pre[path],
  head: over.head && path in over.head ? over.head[path] : entry.post[path] });
const CHANGE = [...ENTRY.paths, LEDGER];
const attest = { id: "v1", digest: DIGEST };

// ---- the checker --------------------------------------------------------------------------------

test("engineering/T90 R1: a change with its own appended entry and a matching attestation is admitted", () => {
  assert.deepEqual(check(CHANGE, { ledger: [], facts: facts(), carried: ENTRY, attested: attest }), []);
});
test("engineering/T91 R2 (control): the same change without an attestation is refused", () => {
  const v = check(CHANGE, { ledger: [], facts: facts(), carried: ENTRY });
  assert.ok(v.some((x) => /core travels alone/.test(x)), v.join("\n"));
});
test("engineering/T92 R3 (control): an attestation for another entry's digest is refused", () => {
  const v = check(CHANGE, { ledger: [], facts: facts(), carried: ENTRY, attested: { id: "v1", digest: "0".repeat(64) } });
  assert.ok(v.length > 0);
});
test("engineering/T94 R5 (control): blobs that do not match the change are refused and the path is named", () => {
  const v = check(CHANGE, { ledger: [], facts: facts(ENTRY, { head: { "a/x": "9".repeat(40) } }), carried: ENTRY, attested: attest });
  assert.ok(v.some((x) => x.includes("a/x")), v.join("\n"));
});
test("engineering/T96 R7 (control): an entry that reaches .github or the checker is refused even when correctly attested; an extra changed path is refused", () => {
  // The digest is that of the variant entry itself, so only the reach restriction can refuse it. Computed with
  // Foundation SHA-256 over the canonical bytes built here (keys sorted, no whitespace), not from the checker.
  const canon = (e) => JSON.stringify({ id: e.id, paths: e.paths, post: e.post, pre: e.pre });
  for (const extra of [".github/workflows/x.yml", CHECKER]) {
    const reach = { ...ENTRY, paths: [...ENTRY.paths, extra].sort(), pre: { ...ENTRY.pre, [extra]: null }, post: { ...ENTRY.post, [extra]: "4".repeat(40) } };
    const digest = sha256(Buffer.from(canon(reach)));
    const v = check([...CHANGE, extra], { ledger: [], facts: facts(reach), carried: reach, attested: { id: "v1", digest } });
    assert.ok(v.length > 0, extra);
  }
  // An extra changed path outside the unchanged, correctly attested entry.
  assert.ok(check([...CHANGE, "packages/other/z"], { ledger: [], facts: facts(), carried: ENTRY, attested: attest }).length > 0);
});
test("engineering/T97 R8 (control): an entry already adopted by the target (its post is the target's blob) is refused", () => {
  const v = check(CHANGE, { ledger: [], facts: facts(ENTRY, { base: ENTRY.post }), carried: ENTRY, attested: attest });
  assert.ok(v.length > 0);
});
test("engineering/T98 R9 (control): a change that edits the checker is still refused", () => {
  const paths = [...CHANGE, CHECKER];
  assert.ok(check(paths, { ledger: [], facts: facts(), carried: ENTRY, attested: attest }).length > 0);
});
test("engineering/T99 R10 (control): a ledger-only change is unchanged", () => {
  assert.deepEqual(check([LEDGER], { ledger: [] }), []);
});

// ---- the entry and its digest -------------------------------------------------------------------

test("engineering/T95 R6: ledger diff must be exactly one appended entry", async () => {
  const { appendedEntry } = await attestation();
  const doc = (ts) => JSON.stringify({ version: 1, transitions: ts });
  const base = { ...ENTRY, id: "old" };
  assert.deepEqual(appendedEntry(doc([base]), doc([base, ENTRY])).entry, ENTRY);
  for (const bad of [doc([base]), doc([base, ENTRY, { ...ENTRY, id: "v2" }]), doc([{ ...base, id: "edited" }, ENTRY]),
      doc([ENTRY, base]), doc([]), doc([base, { ...ENTRY, id: "old" }])]) {
    assert.ok(appendedEntry(doc([base]), bad).violation, bad);
  }
});
test("engineering/T103 R14: one canonical byte form and digest per entry; every other spelling is refused", async () => {
  const { canonicalEntry, entryDigest } = await attestation();
  assert.equal(canonicalEntry(ENTRY).toString("utf8"), CANONICAL);
  assert.equal(entryDigest(ENTRY), DIGEST);
  const reordered = { post: ENTRY.post, pre: ENTRY.pre, paths: ENTRY.paths, id: "v1" };
  assert.equal(entryDigest(reordered), DIGEST);
  for (const bad of [{ ...ENTRY, extra: 1 }, { ...ENTRY, paths: [...ENTRY.paths].reverse() }, { ...ENTRY, paths: [...ENTRY.paths, ENTRY.paths[0]] },
      { ...ENTRY, id: "V 1" }, { ...ENTRY, post: { ...ENTRY.post, "a/x": "Z" } }]) {
    assert.throws(() => canonicalEntry(bad), (e) => e.name === "NotCanonical");
  }
  assert.ok(canonicalEntry({ ...ENTRY, paths: ["a/é"], pre: { "a/é": null }, post: { "a/é": "2".repeat(40) } }).includes(Buffer.from("é")));
});

// ---- who counts as an attestation -----------------------------------------------------------------

const OWNER = { login: "kaihacksai", id: 111 };
const AUTHOR = { login: "ChBrain", id: 222 };
const SHA = "a".repeat(40);
const review = (over = {}) => ({ id: 1, state: "APPROVED", commit_id: SHA, user: OWNER,
  body: `ledger-entry: v1 sha256:${DIGEST}`, submitted_at: "2026-11-05T10:00:00Z", ...over });
const input = (reviews, over = {}) => ({ entry: ENTRY, reviews, pr: { user: AUTHOR, head: { sha: SHA } },
  judgedSha: SHA, headAtEnd: SHA, attesters: [OWNER], codeowners: "* @kaihacksai\n", ...over });

test("engineering/T100 R12 and R13: the verdict follows the reviews as they are now", async () => {
  const { judgeAttestation } = await attestation();
  assert.deepEqual(judgeAttestation(input([])).attested, null);
  assert.deepEqual(judgeAttestation(input([review()])).attested, attest);
  assert.deepEqual(judgeAttestation(input([review({ state: "DISMISSED" })])).attested, null);
});
test("engineering/T101 R4: an approval recorded for another head SHA counts for nothing", async () => {
  const { judgeAttestation } = await attestation();
  assert.equal(judgeAttestation(input([review({ commit_id: "b".repeat(40) })])).attested, null);
});
test("engineering/T102 R15 (negative): author, non-owner, recycled login and unpinned owner do not attest", async () => {
  const { judgeAttestation } = await attestation();
  assert.equal(judgeAttestation(input([review({ user: AUTHOR })])).attested, null);
  assert.equal(judgeAttestation(input([review({ user: { login: "someone", id: 333 } })])).attested, null);
  assert.equal(judgeAttestation(input([review({ user: { login: "kaihacksai", id: 999 } })])).attested, null);
  assert.throws(() => judgeAttestation(input([review()], { attesters: [] })), (e) => e.name === "CannotJudge" || /cannot judge/i.test(e.message));
  for (const codeowners of ["* @org/team\n", "docs/ @kaihacksai\n", ""]) {
    assert.throws(() => judgeAttestation(input([review()], { codeowners })), (e) => e.name === "CannotJudge" || /cannot judge/i.test(e.message));
  }
});
test("engineering/T104 R16 (negative): a COMMENTED or CHANGES_REQUESTED review carrying the line does not attest", async () => {
  const { judgeAttestation } = await attestation();
  for (const state of ["COMMENTED", "CHANGES_REQUESTED", "PENDING"])
    assert.equal(judgeAttestation(input([review({ state })])).attested, null, state);
});
test("engineering/T105 R17: a later review by the same owner without the line supersedes the approval", async () => {
  const { judgeAttestation } = await attestation();
  const later = review({ id: 2, body: "approved", submitted_at: "2026-11-05T11:00:00Z" });
  assert.equal(judgeAttestation(input([review(), later])).attested, null);
});
test("engineering/T106 R18 (negative): two attestation lines, or a line for another digest, do not attest", async () => {
  const { judgeAttestation } = await attestation();
  const line = `ledger-entry: v1 sha256:${DIGEST}`;
  assert.equal(judgeAttestation(input([review({ body: `${line}\n${line}` })])).attested, null);
  assert.equal(judgeAttestation(input([review({ body: `ledger-entry: v1 sha256:${"0".repeat(64)}` })])).attested, null);
  assert.equal(judgeAttestation(input([review({ body: `${line} ` })])).attested, null);
});
test("engineering/T107 R19: unreadable reviews or a head that moved during the run cannot be judged", async () => {
  const { judgeAttestation } = await attestation();
  const cannot = (e) => e.name === "CannotJudge";
  assert.throws(() => judgeAttestation(input(null)), cannot);
  assert.throws(() => judgeAttestation(input([review()], { headAtEnd: "c".repeat(40) })), cannot);
  assert.throws(() => judgeAttestation(input([review()], { judgedSha: "c".repeat(40) })), cannot);
});

// ---- the workflows -------------------------------------------------------------------------------

const RELAY = join(ROOT, ".github/workflows/change-isolation-review-relay.yml");
const HANDLER = join(ROOT, ".github/workflows/change-isolation-review.yml");

test("engineering/T108 R20: the handler sets the check in_progress before it reads anything", () => {
  assert.ok(existsSync(HANDLER), "the handler workflow does not exist");
  const text = readFileSync(HANDLER, "utf8");
  const first = text.search(/in_progress/);
  const reads = text.search(/reviews|checkout|npm ci/);
  assert.ok(first > -1 && first < reads, "in_progress must come before any read");
});
test("engineering/T109 R21: the relay trusts nothing; the handler runs from the default branch", () => {
  assert.ok(existsSync(RELAY) && existsSync(HANDLER), "relay and handler workflows must exist");
  const relay = readFileSync(RELAY, "utf8"), handler = readFileSync(HANDLER, "utf8");
  assert.match(relay, /pull_request_review:/);
  assert.doesNotMatch(relay, /actions\/checkout|npm |node /, "the relay runs no candidate code");
  assert.match(handler, /workflow_run:/);
  assert.match(handler, /default_branch/);
  assert.doesNotMatch(handler, /github\.event\.workflow_run\.head_(sha|branch)/, "the handler must not use the relay's head");
});
test("engineering/T110 R21b: the handler fails closed and the concurrency group is per pull request", () => {
  assert.ok(existsSync(HANDLER), "the handler workflow does not exist");
  const text = readFileSync(HANDLER, "utf8");
  assert.match(text, /concurrency:/);
  assert.match(text, /cancel-in-progress:\s*false/);
});
