// testing/C39 planned outer tests: applicability by host fact, the fourth way of testing/F47 (Option C of
// hosting/C16, #674). Immutable to DO and CHECK; testing/C40 turns them GREEN. Each title names the contracts
// it checks (plan/host/*.md). They use kaal-testing's public interface only, on runs given as their exit
// status and output, and on host facts shaped as Hosting's facts() returns them (hosting/F37).
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import { judge, observe, SCENARIOS } from "kaal-testing/verifiers";

const VERIFIER = { prefix: "acme-verification ", words: { verified: "verified", failed: "failed", unknown: "cannot verify" } };
const FACT = "kaal-hosting/special-entries";
const EVIDENCE = "https://nodejs.org/api/net.html#identifying-paths-for-ipc-connections";
/** Hosting's facts() on a host where the fact does not hold, and on one where it does. */
const ABSENT = { [FACT]: { holds: false, reason: "no FIFO or Unix-domain socket can be placed in a directory tree here", evidence: EVIDENCE } };
const HOLDS = { [FACT]: { holds: true, reason: "a FIFO and a Unix-domain socket were placed in a fresh directory", evidence: EVIDENCE } };
const DECLARED = { host: [FACT], reason: "acme/T2 inspects a FIFO and a socket in a tree", evidence: EVIDENCE };
const FACTS = {
  package: { name: "@acme/thing", version: "1.2.3", location: "/consumer/node_modules/@acme/thing" },
  platform: "win32",
  node: "v24.1.0",
  digest: "d".repeat(64),
  cases: ["acme/T1", "acme/T2"],
  target: "acme/T2",
  applicability: { "acme/T2": DECLARED },
  dependencies: ["@acme/core"],
  complements: {},
  hostFacts: ABSENT,
};
/** The summary of a verified run, the targeted case reported with `target`. */
const summary = (target, applicability = structuredClone(DECLARED)) => ({
  result: VERIFIER.words.verified,
  package: { ...FACTS.package },
  platform: FACTS.platform,
  node: FACTS.node,
  digest: FACTS.digest,
  cases: [{ name: "acme/T1", outcome: "pass" }, { name: "acme/T2", outcome: target, ...(target === "not applicable" ? { applicability } : {}) }],
});
const verdict = (scenario, s, facts = FACTS) => judge(scenario, observe({ exit: 0, stdout: `${VERIFIER.prefix}${JSON.stringify(s)}\n` }, VERIFIER), facts);

