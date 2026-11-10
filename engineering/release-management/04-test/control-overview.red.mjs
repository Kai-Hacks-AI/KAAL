// release-management/T56 to T58 (failing Cases, carried unwired in the PLAN of C9, control overview and vocabulary; control-overview-plan.md).
// Run by hand from the repository root; no suite or lane names this file until the DO makes it GREEN:
//
//   node --test engineering/release-management/04-test/control-overview.red.mjs
//
// The contract: judgeOverview({ controls, vocabulary, architecture }) is a pure function over structured facts.
//   controls: [{ name, id, station, class, appliedAt: [...], counterpart? }]  (the overview, as parsed by the caller)
//   vocabulary: { preventive: [verbs], detective: [verbs], corrective: [verbs] }
//   architecture: [{ name, id }]  (every control the architecture's table defines)
// It returns { kind: "pass" | "fail", findings: [string] }. Do not edit a Case to make it pass.
import assert from "node:assert/strict";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const judge = async () => (await import(pathToFileURL(join(ROOT, "engineering", "release-management", "05-src", "overview", "judge-overview.mjs")).href)).judgeOverview;

const vocabulary = { preventive: ["freeze", "approve", "bind"], detective: ["audit", "scan", "verify"], corrective: ["clear", "retarget"] };
const row = (name, over = {}) => ({ name, id: "F1", station: "11-main", class: "preventive", appliedAt: ["gate"], counterpart: "audit Lineage", ...over });
const overview = [
  row("bind Merge", { id: "F10" }),
  row("audit Lineage", { id: "F5", class: "detective", appliedAt: ["check"], counterpart: "none: it is the detective counterpart" }),
];
const architecture = [{ name: "bind Merge", id: "F10" }, { name: "audit Lineage", id: "F5" }];
const facts = (over) => ({ controls: overview, vocabulary, architecture, ...over });

test("T56: every control the architecture defines is in the overview with station, class and applied-at, and a missing one fails", async () => {
  const f = await judge();
  assert.equal(f(facts()).kind, "pass");
  const missing = f(facts({ architecture: [...architecture, { name: "freeze Collector", id: "F21" }] }));
  assert.equal(missing.kind, "fail");
  assert.ok(missing.findings.some((x) => x.includes("freeze Collector")), "names the control that is missing");
  for (const field of ["station", "class", "appliedAt"]) {
    const bad = f(facts({ controls: [row("bind Merge", { id: "F10", [field]: undefined }), overview[1]] }));
    assert.equal(bad.kind, "fail", `${field} missing is no evidence`);
  }
});

test("T57: the verb of a control belongs to the verb set of its class, and an unknown class or applied-at is refused", async () => {
  const f = await judge();
  const wrongVerb = f(facts({ controls: [row("verify Merge", { id: "F10" }), overview[1]], architecture: [{ name: "verify Merge", id: "F10" }, architecture[1]] }));
  assert.equal(wrongVerb.kind, "fail", "verify is detective, so a preventive row cannot use it");
  assert.ok(wrongVerb.findings.some((x) => /verify/.test(x) && /preventive/.test(x)));
  assert.equal(f(facts({ controls: [row("bind Merge", { id: "F10", class: "directive" }), overview[1]] })).kind, "fail", "directive things are not control rows");
  assert.equal(f(facts({ controls: [row("bind Merge", { id: "F10", appliedAt: ["somewhere"] }), overview[1]] })).kind, "fail", "applied-at is hook, check, gate or setting");
});

test("T58: each preventive control names a counterpart or a stated reason, and a counterpart is a control of another class in the overview", async () => {
  const f = await judge();
  assert.equal(f(facts({ controls: [row("bind Merge", { id: "F10", counterpart: undefined }), overview[1]] })).kind, "fail", "no counterpart and no reason");
  assert.equal(f(facts({ controls: [row("bind Merge", { id: "F10", counterpart: "bind Merge" }), overview[1]] })).kind, "fail", "a control is not its own counterpart");
  assert.equal(f(facts({ controls: [row("bind Merge", { id: "F10", counterpart: "ghost Control" }), overview[1]] })).kind, "fail", "the counterpart must exist");
  assert.equal(f(facts({ controls: [row("bind Merge", { id: "F10", counterpart: "none: the merge method is read from the ruleset itself" }), overview[1]] })).kind, "pass", "a stated reason is enough");
});
