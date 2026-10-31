// testing/C31 planned outer tests: one candidate's runs on every supported platform show the same declared
// cases, each visible everywhere, and only the operating-system boundary scopes a case by platform. Immutable to DO and CHECK; testing/C32 turns them GREEN. Each title names the
// contracts it checks (plan/parity/*.md). They use kaal-testing's public interface only, on runs given as their
// exit status and output, and on facts a publisher's harness established on each platform.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

/** kaal-testing/verifiers' parity, or the reason the tests are blocked before any behavioural assertion. */
async function contract() {
  let m;
  try {
    m = await import("kaal-testing/verifiers");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-testing exports no ./verifiers (${e.code ?? e.message})`);
  }
  for (const f of ["observe", "parity"]) if (typeof m[f] !== "function") assert.fail(`blocked before behavioural assertion: kaal-testing/verifiers exports no ${f}`);
  return m;
}

const VERIFIER = { prefix: "acme-verification ", words: { verified: "verified", failed: "failed", unknown: "cannot verify" } };
const EXIT = { verified: 0, failed: 1, unknown: 2 };
const SUPPORTED = ["linux", "darwin", "win32"];
const [T1, T2, T3] = ["acme/T1", "acme/T2", "acme/T3"];
/** An applicability for acme/T3 that only the operating-system boundary may declare: Windows only, with a reason. */
const WINDOWS = { platforms: ["win32"], reason: "acme/T3 checks Windows ACLs" };
/** The applicability the harness established for acme/T3 in any package: it needs an optional complement, with a reason. */
const GRAPH = { requires: ["@acme/graph"], reason: "acme/T3 exercises the Graph complement" };
/** What the harness established on `platform` for the one candidate. */
const factsOn = (platform, extra = {}) => ({
  package: { name: "@acme/thing", version: "1.2.3", location: `/consumer-${platform}/node_modules/@acme/thing` },
  platform,
  node: "v24.1.0",
  digest: "d".repeat(64),
  cases: [T1, T2, T3],
  applicability: { [T3]: GRAPH },
  dependencies: [],
  complements: { "@acme/graph": platform === "darwin" ? "absent" : "present" },
  ...extra,
});
/** The case `name` reports on `platform` when every case does what the contract expects: macOS's consumer has not installed Graph. */
const honest = (platform, name) => (name === T3 && platform === "darwin" ? { name, outcome: "not applicable", applicability: structuredClone(GRAPH) } : { name, outcome: "pass" });
/** One platform's run: its summary, with `cases` and `result` as given, observed through the verifier's words. */
function runOn(observe, platform, { cases, result = "verified", facts = {} } = {}) {
  const f = factsOn(platform, facts);
  const summary = {
    result: VERIFIER.words[result],
    ...(result === "verified" ? {} : { cause: "c", evidence: ["e"], next: { kind: "diagnostic", step: "inspect the evidence" } }),
    package: { ...f.package },
    platform,
    node: f.node,
    digest: f.digest,
    cases: cases ?? f.cases.map((name) => honest(platform, name)),
  };
  return { observed: observe({ exit: EXIT[result], stdout: `${VERIFIER.prefix}${JSON.stringify(summary)}\n` }, VERIFIER), facts: f };
}
const outcomesOf = (p, name) => p.cases.find((c) => c.name === name)?.outcomes;

describe("Cross-platform inventory parity for one candidate (testing/C31)", () => {
  it("testing/T70 [testing/F56]: parity needs exactly one run per supported platform of one candidate, each with the same declared cases; anything else is unknown, with a finding", async () => {
    const { observe, parity } = await contract();
    const all = () => SUPPORTED.map((p) => runOn(observe, p));
    const clean = parity(all(), { supported: SUPPORTED });
    assert.deepEqual(clean.findings, []);
    assert.equal(clean.result, "verified");
    const broken = {
      "a supported platform without a run": [all()[1], all()[2]],
      "two runs on one platform": [...all(), runOn(observe, "linux")],
      "a run on a platform the package does not support": [...all(), runOn(observe, "freebsd")],
      "declared cases that differ on one platform": [all()[0], all()[1], runOn(observe, "win32", { facts: { cases: [T1, T2] }, cases: [T1, T2, T3].map((name) => honest("win32", name)) })],
      "another version on one platform": [all()[0], all()[1], runOn(observe, "win32", { facts: { package: { name: "@acme/thing", version: "1.2.4", location: "/c/node_modules/@acme/thing" } } })],
      "another digest on one platform": [all()[0], all()[1], runOn(observe, "win32", { facts: { digest: "e".repeat(64) } })],
      "no case declared anywhere": SUPPORTED.map((p) => runOn(observe, p, { facts: { cases: [], applicability: {} }, cases: [] })),
    };
    for (const [why, runs] of Object.entries(broken)) {
      const p = parity(runs, { supported: SUPPORTED });
      assert.equal(p.result, "unknown", why);
      assert.ok(p.findings.length > 0, why);
    }
    for (const [why, args] of Object.entries({ "no runs": [[], { supported: SUPPORTED }], "runs not a list": [undefined, { supported: SUPPORTED }], "no supported platforms": [all(), {}], "supported platforms repeated": [all(), { supported: [...SUPPORTED, "linux"] }] })) {
      const p = parity(...args);
      assert.equal(p.result, "unknown", why);
      assert.ok(p.findings.length > 0, why);
    }
  });

  it("testing/T71 [testing/F57]: every declared case stays visible on every platform: one left out, reported twice, or replaced by a stand-in is a finding, and it is not run there", async () => {
    const { observe, parity } = await contract();
    const honestOn = (p) => factsOn(p).cases.map((name) => honest(p, name));
    const evasions = {
      "left out on macOS": honestOn("darwin").filter((c) => c.name !== T2),
      "reported twice on macOS": [...honestOn("darwin"), { name: T2, outcome: "pass" }],
      "replaced on macOS by a stand-in": honestOn("darwin").map((c) => (c.name === T2 ? { name: "acme/T2-mac", outcome: "pass" } : c)),
      "a stand-in beside it on macOS": [...honestOn("darwin"), { name: "acme/T2-mac", outcome: "pass" }],
    };
    for (const [why, cases] of Object.entries(evasions)) {
      const p = parity([runOn(observe, "linux"), runOn(observe, "darwin", { cases }), runOn(observe, "win32")], { supported: SUPPORTED });
      assert.equal(p.result, "unknown", why);
      assert.ok(p.findings.length > 0, why);
      if (!why.startsWith("a stand-in beside")) assert.equal(outcomesOf(p, T2).darwin, "not run", `${why}: the declared case is not run there`);
    }
    const p = parity(SUPPORTED.map((pl) => runOn(observe, pl)), { supported: SUPPORTED });
    assert.deepEqual(outcomesOf(p, T1), { linux: "pass", darwin: "pass", win32: "pass" }, "each case shows its outcome on every platform");
  });

  it("testing/T72 [testing/F57, testing/F67]: a case is not applicable on a platform only with that platform's established applicability, and by a platform scope only in the operating-system boundary; it is never counted as passed, and a case not applicable on every platform is exercised on none", async () => {
    const { observe, parity } = await contract();
    const p = parity(SUPPORTED.map((pl) => runOn(observe, pl)), { supported: SUPPORTED });
    assert.deepEqual(p.findings, []);
    assert.equal(p.result, "verified", "an optional complement established absent exempts a case in any package");
    assert.deepEqual(outcomesOf(p, T3), { linux: "pass", darwin: "not applicable", win32: "pass" }, "not applicable stays not applicable, never pass");
    const windowsOnly = SUPPORTED.map((pl) => runOn(observe, pl, { facts: { applicability: { [T3]: WINDOWS } }, cases: [{ name: T1, outcome: "pass" }, { name: T2, outcome: "pass" }, pl === "win32" ? { name: T3, outcome: "pass" } : { name: T3, outcome: "not applicable", applicability: structuredClone(WINDOWS) }] }));
    const boundary = parity(windowsOnly, { supported: SUPPORTED, osBoundary: true });
    assert.equal(boundary.result, "verified", "the operating-system boundary may scope a case by platform");
    assert.deepEqual(outcomesOf(boundary, T3), { linux: "not applicable", darwin: "not applicable", win32: "pass" });
    for (const [why, opts] of Object.entries({ "any other package": {}, "a package said not to be the boundary": { osBoundary: false } })) {
      const v = parity(windowsOnly, { supported: SUPPORTED, ...opts });
      assert.equal(v.result, "unknown", `${why}: an operating-system scope outside the boundary is an architectural violation, never an exemption`);
      assert.ok(v.findings.some((f) => f.includes(T3) && f.includes("platform")), `${why}: the finding names the case and the platform scope`);
      assert.deepEqual(outcomesOf(v, T3), { linux: "not run", darwin: "not run", win32: "pass" }, `${why}: the case is not run where it claimed an exemption`);
    }
    assert.equal(parity(windowsOnly, { supported: SUPPORTED, osBoundary: "yes" }).result, "unknown", "whether the package is the boundary is established, never assumed");
    assert.equal(parity(SUPPORTED.map((pl) => runOn(observe, pl)), { supported: SUPPORTED, osBoundary: "yes" }).result, "unknown", "an answer that is not established is a finding even where no case is scoped by platform");
    const unsupported = SUPPORTED.map((pl) => runOn(observe, pl, { cases: [{ name: T1, outcome: "pass" }, { name: T2, outcome: pl === "linux" ? "not applicable" : "pass", ...(pl === "linux" ? { applicability: { platforms: ["darwin", "win32"], reason: "r" } } : {}) }, honest(pl, T3)] }));
    const u = parity(unsupported, { supported: SUPPORTED, osBoundary: true });
    assert.equal(u.result, "unknown", "a not applicable claim the harness did not establish on that platform never verifies");
    assert.equal(outcomesOf(u, T2).linux, "not run");
    assert.ok(u.findings.some((f) => f.includes(T2)), "the finding names the case");
    const nowhere = SUPPORTED.map((pl) => runOn(observe, pl, { facts: { applicability: { [T3]: { platforms: ["aix"], reason: "r" } } }, cases: [{ name: T1, outcome: "pass" }, { name: T2, outcome: "pass" }, { name: T3, outcome: "not applicable", applicability: { platforms: ["aix"], reason: "r" } }] }));
    const n = parity(nowhere, { supported: SUPPORTED, osBoundary: true });
    assert.equal(n.result, "unknown", "a case not applicable on every supported platform is exercised on none");
    assert.ok(n.findings.some((f) => f.includes(T3)), "the finding names the case");
  });

  it("testing/T73 [testing/F58]: together the runs are failed when any platform's is, verified only when every platform's is and nothing is found, and unknown otherwise; an unresolved challenge finding never verifies", async () => {
    const { observe, parity } = await contract();
    const failing = [runOn(observe, "linux"), runOn(observe, "darwin", { result: "failed", cases: [{ name: T1, outcome: "pass" }, { name: T2, outcome: "fail" }, honest("darwin", T3)] }), runOn(observe, "win32")];
    assert.equal(parity(failing, { supported: SUPPORTED }).result, "failed");
    const changed = [runOn(observe, "linux"), runOn(observe, "darwin", { result: "failed" }), runOn(observe, "win32")];
    assert.equal(parity(changed, { supported: SUPPORTED }).result, "failed", "a platform whose run is failed with every case passing, as when the consumer changed, fails the whole");
    assert.equal(parity(failing, { supported: SUPPORTED, challenged: [T1] }).result, "failed", "an established failure stays failed");
    const unknownOne = [runOn(observe, "linux"), runOn(observe, "darwin", { result: "unknown" }), runOn(observe, "win32")];
    assert.equal(parity(unknownOne, { supported: SUPPORTED }).result, "unknown", "one platform's unknown leaves the whole unknown");
    const claimed = [runOn(observe, "linux"), runOn(observe, "darwin", { cases: [{ name: T1, outcome: "pass" }, { name: T2, outcome: "skipped" }, honest("darwin", T3)] }), runOn(observe, "win32")];
    assert.equal(parity(claimed, { supported: SUPPORTED }).result, "unknown", "a run claiming verified with a skipped case never makes the whole verified");
    const clean = SUPPORTED.map((pl) => runOn(observe, pl));
    const weak = parity(clean, { supported: SUPPORTED, challenged: [T2] });
    assert.equal(weak.result, "unknown", "an unresolved challenge finding, from Hosting's suite or Engineering's enforcement, leaves its case's evidence unknown");
    assert.ok(weak.findings.some((f) => f.includes(T2)));
    assert.equal(parity(clean, { supported: SUPPORTED, challenged: "acme/T2" }).result, "unknown", "challenged cases that are not a list are not ignored");
    const lost = [runOn(observe, "linux"), { observed: { observation: null, findings: ["no summary line"] }, facts: factsOn("darwin") }, runOn(observe, "win32")];
    assert.equal(parity(lost, { supported: SUPPORTED }).result, "unknown", "a platform with no observation leaves the whole unknown");
  });
});
