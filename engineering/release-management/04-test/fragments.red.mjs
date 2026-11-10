// release-management/C14 (failing Cases C14/T1 to C14/T7, carried unwired in the PLAN of "one fragment per Change, and the identity of a Case";
// fragments-and-case-identity-plan.md). Hosted by release management, intended owner Engineering.
// Run by hand from the repository root; no suite or lane names this file until the DO makes it GREEN:
//
//   node --test engineering/release-management/04-test/fragments.red.mjs
//
// The contract (pure functions over structured facts; do not edit a Case to make it pass):
//   computeView(fragments): [{ id, title, phase, features, ends }] -> { register: string, cases: string, changeIds: string }
//   judgeFragments({ fragments, files }): { kind: "pass" | "fail", findings: [string], nextFree?: string }
//   judgeCases({ cases, tree }): { kind: "pass" | "fail", findings: [string], smells: [string] }
//     cases: [{ identity: "<X-ID>/T<n>", owner, tests: [X-ID], temporary: boolean, change?: C-ID, path }]
//     tree: { parentOf: { [X-ID]: X-ID }, targetDir: { [X-ID]: path }, changeDir: { [C-ID]: path }, ended: [C-ID] }
//   resolveAlias(map, "T31"): "<X-ID>/T<n>" | undefined
import assert from "node:assert/strict";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const load = async (name) => import(pathToFileURL(join(ROOT, "engineering", "release-management", "05-src", "fragments", `${name}.mjs`)).href);

const fragment = (id, over = {}) => ({ id, title: `verb Object ${id}`, phase: "DO", features: ["F1"], ends: "", ...over });
const tree = { parentOf: { "release-management/F6": "release-management", "release-management/F10": "release-management", "hosting/F1": "hosting" }, targetDir: { "release-management/F6": "engineering/release-management/05-src/isolation" }, changeDir: { C14: "engineering/release-management/00-changes/C14" }, ended: [] };

test("C14/T1: the view is a pure, order-independent function of the fragments", async () => {
  const { computeView } = await load("view");
  const a = [fragment("C2"), fragment("C10"), fragment("C1")];
  assert.deepEqual(computeView(a), computeView([...a].reverse()), "any order, the same bytes");
  assert.deepEqual(computeView(a), computeView(structuredClone(a)));
});

test("C14/T2: two fragments with one C-ID are refused and the next free C-ID is named", async () => {
  const { judgeFragments } = await load("view");
  const v = judgeFragments({ fragments: [fragment("C3"), fragment("C3"), fragment("C5")], files: [] });
  assert.equal(v.kind, "fail");
  assert.ok(v.findings.some((x) => /C3/.test(x)));
  assert.equal(v.nextFree, "C6");
});

test("C14/T3: a pull request outside its own fragment folder and declared targets is flagged, and a view is never an input", async () => {
  const { judgeFragments } = await load("view");
  const ok = judgeFragments({ fragments: [fragment("C7")], files: ["engineering/release-management/00-changes/C7/change.md"], declared: [] });
  assert.equal(ok.kind, "pass");
  const shared = judgeFragments({ fragments: [fragment("C7")], files: ["engineering/release-management/00-changes/C7/change.md", "engineering/release-management/00-changes/change-register.md"], declared: [] });
  assert.equal(shared.kind, "fail");
  assert.ok(shared.findings.some((x) => /change-register\.md/.test(x) && /view/.test(x)));
});

test("C14/T4: the owner is the nearest shared parent, tests lists everything, and a Case with no shared parent is a smell", async () => {
  const { judgeCases } = await load("cases");
  const good = { identity: "release-management/T1", owner: "release-management", tests: ["release-management/F6", "release-management/F10"], temporary: false, path: "x" };
  assert.equal(judgeCases({ cases: [good], tree }).kind, "pass");
  const wrongOwner = { ...good, owner: "release-management/F6" };
  assert.equal(judgeCases({ cases: [wrongOwner], tree }).kind, "fail", "the owner is the shared parent of everything covered");
  const apart = { identity: "release-management/T2", owner: "release-management", tests: ["release-management/F6", "hosting/F1"], temporary: false, path: "x" };
  const r = judgeCases({ cases: [apart], tree });
  assert.ok(r.smells.length > 0, "targets of two capabilities with no composing parent are a smell");
});

test("C14/T5: a permanent Case sits next to its target, a temporary one in its Change's folder, and a temporary one outlives its Change only as a finding", async () => {
  const { judgeCases } = await load("cases");
  const permanent = { identity: "release-management/F6/T1", owner: "release-management/F6", tests: ["release-management/F6"], temporary: false, path: "engineering/release-management/05-src/isolation/isolate.test.mjs" };
  const apart = { ...permanent, path: "engineering/elsewhere/isolate.test.mjs" };
  assert.equal(judgeCases({ cases: [permanent], tree }).kind, "pass");
  assert.equal(judgeCases({ cases: [apart], tree }).kind, "fail", "standing alone, away from its target");
  const temp = { identity: "release-management/C14/T1", owner: "release-management/C14", tests: ["release-management/F6"], temporary: true, change: "C14", path: "engineering/release-management/00-changes/C14/t1.red.mjs" };
  assert.equal(judgeCases({ cases: [temp], tree }).kind, "pass");
  assert.equal(judgeCases({ cases: [temp], tree: { ...tree, ended: ["C14"] } }).kind, "fail", "its Change ended, the temporary Case is still there");
});

test("C14/T6: every old T number resolves through the map to exactly one new identity, and none is reused", async () => {
  const { resolveAlias, judgeAliases } = await load("aliases");
  const map = { T31: "release-management/F21/T1", T32: "release-management/F21/T2" };
  assert.equal(resolveAlias(map, "T31"), "release-management/F21/T1");
  assert.equal(resolveAlias(map, "T999"), undefined);
  assert.equal(judgeAliases({ T31: "a/T1", T32: "a/T1" }).kind, "fail", "two old numbers cannot share one identity");
});

test("C14/T7: requirements and architecture nodes follow the same single-owner rule with their edges", async () => {
  const { judgeCases } = await load("cases");
  const node = { identity: "release-management/F21", owner: "release-management", tests: [], temporary: false, kind: "requirement", refines: ["release-management/I1"], path: "engineering/release-management/02-requirements/requirements.md" };
  assert.equal(judgeCases({ cases: [node], tree }).kind, "pass");
  assert.equal(judgeCases({ cases: [{ ...node, owner: undefined }], tree }).kind, "fail", "a node without an owner stands alone");
});