describe("Applicability by host fact (testing/C39)", () => {
  it("testing/T80 [testing/F68, testing/F69, testing/F71]: a case declared by a host fact that the harness established not holding, reported not applicable with that same applicability, conforms to the not-applicable scenario", () => {
    assert.deepEqual(verdict("not-applicable", summary("not applicable")).differences, []);
    assert.deepEqual(verdict("not-applicable", summary("not applicable", { reason: DECLARED.reason, evidence: EVIDENCE, host: [FACT, FACT] }), { ...FACTS, applicability: { "acme/T2": { ...DECLARED, host: [FACT, FACT] } } }).differences, [], "host is compared as a set");
    const two = { ...DECLARED, host: ["kaal-hosting/other", FACT] };
    assert.deepEqual(verdict("not-applicable", summary("not applicable", { ...two, host: [FACT, "kaal-hosting/other"] }), { ...FACTS, applicability: { "acme/T2": two } }).differences, [], "one fact not holding is enough, whatever the others");
    const s = SCENARIOS.find((x) => x.id === "not-applicable");
    assert.match(s.change, /host fact/, "the not-applicable scenario names a host fact as well as a platform scope");
    assert.deepEqual([s.result, s.cases, s.target], ["verified", "pass", "not applicable"]);
  });

  it("testing/T81 [testing/F68, testing/F69]: a host declaration establishes nothing where the fact holds, was not established, is inherited, or has no reason or https evidence; and a verifier that shows another host list, other evidence or no host never conforms", () => {
    assert.equal(verdict("not-applicable", summary("not applicable")).conforms, true, "the positive control: an established host declaration conforms");
    const harness = {
      "the fact holds here": { ...FACTS, hostFacts: HOLDS },
      "no host fact established": { ...FACTS, hostFacts: undefined },
      "another fact established": { ...FACTS, hostFacts: { "kaal-hosting/other": ABSENT[FACT] } },
      "holds is not a boolean": { ...FACTS, hostFacts: { [FACT]: { ...ABSENT[FACT], holds: "false" } } },
      "holds is missing": { ...FACTS, hostFacts: { [FACT]: { reason: "r", evidence: EVIDENCE } } },
      "an inherited fact": { ...FACTS, applicability: { "acme/T2": { ...DECLARED, host: ["constructor"] } }, hostFacts: Object.create({ constructor: { holds: false } }) },
      "an empty host list": { ...FACTS, applicability: { "acme/T2": { ...DECLARED, host: [] } } },
      "a host list naming an empty fact": { ...FACTS, applicability: { "acme/T2": { ...DECLARED, host: [""] } }, hostFacts: { "": ABSENT[FACT] } },
      "host facts that are a list, not a map": { ...FACTS, applicability: { "acme/T2": { ...DECLARED, host: ["0"] } }, hostFacts: [ABSENT[FACT]] },
      "no reason": { ...FACTS, applicability: { "acme/T2": { ...DECLARED, reason: "" } } },
      "no evidence": { ...FACTS, applicability: { "acme/T2": { host: [FACT], reason: DECLARED.reason } } },
      "evidence that is not https": { ...FACTS, applicability: { "acme/T2": { ...DECLARED, evidence: "http://example.com/x" } } },
      "evidence that only names https": { ...FACTS, applicability: { "acme/T2": { ...DECLARED, evidence: "see https://example.com" } } },
    };
    for (const [why, facts] of Object.entries(harness)) {
      const shown = structuredClone(facts.applicability["acme/T2"]);
      assert.equal(verdict("not-applicable", summary("not applicable", shown), facts).conforms, false, `${why}, and the verifier shows the same declaration`);
    }
    const shown = {
      "another host list": { ...DECLARED, host: ["kaal-hosting/other"] },
      "an extra fact": { ...DECLARED, host: [FACT, "kaal-hosting/other"] },
      "other evidence": { ...DECLARED, evidence: "https://example.com/other" },
      "no evidence": { host: [FACT], reason: DECLARED.reason },
      "no host": { reason: DECLARED.reason, evidence: EVIDENCE },
      "a platform scope instead": { platforms: ["linux"], reason: DECLARED.reason },
      "another reason": { ...DECLARED, reason: "something else" },
    };
    for (const [why, applicability] of Object.entries(shown)) assert.equal(verdict("not-applicable", summary("not applicable", applicability)).conforms, false, `the verifier shows ${why}`);
  });

  it("testing/T82 [testing/F70]: where the fact holds, the declared case runs: reported pass it conforms to clean, and reported not applicable, skipped, todo or not run it does not", () => {
    assert.equal(verdict("not-applicable", summary("not applicable")).conforms, true, "the positive control: where the fact does not hold, the case is not applicable");
    const here = { ...FACTS, platform: "linux", hostFacts: HOLDS, target: undefined };
    const at = (s) => ({ ...s, platform: "linux" });
    assert.deepEqual(verdict("clean", at(summary("pass")), here).differences, [], "a host-declared case run and passing where the fact holds");
    for (const outcome of ["not applicable", "skipped", "todo", "not run"]) assert.equal(verdict("clean", at(summary(outcome)), here).conforms, false, `${outcome} where the fact holds`);
    const counted = summary("not applicable");
    counted.cases[1].outcome = "pass";
    assert.equal(verdict("not-applicable", counted).conforms, false, "an established inapplicable case counted as passed");
  });

  it("testing/T83 [testing/F71, testing/N14]: the C29 contract stands: no scenario is added, the platform way is unchanged, and the module still imports nothing", async () => {
    assert.equal(SCENARIOS.length, 19, "testing/F43's nineteen scenarios, none added");
    const scope = { platforms: ["win32"], reason: "acme/T2 checks Windows ACLs" };
    const facts = { ...FACTS, platform: "linux", applicability: { "acme/T2": scope }, hostFacts: undefined };
    assert.deepEqual(verdict("not-applicable", { ...summary("not applicable", structuredClone(scope)), platform: "linux" }, facts).differences, [], "the platform way is judged as testing/C29 planned; its legitimacy is Hosting's audit and testing/F67");
    const source = await readFile(new URL("../../lib/verifiers.mjs", import.meta.url), "utf8");
    assert.doesNotMatch(source, /^\s*import\b|\bimport\s*\(|\brequire\s*\(/m, "host facts arrive as data; the module reads no host");
  });
});
