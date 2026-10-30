// testing/C30 implementation tests for kaal-testing/verifiers, beside the
// planned outer tests in test/plan/verifiers.test.mjs.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import { judge, observe, SCENARIOS } from "kaal-testing/verifiers";

const VERIFIER = { prefix: "acme-verification ", words: { verified: "verified", failed: "failed", unknown: "cannot verify" } };
const FACTS = {
  package: { name: "@acme/thing", version: "1.2.3", location: "/consumer/node_modules/@acme/thing" },
  platform: "linux",
  node: "v24.1.0",
  digest: "d".repeat(64),
  cases: ["acme/T1"],
  target: undefined,
  applicability: {},
  dependencies: [],
  complements: {},
};
const CLEAN = { result: "verified", package: FACTS.package, platform: FACTS.platform, node: FACTS.node, digest: FACTS.digest, cases: [{ name: "acme/T1", outcome: "pass" }] };
const line = (summary) => `${VERIFIER.prefix}${JSON.stringify(summary)}`;

describe("verifiers", () => {
  it("gives a finding, never a throw, for a run or a verifier that is not given", () => {
    for (const [run, verifier] of [[undefined, undefined], [{}, VERIFIER], [{ exit: 0, stdout: 42 }, VERIFIER], [{ exit: 0, stdout: line(CLEAN) }, {}], [{ exit: 0, stdout: line(CLEAN) }, { prefix: "", words: VERIFIER.words }]]) {
      const o = observe(run, verifier);
      assert.equal(o.observation, null, JSON.stringify([run, verifier]));
      assert.ok(o.findings.length > 0);
    }
  });

  it("reads a Windows line ending and ignores lines that only contain the prefix later in the line", () => {
    const o = observe({ exit: 0, stdout: `npm says ${VERIFIER.prefix}nothing\r\n${line(CLEAN)}\r\n` }, VERIFIER);
    assert.equal(o.observation.result, "verified");
    assert.deepEqual(judge("clean", o, FACTS), { scenario: "clean", conforms: true, differences: [] });
  });

  it("judges any observed or facts value without throwing, and never conforms on them", () => {
    for (const observed of [undefined, null, {}, { observation: null, findings: "x" }, { observation: { result: "verified", exit: 0 }, findings: "x" }]) {
      for (const facts of [undefined, null, {}, { cases: "acme/T1" }]) {
        const j = judge("clean", observed, facts);
        assert.equal(j.conforms, false, JSON.stringify([observed, facts]));
        assert.ok(j.differences.length > 0);
      }
    }
  });

  it("treats case and complement identities that name Object.prototype members as ordinary strings", () => {
    const facts = { ...FACTS, cases: ["__proto__", "constructor"], target: "constructor", applicability: JSON.parse('{"constructor":{"requires":["toString"],"reason":"r"}}'), complements: JSON.parse('{"toString":"absent"}') };
    const summary = { ...CLEAN, cases: [{ name: "__proto__", outcome: "pass" }, { name: "constructor", outcome: "not applicable", applicability: { requires: ["toString"], reason: "r" } }] };
    const j = judge("complement-absent", observe({ exit: 0, stdout: line(summary) }, VERIFIER), facts);
    assert.deepEqual(j.differences, []);
    const inherited = { ...facts, complements: {} };
    assert.equal(judge("complement-absent", observe({ exit: 0, stdout: line(summary) }, VERIFIER), inherited).conforms, false, "toString on Object.prototype is not a complement established absent");
  });

  it("never conforms when the harness established none of the run's identifying facts or declared cases", () => {
    const bare = observe({ exit: 0, stdout: 'v {"result":"verified","cases":[]}' }, { prefix: "v ", words: VERIFIER.words });
    for (const facts of [undefined, {}, { cases: [] }]) assert.equal(judge("clean", bare, facts).conforms, false, JSON.stringify(facts));
    for (const k of ["platform", "node", "digest"]) assert.equal(judge("clean", observe({ exit: 0, stdout: line({ ...CLEAN, [k]: undefined }) }, VERIFIER), { ...FACTS, [k]: undefined }).conforms, false, k);
    assert.equal(judge("clean", observe({ exit: 0, stdout: line({ ...CLEAN, package: {} }) }, VERIFIER), { ...FACTS, package: {} }).conforms, false);
  });

  it("never conforms to a targeted scenario whose target the harness did not establish among the declared cases", () => {
    for (const target of [undefined, "", "acme/T9"]) {
      assert.equal(judge("not-applicable", observe({ exit: 0, stdout: line(CLEAN) }, VERIFIER), { ...FACTS, target }).conforms, false, String(target));
      const unknown = { ...CLEAN, result: "cannot verify", cause: "c", uncertainty: "u", next: { kind: "exploratory", step: "analyze" } };
      assert.equal(judge("case-skipped", observe({ exit: 2, stdout: line(unknown) }, VERIFIER), { ...FACTS, target }).conforms, false, String(target));
    }
  });

  it("never conforms when the harness established no dependency inventory, applicability or complement states, or declared cases for no-case", () => {
    const facts = { ...FACTS, target: "acme/T1", applicability: { "acme/T1": { requires: ["core"], reason: "r" } }, complements: { core: "absent" } };
    const summary = { ...CLEAN, cases: [{ name: "acme/T1", outcome: "not applicable", applicability: { requires: ["core"], reason: "r" } }] };
    const run = observe({ exit: 0, stdout: line(summary) }, VERIFIER);
    assert.equal(judge("complement-absent", run, facts).conforms, true);
    for (const k of ["dependencies", "applicability", "complements"]) assert.equal(judge("complement-absent", run, { ...facts, [k]: undefined }).conforms, false, k);
    const none = { ...CLEAN, result: "cannot verify", cause: "c", uncertainty: "u", next: { kind: "exploratory", step: "analyze" }, cases: [] };
    assert.equal(judge("no-case", observe({ exit: 2, stdout: line(none) }, VERIFIER), { ...FACTS, cases: [] }).conforms, true);
    assert.equal(judge("no-case", observe({ exit: 2, stdout: line(none) }, VERIFIER), FACTS).conforms, false);
  });

  it("does not let a repeated applicability entry stand in for one the harness established", () => {
    const facts = { ...FACTS, target: "acme/T1", applicability: { "acme/T1": { platforms: ["win32", "darwin"], reason: "r" } } };
    const claim = (platforms) => judge("not-applicable", observe({ exit: 0, stdout: line({ ...CLEAN, cases: [{ name: "acme/T1", outcome: "not applicable", applicability: { platforms, reason: "r" } }] }) }, VERIFIER), facts).conforms;
    assert.equal(claim(["darwin", "win32"]), true);
    assert.equal(claim(["win32", "win32"]), false);
  });

  it("keeps the scenarios frozen, each with a unique identity and an expected result", () => {
    assert.ok(Object.isFrozen(SCENARIOS) && SCENARIOS.every(Object.isFrozen));
    assert.equal(new Set(SCENARIOS.map((s) => s.id)).size, SCENARIOS.length);
    for (const s of SCENARIOS) assert.ok(["verified", "failed", "unknown"].includes(s.result) && ["pass", "none", "any"].includes(s.cases), s.id);
  });

  it("imports nothing (testing/N9)", async () => {
    const source = await readFile(new URL("../lib/verifiers.mjs", import.meta.url), "utf8");
    assert.doesNotMatch(source, /^\s*import\b|\bimport\s*\(|\brequire\s*\(/m);
  });
});
