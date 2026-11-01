// testing/C52 planned outer tests: Testing learns from a history of runs which Cases are badly designed for their
// time, and holds their redesign to RED → GREEN → REFACTOR: a refactored Case keeps its targets and its
// discriminating RED and GREEN verdicts, and its time is shown on later runs. Immutable to DO and CHECK;
// testing/C53 turns them GREEN. Each title names the contracts it checks (plan/redesign/*.md). Runs and verdicts
// are given as plain data, as the caller kept them: Testing keeps no history and reads no clock.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

/** kaal-testing/redesign, or the reason the tests are blocked before any behavioural assertion. */
async function redesign() {
  let m;
  try {
    m = await import("kaal-testing/redesign");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-testing exports no ./redesign (${e.code ?? e.message})`);
  }
  for (const f of ["candidates", "refactored"]) if (typeof m[f] !== "function") assert.fail(`blocked before behavioural assertion: kaal-testing/redesign exports no ${f}`);
  if (!m.DEFAULTS || typeof m.DEFAULTS !== "object") assert.fail("blocked before behavioural assertion: kaal-testing/redesign exports no DEFAULTS");
  return m;
}

const V1 = "1".repeat(64);
const V2 = "2".repeat(64);
const OTHER = "9".repeat(64);
/** One run on `platform`: eight quick Cases, and acme/T9 and acme/T10 at the given times. */
const run = (platform, t9, t10 = 100, v9 = V1) => ({
  platform,
  cases: [
    ...Array.from({ length: 8 }, (_, i) => ({ name: `acme/T${i + 1}`, sha256: OTHER, ms: 100 })),
    { name: "acme/T9", sha256: v9, ms: t9 },
    { name: "acme/T10", sha256: OTHER, ms: t10 },
  ],
});
const SLOW = 9000;
const QUICK = 100;

describe("Learning which Cases to redesign, and holding the redesign to RED → GREEN → REFACTOR (testing/C52)", () => {
  it("testing/T110 [testing/F93]: a history is read only as given, oldest first, and is unknown, never unchallenged, when it cannot carry a judgement", async () => {
    const { candidates, DEFAULTS } = await redesign();
    assert.deepEqual({ ...DEFAULTS }, { window: 5, recur: 3 });
    const good = run("linux", SLOW);
    for (const [why, history, options] of [
      ["a history that is not a list", { runs: [] }],
      ["a run that is not an object", [good, null]],
      ["a run with no platform", [{ ...good, platform: "" }]],
      ["cases that are not a list", [{ platform: "linux", cases: {} }]],
      ["a case with no name", [{ platform: "linux", cases: [...good.cases, { sha256: V1, ms: 1 }] }]],
      ["a case reported twice", [{ platform: "linux", cases: [...good.cases, good.cases[0]] }]],
      ["a case with no version", [{ platform: "linux", cases: [...good.cases.slice(1), { name: "acme/T1", ms: 1 }] }]],
      ["a negative duration", [{ platform: "linux", cases: [...good.cases.slice(1), { name: "acme/T1", sha256: V1, ms: -1 }] }]],
      ["an unknown option", [good], { windows: 5 }],
      ["a window that is not a whole number", [good], { window: 2.5 }],
      ["recur above the window", [good], { window: 2, recur: 3 }],
      ["a timing option out of range", [good], { share: 1.5 }],
    ]) {
      const c = candidates(history, options);
      assert.equal(c.result, "unknown", why);
      assert.ok(c.findings.length > 0, `${why} is a finding`);
      assert.deepEqual(c.candidates, [], `${why} names no candidate`);
    }
    assert.equal(candidates([], undefined).result, "unchallenged", "an empty history shows no candidate, and it is no finding");
  });

  it("testing/T111 [testing/F94, testing/F80, testing/F81]: a Case among the slowest of its run, again and again in the recent runs of its current version on a platform, is a redesign candidate on that Case", async () => {
    const { candidates } = await redesign();
    const c0 = () => candidates([run("linux", SLOW), run("linux", SLOW), run("linux", SLOW)]);
    const once = candidates([run("linux", QUICK), run("linux", SLOW), run("linux", QUICK)]);
    assert.equal(once.result, "unchallenged", "one slow run is a challenge of that run (testing/C46), never a redesign");
    assert.ok(!c0().candidates.some((x) => x.case === "acme/T1"), "a quick Case that only fills the slowest share is not a candidate");
    const history = [run("linux", SLOW), run("linux", QUICK), run("linux", SLOW), run("linux", SLOW)];
    const c = candidates(history);
    assert.equal(c.result, "challenged");
    assert.deepEqual(c.candidates.map((x) => [x.kind, x.case, x.version, x.platform, x.seen, x.of, x.medianMs, x.owner]), [["redesign", "acme/T9", V1, "linux", 3, 4, SLOW, "case owner"]]);
    assert.deepEqual(c.candidates[0].signals, { concentration: 3, outlier: 3 }, "each run's concentration and outlier signals are counted");
    assert.match(c.candidates[0].statement, /acme\/T9 .* 3 of its last 4 runs on linux/);
    assert.match(c.candidates[0].next, /redesign acme\/T9/);
    const windowed = candidates([run("linux", SLOW), run("linux", SLOW), run("linux", SLOW), run("linux", QUICK), run("linux", QUICK), run("linux", QUICK), run("linux", QUICK), run("linux", QUICK)]);
    assert.equal(windowed.result, "unchallenged", "only the last window of runs counts: a Case that got fast is no longer a candidate");
    const apart = candidates([run("linux", SLOW), run("win32", SLOW), run("linux", SLOW), run("win32", QUICK), run("darwin", SLOW)]);
    assert.equal(apart.result, "unchallenged", "each platform's runs are their own distribution: two slow runs on linux are not three");
    const both = candidates([...history, run("win32", SLOW, SLOW), run("win32", SLOW, SLOW), run("win32", SLOW, SLOW)]);
    assert.deepEqual(both.candidates.map((x) => `${x.case} ${x.platform}`).sort(), ["acme/T10 win32", "acme/T9 linux", "acme/T9 win32"]);
    const few = { platform: "linux", cases: run("linux", SLOW).cases.slice(-3) };
    const skipped = candidates([run("linux", SLOW), few, run("linux", SLOW), few]);
    assert.deepEqual(skipped.unprofiled.map((u) => u.run), [2, 4], "a run that cannot be profiled is listed, and counts for nothing");
    assert.equal(skipped.result, "unchallenged");
    const shaped = (fast, t9, t10 = 100) => ({ platform: "linux", cases: [...Array.from({ length: 8 }, (_, i) => ({ name: `acme/T${i + 1}`, sha256: OTHER, ms: fast })), { name: "acme/T9", sha256: V1, ms: t9 }, { name: "acme/T10", sha256: OTHER, ms: t10 }] });
    const outlierOnly = candidates([shaped(300, 3500), shaped(300, 3500), shaped(300, 3500)]);
    assert.deepEqual(outlierOnly.candidates.map((x) => [x.case, x.signals]), [["acme/T9", { concentration: 0, outlier: 3 }]], "an outlier alone, again and again, is a candidate");
    const concentrationOnly = candidates([shaped(100, 1800, 1800), shaped(100, 1800, 1800), shaped(100, 1800, 1800)], { outlier: 20 });
    assert.deepEqual(concentrationOnly.candidates.map((x) => [x.case, x.signals]), [["acme/T10", { concentration: 3, outlier: 0 }], ["acme/T9", { concentration: 3, outlier: 0 }]], "and so is a slow Case in the concentrated share alone");
    assert.equal(candidates(history, { recur: 4 }).result, "unchallenged", "the caller may ask for more recurrences");
    assert.equal(candidates(history, { window: 2, recur: 2 }).result, "challenged", "or a shorter window");
  });

  it("testing/T112 [testing/F93, testing/F95]: a file hash starts a fresh window for every Case in the file, and later timing comparisons do not establish a refactoring", async () => {
    const { candidates } = await redesign();
    const slow = [run("linux", SLOW), run("linux", SLOW), run("linux", SLOW)];
    assert.equal(candidates(slow).result, "challenged");
    const fresh = candidates([...slow, run("linux", QUICK, 100, V2)]);
    assert.equal(fresh.result, "unchallenged", "the earlier version's runs no longer stand for the Case");
    assert.deepEqual(fresh.refactors, [{ case: "acme/T9", platform: "linux", from: V1, to: V2, beforeMs: SLOW, afterMs: QUICK, runs: 1, shown: "pending" }], "until the new version has run enough, its improvement is pending");
    const shown = candidates([...slow, run("linux", QUICK, 100, V2), run("linux", 120, 100, V2), run("linux", 110, 100, V2)]);
    assert.deepEqual(shown.refactors.map((r) => [r.case, r.beforeMs, r.afterMs, r.runs, r.shown]), [["acme/T9", SLOW, 110, 3, "faster"]], "then it is shown on later runs");
    const long = [...Array.from({ length: 6 }, () => run("linux", 2000)), ...slow, run("linux", SLOW), run("linux", SLOW), run("linux", QUICK, 100, V2)];
    assert.equal(candidates(long).refactors[0].beforeMs, SLOW, "the earlier version's time is its last window of runs, as the new version's is");
    const notFaster = candidates([...slow, run("linux", SLOW, 100, V2), run("linux", SLOW, 100, V2), run("linux", SLOW, 100, V2)]);
    assert.equal(notFaster.refactors[0].shown, "not faster");
    assert.deepEqual(notFaster.candidates.map((x) => [x.case, x.version]), [["acme/T9", V2]], "a new version that is still slow is a candidate again, as itself");

    // T9 and T10 share a file. Only T9 was edited; the file digest changes for both.
    const sharedFile = (version, t9) => {
      const r = run("linux", t9, SLOW, version);
      return { ...r, cases: r.cases.map((c) => c.name === "acme/T10" ? { ...c, sha256: version } : c) };
    };
    const oldFile = Array.from({ length: 3 }, () => sharedFile(V1, SLOW));
    assert.deepEqual(candidates(oldFile).candidates.map((c) => c.case), ["acme/T10", "acme/T9"]);
    const newFile = Array.from({ length: 3 }, () => sharedFile(V2, QUICK));
    const reset = candidates([...oldFile, ...newFile.slice(0, 2)]);
    assert.deepEqual(reset.candidates, [], "even untouched T10 starts afresh: its earlier signals do not carry over");
    const later = candidates([...oldFile, ...newFile]);
    assert.deepEqual(later.candidates.map((c) => [c.case, c.version, c.seen, c.of]), [["acme/T10", V2, 3, 3]], "untouched T10 can become a candidate again after enough new-file runs");
    assert.deepEqual([...later.refactors].sort((a, b) => a.case.localeCompare(b.case)), [
      { case: "acme/T10", platform: "linux", from: V1, to: V2, beforeMs: SLOW, afterMs: SLOW, runs: 3, shown: "not faster" },
      { case: "acme/T9", platform: "linux", from: V1, to: V2, beforeMs: SLOW, afterMs: QUICK, runs: 3, shown: "faster" },
    ], "both rows are timing comparisons only, with no claim that either Case was refactored or its behaviour kept");
  });

  it("testing/T113 [testing/F96]: a redesign is a refactoring only when the Case keeps its targets and its discriminating RED and GREEN verdicts", async () => {
    const { refactored } = await redesign();
    const before = { id: "acme/T9", version: V1, tests: ["acme/F1", "acme/F2"], verdicts: { candidate: "pass", "mutant 1": "fail", "before the change": "fail" } };
    const after = { ...before, version: V2, tests: ["acme/F2", "acme/F1"], verdicts: { "before the change": "fail", "mutant 1": "fail", candidate: "pass", "mutant 2": "fail" } };
    assert.deepEqual(refactored(before, after), { result: "kept", differences: [], findings: [] }, "same Case, new version, same targets, the same verdict on every subject: RED stays RED, GREEN stays GREEN");
    for (const [why, changed, says] of [
      ["it stopped discriminating a mutant", { ...after, verdicts: { ...after.verdicts, "mutant 1": "pass" } }, /mutant 1 .*GREEN, where it was RED/],
      ["it fails the candidate", { ...after, verdicts: { ...after.verdicts, candidate: "fail" } }, /candidate .*RED, where it was GREEN/],
      ["it was not judged on a RED subject", { ...after, verdicts: { candidate: "pass", "mutant 1": "fail" } }, /not judged on before the change, where it was RED/],
      ["it dropped a target", { ...after, tests: ["acme/F1"] }, /no longer tests acme\/F2/],
      ["it added a target", { ...after, tests: ["acme/F1", "acme/F2", "acme/F3"] }, /now also tests acme\/F3/],
      ["it is another Case", { ...after, id: "acme/T10" }, /acme\/T10, not acme\/T9/],
      ["its version did not change", { ...after, version: V1 }, /version is unchanged/],
    ]) {
      const r = refactored(before, changed);
      assert.equal(r.result, "changed", why);
      assert.ok(r.differences.some((d) => says.test(d)), `${why}: ${r.differences.join("; ")}`);
    }
    for (const [why, b, a] of [
      ["the earlier version never went RED", { ...before, verdicts: { candidate: "pass" } }, after],
      ["the earlier version never went GREEN", { ...before, verdicts: { "mutant 1": "fail" } }, after],
      ["a verdict that is not pass or fail", before, { ...after, verdicts: { ...after.verdicts, candidate: "skipped" } }],
      ["no version", { ...before, version: "v1" }, after],
      ["no targets", before, { ...after, tests: [] }],
      ["not a record", before, null],
    ]) assert.equal(refactored(b, a).result, "unknown", why);
  });

  it("testing/T114 [testing/F95, testing/F96, testing/F97, testing/F83]: timing and preservation are separate evidence for the case owner, never a run's result", async () => {
    const { candidates, refactored } = await redesign();
    const history = [run("linux", SLOW), run("linux", SLOW), run("linux", SLOW)];
    const given = structuredClone(history);
    const c = candidates(history);
    assert.ok(["challenged", "unchallenged", "unknown"].includes(c.result));
    for (const word of ["failed", "verified", "passed"]) assert.notEqual(c.result, word);
    assert.ok(c.candidates.every((x) => x.owner === "case owner" && !("outcome" in x)), "a candidate is the case owner's, and states no outcome");
    assert.deepEqual(history, given, "the history given is not changed");
    const before = { id: "acme/T9", version: V1, tests: ["acme/F1"], verdicts: { candidate: "pass", mutant: "fail" } };
    const r = refactored(before, { ...before, version: V2 });
    assert.ok(["kept", "changed", "unknown"].includes(r.result), "a refactoring is kept or changed, never a result of a run");

    const fasterHistory = [...history, ...Array.from({ length: 3 }, () => run("linux", QUICK, 100, V2))];
    const timing = candidates(fasterHistory).refactors.find((x) => x.case === before.id && x.from === before.version && x.to === V2 && x.platform === "linux");
    assert.equal(timing.shown, "faster");
    const after = { ...before, version: V2 };
    for (const [why, b, a, expected] of [
      ["a formerly RED mutant now goes GREEN", before, { ...after, verdicts: { candidate: "pass", mutant: "pass" } }, "changed"],
      ["a target was dropped", { ...before, tests: ["acme/F1", "acme/F2"] }, after, "changed"],
      ["there is no earlier discriminating RED", { ...before, verdicts: { candidate: "pass" } }, after, "unknown"],
    ]) {
      assert.deepEqual([timing.shown, refactored(b, a).result], ["faster", expected], `${why}: speed establishes no preserved behaviour`);
    }
    const slowerTiming = candidates([...history, ...Array.from({ length: 3 }, () => run("linux", SLOW, 100, V2))]).refactors.find((x) => x.case === before.id && x.from === V1 && x.to === V2);
    assert.deepEqual([slowerTiming.shown, refactored(before, after).result], ["not faster", "kept"], "preserved behaviour does not establish a speed improvement");
    assert.deepEqual(candidates(fasterHistory).refactors.find((x) => x.case === before.id), timing, "a behavioural check does not alter the timing evidence");
  });

  it("testing/T115 [testing/N20]: learning is pure and deterministic: the same history gives the same candidates in the same order, and a verdict's order does not matter", async () => {
    const { candidates, refactored } = await redesign();
    const history = [run("win32", SLOW, 30000), run("linux", SLOW), run("win32", SLOW, SLOW), run("linux", SLOW), run("win32", SLOW, 30000), run("linux", SLOW)];
    const a = candidates(history);
    assert.deepEqual(candidates(structuredClone(history)), a);
    assert.deepEqual(a.candidates.map((x) => `${x.case} ${x.platform} ${x.medianMs}`), ["acme/T10 win32 30000", "acme/T9 linux 9000", "acme/T9 win32 9000"], "ordered by median time, most first, then by Case and platform");
    const shuffled = history.map((r) => ({ ...r, cases: [...r.cases].reverse() }));
    assert.deepEqual(candidates(shuffled), a, "the order of the cases within a run does not matter");
    const before = { id: "acme/T9", version: V1, tests: ["acme/F1", "acme/F2"], verdicts: { b: "fail", a: "pass", c: "fail" } };
    const after = { id: "acme/T9", version: V2, tests: ["acme/F1"], verdicts: { c: "pass", a: "pass" } };
    const flipped = { ...before, verdicts: { c: "fail", a: "pass", b: "fail" } };
    assert.deepEqual(refactored(flipped, after), refactored(before, after), "differences come in the same order");
  });
});
