// testing/C29 planned outer tests: one observable result contract for every consumer verifier.
// Immutable to DO and CHECK; testing/C30 turns them GREEN. Each title names the contracts it
// checks (plan/verifiers/*.md). They use kaal-testing's public interface only, on runs given
// as their exit status and output, and on the facts a publisher's harness established itself.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

/** kaal-testing/verifiers, or the reason the tests are blocked before any behavioural assertion. */
async function contract() {
  let m;
  try {
    m = await import("kaal-testing/verifiers");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-testing exports no ./verifiers (${e.code ?? e.message})`);
  }
  for (const f of ["observe", "judge"]) if (typeof m[f] !== "function") assert.fail(`blocked before behavioural assertion: kaal-testing/verifiers exports no ${f}`);
  if (!Array.isArray(m.SCENARIOS)) assert.fail("blocked before behavioural assertion: kaal-testing/verifiers exports no SCENARIOS");
  return m;
}

/** A verifier of its own: Guard's words, under another prefix. */
const VERIFIER = { prefix: "acme-verification ", words: { verified: "verified", failed: "failed", unknown: "cannot verify" } };
const EXIT = { verified: 0, failed: 1, unknown: 2 };
/** What the harness itself established about the run. */
const FACTS = {
  package: { name: "@acme/thing", version: "1.2.3", location: "/consumer/node_modules/@acme/thing" },
  platform: "linux",
  node: "v24.1.0",
  digest: "d".repeat(64),
  cases: ["acme/T1", "acme/T2"],
  target: "acme/T2",
  applicability: {},
};
/** The applicability the harness established itself for the targeted case: a platform scope that excludes this platform, and a reason. */
const SCOPE = { platforms: ["win32"], reason: "acme/T2 checks Windows ACLs" };
/** The facts in scenario `id`: only where the manifest declares the targeted case not applicable did the harness establish its applicability. */
const factsFor = (id) => (id === "not-applicable" ? { ...FACTS, applicability: { [FACTS.target]: SCOPE } } : FACTS);
/** What the contract expects in each scenario, owned by these tests rather than read from the implementation. */
const EXPECTED = {
  clean: { result: "verified", cases: "pass" },
  "no-case": { result: "unknown", cases: "none" },
  "manifest-absent": { result: "unknown", cases: "any" },
  "manifest-malformed": { result: "unknown", cases: "any" },
  "case-missing": { result: "unknown", cases: "pass", target: "not run" },
  "file-changed": { result: "unknown", cases: "any" },
  "file-removed": { result: "unknown", cases: "any" },
  "file-added": { result: "unknown", cases: "any" },
  "case-omitted": { result: "unknown", cases: "pass", target: "not run" },
  "case-substituted": { result: "unknown", cases: "pass", target: "not run" },
  "case-skipped": { result: "unknown", cases: "pass", target: "skipped" },
  "case-todo": { result: "unknown", cases: "pass", target: "todo" },
  "not-applicable": { result: "verified", cases: "pass", target: "not applicable" },
  "inapplicable-unsupported": { result: "unknown", cases: "pass", target: "not run" },
  "case-failing": { result: "failed", cases: "pass", target: "fail" },
  "consumer-changed": { result: "failed", cases: "pass" },
};
/** The summary a conforming verifier prints in scenario `id`: what the contract expects, in the verifier's words. */
function conforming({ id }) {
  const { result, cases, target } = EXPECTED[id];
  const outcome = (name) => (target && name === FACTS.target ? target : "pass");
  const summary = {
    result: VERIFIER.words[result],
    ...(result === "verified" ? {} : { cause: `the ${id} scenario` }),
    package: { ...FACTS.package },
    platform: FACTS.platform,
    node: FACTS.node,
    digest: FACTS.digest,
    cases: cases === "none" ? [] : FACTS.cases.map((name) => ({ name, outcome: outcome(name), ...(outcome(name) === "not applicable" ? { applicability: structuredClone(SCOPE) } : {}) })),
  };
  return summary;
}
const run = (summary, exit, extra = "") => ({ exit, stdout: `case acme/T1 ...\n${extra}${VERIFIER.prefix}${JSON.stringify(summary)}\nnpm notice after it\n` });

describe("The shared observable result contract for consumer verifiers (testing/C29)", () => {
  it("testing/T54 [testing/F43]: the contract names its scenarios, each with the change a publisher's harness makes and the result every conforming verifier then shows; it covers at least hosting/F26's minimum set", async () => {
    const { SCENARIOS } = await contract();
    const ids = SCENARIOS.map((s) => s.id);
    for (const id of Object.keys(EXPECTED)) assert.ok(ids.includes(id), `${id} is a scenario`);
    assert.equal(new Set(ids).size, ids.length, "scenario identities are unique");
    for (const s of SCENARIOS) {
      assert.ok(typeof s.change === "string" && s.change.length > 0, `${s.id} says what the harness changes`);
      const want = EXPECTED[s.id] ?? { result: "unknown" };
      assert.equal(s.result, want.result, `${s.id} expects ${want.result}: nothing else verifies or fails`);
      if (EXPECTED[s.id]) assert.deepEqual([s.cases, s.target], [want.cases, want.target], `${s.id} expects cases ${want.cases}, target ${want.target}`);
    }
    assert.ok(Object.isFrozen(SCENARIOS) && SCENARIOS.every(Object.isFrozen), "a caller cannot change the contract");
  });

  it("testing/T55 [testing/F44]: a run is observed from its exit status and its one summary line, read through the verifier's own declared words; anything else is no observation", async () => {
    const { observe, SCENARIOS } = await contract();
    const clean = SCENARIOS.find((s) => s.id === "clean");
    const seen = observe(run(conforming(clean), 0), VERIFIER);
    assert.equal(seen.observation.result, "verified");
    assert.equal(seen.observation.exit, 0);
    assert.deepEqual(seen.observation.package, FACTS.package);
    assert.deepEqual(seen.findings, []);
    const unknown = SCENARIOS.find((s) => s.id === "case-skipped");
    assert.equal(observe(run(conforming(unknown), 2), VERIFIER).observation.result, "unknown", "the verifier's own word for unknown is read as unknown");
    const none = {
      "no summary line": { exit: 0, stdout: "verified\n" },
      "two summary lines": run(conforming(clean), 0, `${VERIFIER.prefix}${JSON.stringify(conforming(clean))}\n`),
      "a summary that is not JSON": { exit: 0, stdout: `${VERIFIER.prefix}verified\n` },
      "a summary that is not an object": { exit: 0, stdout: `${VERIFIER.prefix}"verified"\n` },
    };
    for (const [why, r] of Object.entries(none)) {
      const o = observe(r, VERIFIER);
      assert.equal(o.observation, null, why);
      assert.ok(o.findings.length > 0, why);
    }
    const strange = observe(run({ ...conforming(clean), result: "ok" }, 0), VERIFIER);
    assert.equal(strange.observation?.result ?? null, null, "a word the verifier did not declare is no result");
    assert.ok(strange.findings.length > 0);
    for (const words of [undefined, { verified: "ok", failed: "ok", unknown: "?" }, { verified: "ok", failed: "bad" }]) {
      assert.equal(observe(run(conforming(clean), 0), { ...VERIFIER, words }).observation, null, `words ${JSON.stringify(words)}`);
    }
  });

  it("testing/T56 [testing/F45]: a verifier that shows what the contract expects conforms in every scenario", async () => {
    const { observe, judge, SCENARIOS } = await contract();
    for (const s of SCENARIOS) {
      const j = judge(s.id, observe(run(conforming(s), EXIT[s.result]), VERIFIER), factsFor(s.id));
      assert.deepEqual([j.scenario, j.conforms, j.differences], [s.id, true, []], s.id);
    }
    assert.equal(judge("no-such-scenario", observe(run(conforming(SCENARIOS[0]), 0), VERIFIER), FACTS).conforms, false);
  });

  it("testing/T57 [testing/F45]: a matching result label is never enough: exit status, cause, package, platform, Node, digest and every case's outcome are each compared with what the harness established", async () => {
    const { observe, judge, SCENARIOS } = await contract();
    const scenario = (id) => SCENARIOS.find((s) => s.id === id);
    const differs = (id, change, exit = EXIT[scenario(id).result]) => {
      const summary = conforming(scenario(id));
      change(summary);
      const j = judge(id, observe(run(summary, exit), VERIFIER), factsFor(id));
      return j.conforms === false && j.differences.length > 0;
    };
    assert.ok(differs("clean", () => {}, 2), "the right word with another exit status");
    assert.ok(differs("clean", (s) => (s.result = VERIFIER.words.failed)), "another word with the right exit status");
    assert.ok(differs("case-failing", () => {}, 2), "failed, with unknown's exit status");
    assert.ok(differs("case-failing", (s) => delete s.cause), "a failure that names no cause");
    assert.ok(differs("clean", (s) => (s.cause = "none")), "a verified run that names a cause");
    for (const k of ["name", "version", "location"]) assert.ok(differs("clean", (s) => (s.package[k] = "elsewhere")), `another package ${k}`);
    assert.ok(differs("clean", (s) => (s.package = undefined)), "no package");
    assert.ok(differs("clean", (s) => (s.platform = "win32")), "another platform");
    assert.ok(differs("clean", (s) => (s.node = "v22.0.0")), "another Node version");
    assert.ok(differs("clean", (s) => (s.digest = "e".repeat(64))), "another digest");
    assert.ok(differs("file-changed", (s) => (s.digest = "e".repeat(64))), "a digest that is not the installed files' as they now are");
    assert.ok(differs("clean", (s) => s.cases.pop()), "a declared case not reported");
    assert.ok(differs("clean", (s) => s.cases.push({ ...s.cases[0] })), "a case reported twice");
    assert.ok(differs("clean", (s) => (s.cases = "2 passed")), "cases that are only a count");
    assert.ok(differs("file-changed", (s) => (s.cases = [{ name: "acme/T1" }, { name: "acme/T2", outcome: "green" }])), "cases without an outcome the contract names, whatever the scenario");
    assert.ok(differs("case-skipped", (s) => (s.cases[1].outcome = "pass")), "the skipped case reported as passing");
    assert.ok(differs("case-failing", (s) => (s.cases[0].outcome = "fail")), "another case reported as failing");
    assert.ok(differs("not-applicable", (s) => ((s.cases[1].outcome = "skipped"), delete s.cases[1].applicability)), "an inapplicable case reported as skipped");
    assert.ok(differs("case-missing", (s) => s.cases.pop()), "the missing case not reported as not run");
    assert.ok(differs("no-case", (s) => s.cases.push({ name: "acme/T9", outcome: "pass" })), "a case reported where none is declared");
  });

  it("testing/T58 [testing/F46]: a verifier that claims verified, or failed, where the contract expects otherwise never conforms: zero or absent cases, a missing or tampered manifest or installation, skipped, todo and inapplicable cases, failures, and a changed consumer", async () => {
    const { observe, judge, SCENARIOS } = await contract();
    for (const s of SCENARIOS) {
      for (const claimed of ["verified", "failed", "unknown"].filter((r) => r !== s.result)) {
        const summary = { ...conforming(s), result: VERIFIER.words[claimed] };
        if (claimed === "verified") delete summary.cause;
        else summary.cause ??= "claimed";
        const j = judge(s.id, observe(run(summary, EXIT[claimed]), VERIFIER), factsFor(s.id));
        assert.equal(j.conforms, false, `${s.id}: a verifier claiming ${claimed} where ${s.result} is expected`);
      }
    }
    assert.equal(judge("clean", { observation: null, findings: ["no summary line"] }, FACTS).conforms, false, "a run with no observation never conforms");
  });

  it("testing/T59 [testing/F47]: a case is not applicable only where the harness itself established an explicit platform scope that excludes the platform, and a reason; a skipped, todo or unsupported case claimed inapplicable never verifies", async () => {
    const { observe, judge, SCENARIOS } = await contract();
    const verdict = (id, summary, exit, facts = factsFor(id)) => judge(id, observe(run(summary, exit), VERIFIER), facts);
    const claimInapplicable = (id) => {
      const summary = conforming({ id });
      summary.result = VERIFIER.words.verified;
      delete summary.cause;
      summary.cases[1] = { name: FACTS.target, outcome: "not applicable", applicability: structuredClone(SCOPE) };
      return summary;
    };
    for (const id of ["case-skipped", "case-todo", "inapplicable-unsupported"]) {
      assert.notEqual(SCENARIOS.find((s) => s.id === id).result, "verified", `${id} is never verified`);
      assert.equal(verdict(id, claimInapplicable(id), EXIT.verified).conforms, false, `${id}: the case converted into a claimed inapplicable one, verified`);
      const quiet = { ...claimInapplicable(id), result: VERIFIER.words.unknown, cause: "claimed" };
      assert.equal(verdict(id, quiet, EXIT.unknown).conforms, false, `${id}: the case claimed inapplicable, even under unknown`);
    }
    const unestablished = {
      "no applicability": { ...FACTS, applicability: {} },
      "a scope that includes this platform": { ...FACTS, applicability: { [FACTS.target]: { ...SCOPE, platforms: ["win32", "linux"] } } },
      "no platform scope": { ...FACTS, applicability: { [FACTS.target]: { ...SCOPE, platforms: [] } } },
      "no reason": { ...FACTS, applicability: { [FACTS.target]: { ...SCOPE, reason: "" } } },
      "applicability only inherited": { ...FACTS, applicability: Object.create({ [FACTS.target]: SCOPE }) },
    };
    for (const [why, facts] of Object.entries(unestablished)) {
      const summary = conforming({ id: "not-applicable" });
      if (Object.hasOwn(facts.applicability, FACTS.target)) summary.cases[1].applicability = structuredClone(facts.applicability[FACTS.target]);
      assert.equal(verdict("not-applicable", summary, EXIT.verified, facts).conforms, false, `the harness established ${why}, and the verifier shows the same`);
    }
    const shown = {
      "no applicability": (c) => delete c.applicability,
      "another reason": (c) => (c.applicability.reason = "it is not needed"),
      "another platform scope": (c) => (c.applicability.platforms = ["darwin"]),
    };
    for (const [why, change] of Object.entries(shown)) {
      const summary = conforming({ id: "not-applicable" });
      change(summary.cases[1]);
      assert.equal(verdict("not-applicable", summary, EXIT.verified).conforms, false, `the verifier shows ${why}`);
    }
    const other = conforming({ id: "clean" });
    other.cases[0] = { name: "acme/T1", outcome: "not applicable", applicability: structuredClone(SCOPE) };
    assert.equal(verdict("not-applicable", other, EXIT.verified).conforms, false, "another case claimed inapplicable on the targeted case's applicability");
  });

  it("testing/T60 [testing/F48]: neither evasion verifies: a declared case silently omitted on a platform, or replaced there by a stand-in, stays visible as not run; an inapplicable case is never counted as passed", async () => {
    const { observe, judge } = await contract();
    const verdict = (id, summary, exit) => judge(id, observe(run(summary, exit), VERIFIER), factsFor(id));
    const greenLooking = (id, cases) => ({ ...conforming({ id }), result: VERIFIER.words.verified, cause: undefined, cases });
    for (const id of ["case-omitted", "case-substituted"]) {
      assert.equal(verdict(id, conforming({ id }), EXIT.unknown).conforms, true, `${id}: a verifier that shows the declared case as not run conforms`);
      const omitted = [{ name: "acme/T1", outcome: "pass" }];
      assert.equal(verdict(id, greenLooking(id, omitted), EXIT.verified).conforms, false, `${id}: the declared case left out, verified`);
      assert.equal(verdict(id, { ...conforming({ id }), cases: omitted }, EXIT.unknown).conforms, false, `${id}: the declared case left out of the evidence, even under unknown`);
    }
    const standIn = [{ name: "acme/T1", outcome: "pass" }, { name: "acme/T2-linux", outcome: "pass" }];
    assert.equal(verdict("case-substituted", greenLooking("case-substituted", standIn), EXIT.verified).conforms, false, "a stand-in reported in place of the declared case, verified");
    const alongside = [{ name: "acme/T1", outcome: "pass" }, { name: FACTS.target, outcome: "not run" }, { name: "acme/T2-linux", outcome: "pass" }];
    assert.equal(verdict("case-substituted", { ...conforming({ id: "case-substituted" }), cases: alongside }, EXIT.unknown).conforms, false, "a stand-in reported beside the declared case it replaces");
    const counted = conforming({ id: "not-applicable" });
    counted.cases[1] = { name: FACTS.target, outcome: "pass" };
    assert.equal(verdict("not-applicable", counted, EXIT.verified).conforms, false, "an established inapplicable case counted as passed");
  });
});
