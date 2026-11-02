// kaal-testing's embedded cases for the consumer verifier contract (testing/F43–testing/F50, testing/F56–testing/F58).
// They reach the installed package by its name and decide each requirement from behaviour.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { judge, observe, parity, SCENARIOS } from "kaal-testing/verifiers";

const VERIFIER = { prefix: "acme-verification ", words: { verified: "verified", failed: "failed", unknown: "cannot verify" } };
const FACTS = { package: { name: "@acme/thing", version: "1.0.0", location: "/c/node_modules/@acme/thing" }, platform: "host-a", node: "v24.1.0", digest: "d".repeat(64), cases: ["acme/T1"], applicability: {}, dependencies: [], complements: {} };
const SUMMARY = { result: "verified", package: FACTS.package, platform: FACTS.platform, node: FACTS.node, digest: FACTS.digest, cases: [{ name: "acme/T1", outcome: "pass" }] };
const ran = (summary, exit = 0) => observe({ exit, stdout: `${VERIFIER.prefix}${JSON.stringify(summary)}\n` }, VERIFIER);

describe("Consumer verifier conformance", () => {
  it("names each scenario once, with the result every conforming verifier must show [testing/F43]", () => {
    const ids = SCENARIOS.map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length);
    assert.equal(SCENARIOS.find((s) => s.id === "clean").result, "verified");
  });

  it("observes exactly one summary line, read through the verifier's own words [testing/F44]", () => {
    assert.equal(ran(SUMMARY).observation.result, "verified");
    const twice = observe({ exit: 0, stdout: `${VERIFIER.prefix}{}\n${VERIFIER.prefix}{}\n` }, VERIFIER);
    assert.equal(twice.observation, null);
  });

  it("conforms a clean run only when every observable matches what the harness established [testing/F45, testing/F46]", () => {
    assert.deepEqual(judge("clean", ran(SUMMARY), FACTS).differences, []);
    assert.equal(judge("clean", ran({ ...SUMMARY, digest: "e".repeat(64) }), FACTS).conforms, false);
  });

  it("holds one candidate's runs on every supported platform to the same declared cases [testing/F56, testing/F57]", () => {
    const runs = ["host-a", "host-b", "host-c"].map((platform) => ({ observed: ran({ ...SUMMARY, platform }), facts: { ...FACTS, platform } }));
    assert.equal(parity(runs, { supported: ["host-a", "host-b", "host-c"] }).result, "verified");
    assert.equal(parity(runs.slice(0, 2), { supported: ["host-a", "host-b", "host-c"] }).result, "unknown");
  });
});
