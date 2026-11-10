// release-management/T59, T60 and C17/T1 (failing Cases, carried unwired in the PLAN of C10, delivery and retirement; delivery-and-retirement-plan.md).
// Run by hand from the repository root; no suite or lane names this file until the DO makes it GREEN:
//
//   node --test engineering/release-management/04-test/retirement.red.mjs
//
// The contract: judgeRetirement({ retirements, trustRoots: { ci, publishing } }) is a pure function. A retirement is
//   { name, path: "ci" | "publishing", coveredBy, observed, verifiedBy, author, evidence }  (coveredBy is a control name, or "stays" for what this plan does not retire).
// It returns { kind: "pass" | "fail", findings: [string] }. Do not edit a Case to make it pass.
import assert from "node:assert/strict";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const judge = async () => (await import(pathToFileURL(join(ROOT, "engineering", "release-management", "05-src", "retirement", "judge-retirement.mjs")).href)).judgeRetirement;

const ok = (over) => ({ name: "Promotion Source", path: "ci", coveredBy: "accept Capability", observed: true, author: "ChBrain", verifiedBy: "kaihacksai", evidence: "run 42800000001", ...over });
const LIVE = { ci: true, publishing: true };
const run = async (retirements, trustRoots = LIVE) => (await judge())({ retirements, trustRoots });

test("T59: a retirement fails while the replacement is not observed, not independently verified, or the trust root is not live", async () => {
  assert.equal((await run([ok()])).kind, "pass");
  assert.equal((await run([ok({ observed: false })])).kind, "fail", "configured is not observed");
  assert.equal((await run([ok({ verifiedBy: "ChBrain" })])).kind, "fail", "verified by its author is not independent");
  assert.equal((await run([ok({ verifiedBy: undefined })])).kind, "fail", "unverified");
  const early = await run([ok()], { ci: false, publishing: true });
  assert.equal(early.kind, "fail", "nothing is removed until the CI trust root is live");
  assert.ok(early.findings.some((x) => /CI trust root/.test(x)));
  assert.equal((await run([ok()], { ci: true, publishing: false })).kind, "pass", "a pull request check does not wait for the publishing trust root");
  const pub = ok({ name: "release.yml", path: "publishing", coveredBy: "approve Publishing" });
  assert.equal((await run([pub], { ci: true, publishing: false })).kind, "fail", "the old publish path waits for the publishing trust root");
  assert.equal((await run([pub], { ci: false, publishing: true })).kind, "pass", "and not for the CI one");
  assert.equal((await run([ok({ path: "elsewhere" })])).kind, "fail", "an unknown path is no evidence");
});

test("T60: a retirement names its covering control and evidence, a row that stays is never retired, and a missing fact is no evidence", async () => {
  assert.equal((await run([ok({ coveredBy: undefined })])).kind, "fail", "no covering control");
  assert.equal((await run([ok({ evidence: "" })])).kind, "fail", "no evidence kept");
  const stays = await run([ok({ name: "guard-acceptance-boundary", coveredBy: "stays" })]);
  assert.equal(stays.kind, "fail", "a row that stays cannot be retired");
  assert.ok(stays.findings.some((x) => /guard-acceptance-boundary/.test(x)));
  for (const bad of [undefined, null, "x"]) assert.notEqual((await judge())({ retirements: bad, trustRoots: LIVE }).kind, "pass");
  assert.notEqual((await judge())({ retirements: [ok()], trustRoots: undefined }).kind, "pass", "an unknown trust root state is not live");
  assert.notEqual((await judge())({ retirements: [ok()], trustRoots: { ci: "yes" } }).kind, "pass", "only a boolean true is live");
});

// C17/T1: replacement evidence. A retirement also carries
//   replacement: { realization: "native" | "declarative" | "kaal-judgment", effectiveConfiguration: boolean, enforcement: "exercised" | "not-feasible" | "missing",
//                  followUp?: { needed: boolean, operational: boolean, assurance: "indirect" | "direct" } }
test("C17/T1: a retirement fails without a named realization, an active effective configuration, shown enforcement where feasible and an operational detective follow-up", async () => {
  const good = { realization: "native", effectiveConfiguration: true, enforcement: "exercised", followUp: { needed: true, operational: true, assurance: "indirect" } };
  assert.equal((await run([ok({ replacement: good })])).kind, "pass");
  assert.equal((await run([ok({ replacement: { ...good, realization: undefined } })])).kind, "fail", "the realization is named");
  assert.equal((await run([ok({ replacement: { ...good, effectiveConfiguration: false } })])).kind, "fail", "a file describing a setting is not an active setting");
  assert.equal((await run([ok({ replacement: { ...good, enforcement: "missing" } })])).kind, "fail", "enforcement is exercised where feasible");
  assert.equal((await run([ok({ replacement: { ...good, enforcement: "not-feasible" } })])).kind, "pass", "not feasible is a stated reason, not a gap, when a follow-up covers it");
  assert.equal((await run([ok({ replacement: { ...good, followUp: { needed: true, operational: false, assurance: "indirect" } } })])).kind, "fail", "a defined but not operational follow-up");
  const claimsProof = await run([ok({ replacement: { ...good, followUp: { needed: true, operational: true, assurance: "direct" } } })]);
  assert.equal(claimsProof.kind, "fail", "an outcome inspection is indirect assurance, never proof of configuration");
});
