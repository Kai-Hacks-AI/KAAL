// testing/C4 planned outer tests: RED evidence and accepted regressions.
// Immutable to DO and CHECK; testing/C5 turns them GREEN. Each title names the contracts it checks
// (plan/red/*.md). They use kaal-testing's public interface only.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

/** kaal-testing/red, or the reason the tests are blocked before any behavioural assertion. */
async function red() {
  let m;
  try {
    m = await import("kaal-testing/red");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-testing exports no ./red (${e.code ?? e.message})`);
  }
  for (const name of ["outcomes", "checkAccepted", "classify", "report", "verdict"]) {
    if (typeof m[name] !== "function") assert.fail(`blocked before behavioural assertion: kaal-testing/red exports no ${name}`);
  }
  return m;
}

/** A node:test reporter event for one test or suite. */
function event(outcome, name, { suite = false, nesting = 1, skip, todo } = {}) {
  return { type: outcome === "pass" ? "test:pass" : "test:fail", data: { name, nesting, details: { type: suite ? "suite" : "test" }, ...(skip ? { skip } : {}), ...(todo ? { todo } : {}) } };
}

const keys = (findings) => findings.map((f) => f.key);
/** Whether a finding names `member`, or a member inside it, such as `accepted.0.expires` inside `accepted.0`. */
const names = (findings, member) => keys(findings).some((k) => k === member || k.startsWith(`${member}.`));

const BRANCH = "kaal/sample";
const AUTHORITY = "https://github.com/Kai-Hacks-AI/KAAL/pull/1#pullrequestreview-1";

function acceptance(tests, { branch = BRANCH, expires = "2026-12-31", resolves = "sample/C2" } = {}) {
  return { tests, branch, authority: AUTHORITY, expires, resolves };
}

/** One run: `here` and `base` map identity to "pass" or "fail". */
function run(m, here, base, accepted = [], today = "2026-10-25") {
  const results = m.outcomes(Object.entries(here).map(([id, o]) => event(o, `${id}: does its part`)));
  const baseline = m.outcomes(Object.entries(base).map(([id, o]) => event(o, `${id}: does its part`)));
  return m.classify({ results, base: baseline, accepted: { accepted }, branch: BRANCH, today });
}

const ids = (list) => [...list].sort();
const classOf = (c, id) => c.reds.find((r) => r.test === id)?.class;

describe("Outcomes by identity (testing/C4)", () => {
  it("testing/T1 [testing/F1, testing/N2]: each leaf test's outcome is keyed by its identity, and suites are not Test Cases", async () => {
    const m = await red();
    const results = m.outcomes([
      event("pass", "sample/T1 [sample/F1]: one thing", { nesting: 1 }),
      event("fail", "sample/T2: another, reworded", { nesting: 1 }),
      event("fail", "Sample behaviour (sample/C1)", { suite: true, nesting: 0 }),
    ]);
    assert.equal(results.outcome("sample/T1"), "pass");
    assert.equal(results.outcome("sample/T2"), "fail");
    assert.deepEqual(ids(results.identities()), ["sample/T1", "sample/T2"]);
    assert.deepEqual(results.unidentified(), []);
    assert.deepEqual(results.findings(), []);
  });

  it("testing/T2 [testing/F1]: a skipped or todo test is RED with its marker, a failing test without an identity is an Unidentified RED, and a duplicate identity is a finding", async () => {
    const m = await red();
    const results = m.outcomes([
      event("pass", "sample/T3: not yet", { skip: true }),
      event("pass", "sample/T4: not yet either", { todo: true }),
      event("pass", "a Code test without an identity"),
      event("fail", "checks something without an identity"),
      event("pass", "sample/T5: first"),
      event("fail", "sample/T5: second"),
    ]);
    assert.equal(results.outcome("sample/T3"), "fail");
    assert.equal(results.outcome("sample/T4"), "fail");
    assert.equal(results.marker("sample/T3"), "skip");
    assert.equal(results.marker("sample/T4"), "todo");
    assert.deepEqual(results.unidentified(), ["checks something without an identity"]);
    assert.ok(names(results.findings(), "sample/T5"), "a duplicate identity is a finding named by its identity");
  });
});

describe("Classification against the base (testing/C4)", () => {
  it("testing/T3 [testing/F2]: comparison with the base classes each RED as Feature, Regression or Persisting RED", async () => {
    const m = await red();
    const c = run(m, { "sample/T1": "fail", "sample/T2": "fail", "sample/T3": "fail", "sample/T4": "pass" }, { "sample/T2": "pass", "sample/T3": "fail", "sample/T4": "pass" });
    assert.equal(classOf(c, "sample/T1"), "feature");
    assert.equal(classOf(c, "sample/T2"), "regression");
    assert.equal(classOf(c, "sample/T3"), "persisting");
    assert.equal(classOf(c, "sample/T4"), undefined, "a GREEN Test Case is no RED");
    assert.deepEqual(ids(c.reds.map((r) => r.test)), ["sample/T1", "sample/T2", "sample/T3"]);
  });
});

describe("Accepted regressions (testing/C4)", () => {
  it("testing/T4 [testing/F3]: a conforming acceptance record has no findings, and each missing or malformed member is refused under its own name", async () => {
    const m = await red();
    assert.deepEqual(m.checkAccepted({ accepted: [acceptance(["sample/T2"])] }), []);
    assert.deepEqual(m.checkAccepted({ accepted: [] }), []);
    assert.ok(names(m.checkAccepted({}), "accepted"));
    for (const member of ["tests", "branch", "authority", "expires"]) {
      const entry = acceptance(["sample/T2"]);
      delete entry[member];
      assert.ok(names(m.checkAccepted({ accepted: [entry] }), `accepted.0.${member}`), `missing ${member}`);
    }
    assert.ok(names(m.checkAccepted({ accepted: [acceptance([])] }), "accepted.0.tests"), "no Test Case");
    assert.ok(names(m.checkAccepted({ accepted: [acceptance(["T2"])] }), "accepted.0.tests"), "an unqualified identity");
    assert.ok(names(m.checkAccepted({ accepted: [acceptance(["sample/T2"], { branch: "main" })] }), "accepted.0.branch"), "not a kaal/* collector");
    assert.ok(names(m.checkAccepted({ accepted: [acceptance(["sample/T2"], { expires: "31.12.2026" })] }), "accepted.0.expires"), "not YYYY-MM-DD");
    assert.ok(names(m.checkAccepted({ accepted: [{ ...acceptance(["sample/T2"]), authority: "Kai said so" }] }), "accepted.0.authority"), "not a GitHub URL");
    assert.ok(names(m.checkAccepted({ accepted: [acceptance(["sample/T2"], { resolves: "C2" })] }), "accepted.0.resolves"), "an unqualified Change id");
  });

  it("testing/T5 [testing/F4]: an acceptance applies only to its listed Regression REDs, on its branch, up to its expiry; an expired or stale acceptance applies to nothing and is reported", async () => {
    const m = await red();
    const here = { "sample/T1": "fail", "sample/T2": "fail", "sample/T3": "fail", "sample/T4": "pass" };
    const base = { "sample/T2": "pass", "sample/T3": "pass", "sample/T4": "pass" };
    const accepted = (c) => ids(c.reds.filter((r) => r.accepted).map((r) => r.test));

    assert.deepEqual(accepted(run(m, here, base, [acceptance(["sample/T2"])])), ["sample/T2"], "only the listed regression");
    assert.deepEqual(accepted(run(m, here, base, [acceptance(["sample/T2"])], "2026-12-31")), ["sample/T2"], "holds on its last day");
    const expired = run(m, here, base, [acceptance(["sample/T2"])], "2027-01-01");
    assert.deepEqual(accepted(expired), [], "an expired acceptance applies to nothing");
    assert.equal(expired.expired.length, 1);
    assert.deepEqual(accepted(run(m, here, base, [acceptance(["sample/T2"], { branch: "kaal/other" })])), [], "another collector's acceptance applies to nothing");
    assert.deepEqual(accepted(run(m, here, base, [acceptance(["sample/T1"])])), [], "a Feature RED is never accepted");
    const stale = run(m, here, base, [acceptance(["sample/T4"])]);
    assert.deepEqual(accepted(stale), [], "a GREEN Test Case needs no acceptance");
    assert.deepEqual(stale.stale.map((s) => s.test), ["sample/T4"], "and the acceptance is reported as stale");
  });

  it("testing/T6 [testing/F6]: the development gate tolerates Feature REDs and accepted regressions; promotion blocks every Feature RED and unaccepted Regression RED; accepting one regression never unblocks another", async () => {
    const m = await red();
    const base = { "sample/T2": "pass", "sample/T3": "pass", "sample/T4": "fail" };

    const tolerated = run(m, { "sample/T1": "fail", "sample/T2": "fail", "sample/T4": "fail" }, base, [acceptance(["sample/T2"])]);
    assert.deepEqual(m.verdict(tolerated, "development"), { pass: true, blocking: [] });
    assert.deepEqual(m.verdict(tolerated, "promotion"), { pass: false, blocking: ["sample/T1"] }, "a Feature RED blocks promotion; a Persisting RED does not");

    const two = run(m, { "sample/T2": "fail", "sample/T3": "fail" }, base, [acceptance(["sample/T2"])]);
    assert.deepEqual(m.verdict(two, "development"), { pass: false, blocking: ["sample/T3"] }, "accepting sample/T2 leaves sample/T3 blocking");
    assert.deepEqual(m.verdict(two, "promotion"), { pass: false, blocking: ["sample/T3"] });

    const accounted = run(m, { "sample/T2": "fail", "sample/T4": "fail" }, base, [acceptance(["sample/T2"])]);
    assert.deepEqual(m.verdict(accounted, "promotion"), { pass: true, blocking: [] }, "the failing set lies within the accepted regressions and what the base already carries");

    const unidentified = m.classify({
      results: m.outcomes([event("fail", "breaks without an identity")]),
      base: m.outcomes([]),
      accepted: { accepted: [] },
      branch: BRANCH,
      today: "2026-10-25",
    });
    for (const gate of ["development", "promotion"]) assert.deepEqual(m.verdict(unidentified, gate), { pass: false, blocking: ["breaks without an identity"] });
  });

  it("testing/T7 [testing/F5]: the report lists every RED by identity and class, and an accepted regression carries its authority, branch and expiry and is counted RED, never GREEN", async () => {
    const m = await red();
    const c = run(m, { "sample/T1": "fail", "sample/T2": "fail", "sample/T5": "pass" }, { "sample/T2": "pass", "sample/T5": "pass" }, [acceptance(["sample/T2"])]);
    const text = String(m.report(c));
    for (const needle of ["sample/T1", "sample/T2", AUTHORITY, BRANCH, "2026-12-31"]) assert.ok(text.includes(needle), needle);
    const line = text.split("\n").find((l) => l.includes("sample/T2"));
    assert.match(line, /regression/i);
    assert.doesNotMatch(line, /\b(GREEN|pass(ed)?)\b/i, "an accepted regression is never shown as GREEN");
    assert.deepEqual(c.counts, { feature: 1, regression: 1, persisting: 0, unidentified: 0, accepted: 1, green: 1 });
  });
});

describe("Purity (testing/C4)", () => {
  it("testing/T8 [testing/N1]: the same inputs give the same results, and kaal-testing/red imports no host module", async () => {
    const m = await red();
    const here = { "sample/T1": "fail", "sample/T2": "fail" };
    const base = { "sample/T2": "pass" };
    const accepted = [acceptance(["sample/T2"])];
    const a = run(m, here, base, accepted);
    const b = run(m, here, base, accepted);
    assert.deepEqual(m.verdict(a, "promotion"), m.verdict(b, "promotion"));
    assert.equal(String(m.report(a)), String(m.report(b)));
    const source = readFileSync(new URL(import.meta.resolve("kaal-testing/red")), "utf8");
    assert.doesNotMatch(source, /\bfrom\s+["'](node:|kaal-hosting)|\bimport\s*\(/, "kaal-testing/red imports no host module");
    assert.doesNotMatch(source, /\bDate\.now\b|\bnew Date\(\s*\)/, "the date is an input, never read from the clock");
  });
});
