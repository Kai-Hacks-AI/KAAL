// release-management/T59 and T60 (failing Cases, carried unwired in the PLAN of C10, delivery and retirement; delivery-and-retirement-plan.md).
// Run by hand from the repository root; no suite or lane names this file until the DO makes it GREEN:
//
//   node --test engineering/release-management/04-test/retirement.red.mjs
//
// The contract: judgeRetirement({ retirements, trustRootLive }) is a pure function. A retirement is
//   { name, coveredBy, observed, verifiedBy, author, evidence }  (coveredBy is a control name, or "stays" for what this plan does not retire).
// It returns { kind: "pass" | "fail", findings: [string] }. Do not edit a Case to make it pass.
import assert from "node:assert/strict";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const judge = async () => (await import(pathToFileURL(join(ROOT, "engineering", "release-management", "05-src", "retirement", "judge-retirement.mjs")).href)).judgeRetirement;

const ok = (over) => ({ name: "Promotion Source", coveredBy: "accept Capability", observed: true, author: "ChBrain", verifiedBy: "kaihacksai", evidence: "run 42800000001", ...over });
const run = async (retirements, trustRootLive = true) => (await judge())({ retirements, trustRootLive });

test("T59: a retirement fails while the replacement is not observed, not independently verified, or the trust root is not live", async () => {
  assert.equal((await run([ok()])).kind, "pass");
  assert.equal((await run([ok({ observed: false })])).kind, "fail", "configured is not observed");
  assert.equal((await run([ok({ verifiedBy: "ChBrain" })])).kind, "fail", "verified by its author is not independent");
  assert.equal((await run([ok({ verifiedBy: undefined })])).kind, "fail", "unverified");
  const early = await run([ok()], false);
  assert.equal(early.kind, "fail", "nothing is removed until the trust root is live");
  assert.ok(early.findings.some((x) => /trust root/.test(x)));
});

test("T60: a retirement names its covering control and evidence, a row that stays is never retired, and a missing fact is no evidence", async () => {
  assert.equal((await run([ok({ coveredBy: undefined })])).kind, "fail", "no covering control");
  assert.equal((await run([ok({ evidence: "" })])).kind, "fail", "no evidence kept");
  const stays = await run([ok({ name: "guard-acceptance-boundary", coveredBy: "stays" })]);
  assert.equal(stays.kind, "fail", "a row that stays cannot be retired");
  assert.ok(stays.findings.some((x) => /guard-acceptance-boundary/.test(x)));
  for (const bad of [undefined, null, "x"]) assert.notEqual((await judge())({ retirements: bad, trustRootLive: true }).kind, "pass");
  assert.notEqual((await judge())({ retirements: [ok()], trustRootLive: undefined }).kind, "pass", "an unknown trust root state is not live");
});
