// testing/C46 planned outer tests: Testing challenges how a run's time is spent, so that structural issues show
// up as evidence: a few cases taking most of the time, a case far slower than the run's own typical case, and a
// case far slower on one platform than on the others. Immutable to DO and CHECK; testing/C47 turns them GREEN.
// Each title names the contracts it checks (plan/timing/*.md). Durations are given as plain data, as a harness
// recorded them: Testing reads no clock.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

/** kaal-testing/timing, or the reason the tests are blocked before any behavioural assertion. */
async function timing() {
  let m;
  try {
    m = await import("kaal-testing/timing");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-testing exports no ./timing (${e.code ?? e.message})`);
  }
  for (const f of ["profile", "skew"]) if (typeof m[f] !== "function") assert.fail(`blocked before behavioural assertion: kaal-testing/timing exports no ${f}`);
  if (!m.DEFAULTS || typeof m.DEFAULTS !== "object") assert.fail("blocked before behavioural assertion: kaal-testing/timing exports no DEFAULTS");
  return m;
}

const run = (ms) => ({ cases: ms.map((d, i) => ({ name: `acme/T${i + 1}`, ms: d })) });
/** Ten cases sharing the time evenly: nothing to challenge. */
const EVEN = run([100, 110, 90, 105, 95, 100, 120, 80, 100, 100]);
/** Ten cases where two take almost all of the time: Guard's Windows lane in miniature. */
const CONCENTRATED = run([100, 100, 100, 100, 100, 100, 100, 100, 9000, 12000]);
const kinds = (p) => p.challenges.map((c) => c.kind).sort();

describe("Challenging how a run spends its time (testing/C46)", () => {
  it("testing/T92 [testing/F79]: a profile reads only given durations, and is unknown, never unchallenged, when they cannot carry a judgement", async () => {
    const { profile } = await timing();
    assert.equal(profile(EVEN).result, "unchallenged");
    assert.deepEqual(profile(EVEN).challenges, []);
    for (const [why, given] of Object.entries({
      "no run": undefined,
      "no cases": { cases: [] },
      "cases not a list": { cases: { "acme/T1": 5 } },
      "a negative duration": run([100, 100, 100, 100, -1]),
      "a duration that is not a number": run([100, 100, 100, 100, "100"]),
      "a non-finite duration": run([100, 100, 100, 100, Infinity]),
      "a case with no name": { cases: [...EVEN.cases.slice(1), { ms: 100 }] },
      "a case named twice": { cases: [...EVEN.cases, EVEN.cases[0]] },
      "fewer cases than the minimum": run([100, 100, 100, 100]),
      "no time spent at all": run([0, 0, 0, 0, 0, 0]),
    })) {
      const p = profile(given);
      assert.equal(p.result, "unknown", why);
      assert.ok(p.findings.length > 0, `${why} names what could not be read`);
      assert.deepEqual(p.challenges, [], `${why}: nothing is challenged from durations that do not read`);
    }
    const before = structuredClone(CONCENTRATED);
    profile(CONCENTRATED);
    assert.deepEqual(CONCENTRATED, before, "the run is not changed");
  });

  it("testing/T93 [testing/F80]: a run is challenged when its slowest cases take more than the budgeted share of the time, naming those cases and the shares", async () => {
    const { profile, DEFAULTS } = await timing();
    assert.equal(DEFAULTS.share, 0.8, "by default, 80% of the cases");
    assert.equal(DEFAULTS.budget, 0.8, "must run within more than 20% of the time: the slowest 20% may take at most 80%");
    const p = profile(CONCENTRATED);
    assert.equal(p.result, "challenged");
    const c = p.challenges.find((x) => x.kind === "concentration");
    assert.ok(c, "a concentration challenge");
    assert.deepEqual([...c.cases].sort(), ["acme/T10", "acme/T9"], "the slowest 20% of the cases, by name");
    assert.ok(Math.abs(c.timeShare - 21000 / 21800) < 1e-9, "the share of the time they took");
    assert.ok(Math.abs(c.caseShare - 0.2) < 1e-9, "the share of the cases they are");
    assert.equal(profile(run([100, 100, 100, 100, 100, 100, 100, 100, 200, 200])).challenges.filter((x) => x.kind === "concentration").length, 0, "the slowest 20% taking 33% of the time is no challenge");
    const edge = run([100, 100, 100, 100, 100, 100, 100, 100, 1600, 1600]);
    assert.ok(Math.abs(3200 / 4000 - 0.8) < 1e-9);
    assert.equal(profile(edge).challenges.filter((x) => x.kind === "concentration").length, 0, "exactly the budget is within it");
    assert.equal(profile(run([100, 100, 100, 100, 100, 100, 100, 100, 1601, 1601])).challenges.filter((x) => x.kind === "concentration").length, 1, "just over the budget is a challenge");
    const strict = profile(run([100, 100, 100, 100, 100, 100, 100, 100, 200, 200]), { share: 0.8, budget: 0.3 });
    assert.equal(strict.challenges.filter((x) => x.kind === "concentration").length, 1, "the caller may tighten the budget");
    const seven = profile(run([10, 10, 10, 10, 10, 10, 500]));
    assert.deepEqual(seven.challenges.find((x) => x.kind === "concentration")?.cases, ["acme/T7"], "the slowest share is rounded down to whole cases, and is at least one");
  });

  it("testing/T94 [testing/F81]: a case is challenged as an outlier when it takes many times the run's median case and more than the floor; a uniformly slow run is not", async () => {
    const { profile, DEFAULTS } = await timing();
    assert.equal(DEFAULTS.outlier, 10, "ten times the median case");
    assert.equal(DEFAULTS.floor, 1000, "and more than a second");
    const p = profile(CONCENTRATED);
    const outliers = p.challenges.filter((x) => x.kind === "outlier").map((x) => x.case).sort();
    assert.deepEqual(outliers, ["acme/T10", "acme/T9"]);
    const o = p.challenges.find((x) => x.kind === "outlier" && x.case === "acme/T10");
    assert.equal(o.ms, 12000);
    assert.equal(o.median, 100);
    assert.equal(profile(run([1, 1, 1, 1, 1, 1, 1, 1, 1, 500])).challenges.filter((x) => x.kind === "outlier").length, 0, "500 times the median, but under the floor, is no outlier");
    assert.equal(profile(run([5000, 5100, 4900, 5000, 5200, 5000, 4800, 5000, 5000, 5000])).result, "unchallenged", "a uniformly slow run is not challenged by its own distribution");
    assert.equal(profile(run([100, 100, 100, 100, 100, 100, 100, 100, 100, 1000]), { floor: 0 }).challenges.filter((x) => x.kind === "outlier").length, 0, "exactly ten times the median is within it");
    assert.deepEqual(kinds(profile(run([100, 100, 100, 100, 100, 100, 100, 100, 100, 1001]))), ["outlier"], "just over ten times the median, and over the floor, is an outlier");
    assert.deepEqual(kinds(profile(run([100, 100, 100, 100, 100, 100, 100, 100, 100, 1001]), { floor: 2000 })), [], "a caller may raise the floor");
    assert.deepEqual(kinds(profile(run([1, 1, 1, 1, 1, 1, 1, 1, 1, 500]), { floor: 0, budget: 1 })), ["outlier"], "and lower it");
  });

  it("testing/T95 [testing/F82]: across platforms, a case is challenged where one platform takes many times its time on the others and more than the floor, naming the platform", async () => {
    const { skew } = await timing();
    const on = (platform, ms) => ({ platform, ...run(ms) });
    const runs = [
      on("darwin", [100, 100, 100, 100, 3000]),
      on("linux", [100, 100, 100, 100, 2800]),
      on("win32", [100, 100, 100, 100, 41000]),
    ];
    const s = skew(runs);
    assert.equal(s.result, "challenged");
    assert.deepEqual(s.challenges.map((c) => [c.kind, c.case, c.platform]), [["skew", "acme/T5", "win32"]]);
    const c = s.challenges[0];
    assert.equal(c.ms, 41000);
    assert.equal(c.others, 2900, "the median of the case's time on the other platforms");
    assert.equal(skew([on("darwin", [100, 100, 100, 100, 100]), on("linux", [100, 100, 100, 100, 120]), on("win32", [100, 100, 100, 100, 900])]).result, "unchallenged", "nine times as slow but under the floor is no skew");
    assert.equal(skew([on("linux", [100, 100, 100, 100, 3000]), on("win32", [100, 100, 100, 100, 12000])]).result, "unchallenged", "four times as slow is within the factor");
    assert.equal(skew([on("linux", [100, 100, 100, 100, 3000]), on("win32", [100, 100, 100, 100, 12001])]).result, "challenged", "just over four times is skew");
    for (const [why, given] of Object.entries({
      "one platform": [on("linux", [100, 100, 100, 100, 100])],
      "a platform twice": [on("linux", [100, 100, 100, 100, 100]), on("linux", [100, 100, 100, 100, 100]), on("win32", [100, 100, 100, 100, 100])],
      "a run without its platform": [on("linux", [100, 100, 100, 100, 100]), run([100, 100, 100, 100, 100])],
      "a run whose durations do not read": [on("linux", [100, 100, 100, 100, 100]), on("win32", [100, 100, 100, 100, -5])],
      "not a list": { linux: 1 },
    })) {
      const r = skew(given);
      assert.equal(r.result, "unknown", why);
      assert.ok(r.findings.length > 0, why);
    }
    assert.ok(skew([on("linux", [100, 100, 100, 100, 100]), on("win32", [100, 100, 100, 100, -5])]).findings.some((f) => f.includes("win32") && f.includes("-5")), "a duration that does not read is named with its platform");
    const partial = skew([on("linux", [100, 100, 100, 100, 100]), { platform: "win32", cases: run([100, 100, 100, 100, 100]).cases.slice(0, 4).concat([{ name: "acme/T9", ms: 100 }]) }]);
    assert.equal(partial.result, "unknown", "the platforms' runs must hold the same cases");
    assert.ok(partial.findings.some((f) => f.includes("acme/T5")) && partial.findings.some((f) => f.includes("acme/T9")), "naming each case some platform did not run");
  });

  it("testing/T96 [testing/F83, testing/F67]: a challenge is evidence of a structural issue, never a failed or verified run, and a platform's skew is the operating-system boundary's to explain", async () => {
    const { profile, skew } = await timing();
    for (const p of [profile(CONCENTRATED), skew([{ platform: "linux", ...run([100, 100, 100, 100, 3000]) }, { platform: "win32", ...run([100, 100, 100, 100, 41000]) }])]) {
      assert.ok(["challenged", "unchallenged", "unknown"].includes(p.result));
      assert.ok(!["failed", "verified", "passed"].includes(p.result), "timing never decides a run's result");
      for (const c of p.challenges) {
        assert.ok(typeof c.kind === "string" && typeof c.statement === "string" && c.statement.length > 0, "each challenge states what it found in words");
        assert.ok(typeof c.next === "string" && c.next.length > 0, "and the next step it asks for");
      }
    }
    const s = skew([{ platform: "linux", ...run([100, 100, 100, 100, 3000]) }, { platform: "win32", ...run([100, 100, 100, 100, 41000]) }]);
    assert.equal(s.challenges[0].owner, "hosting", "a platform-specific slowdown is routed to Hosting, the only owner of operating-system behaviour");
    assert.ok(profile(CONCENTRATED).challenges.every((c) => c.owner === "case owner"), "a run's own concentration and outliers are the case owner's");
  });

  it("testing/T97 [testing/N17]: profiling is pure and deterministic: the same durations give the same challenges in the same order, whatever order the cases came in", async () => {
    const { profile, skew } = await timing();
    const reversed = { cases: [...CONCENTRATED.cases].reverse() };
    assert.deepEqual(profile(reversed), profile(CONCENTRATED));
    const runs = [{ platform: "win32", ...run([100, 100, 100, 100, 41000]) }, { platform: "linux", ...run([100, 100, 100, 100, 3000]) }, { platform: "darwin", ...run([100, 9000, 100, 100, 3000]) }];
    assert.equal(skew(runs).challenges.length, 2);
    assert.deepEqual(skew(runs), skew([...runs].reverse()));
    const four = ["win32", "freebsd", "linux", "darwin"].map((platform, i) => ({ platform, ...run([100, 100, 100, 100, i < 2 ? 10000 : 100]) }));
    assert.deepEqual(skew(four).challenges.map((c) => c.platform), ["freebsd", "win32"], "two platforms skewed on one case are named in a stable order");
    for (const bad of [{ share: 0 }, { share: 1 }, { budget: 1.5 }, { outlier: 1 }, { floor: -1 }, { factor: 0.5 }, { minimum: 0 }, { unknownKey: 1 }]) {
      const p = profile(EVEN, bad);
      assert.equal(p.result, "unknown", JSON.stringify(bad));
      assert.ok(p.findings.length > 0);
    }
  });
});
