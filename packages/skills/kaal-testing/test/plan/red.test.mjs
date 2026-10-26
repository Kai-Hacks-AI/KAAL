// testing/C4 planned outer tests: RED evidence and Feature-accepted regressions.
// Immutable to DO and CHECK; testing/C5 turns them GREEN. Each title names the contracts it checks
// (plan/red/*.md). They use kaal-testing's public interface only, and observe real node:test runs
// of fixture files written into a fresh directory.
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";

/** A kaal-testing subpath with the named functions, or the reason the tests are blocked before any behavioural assertion. */
async function subpath(name, functions) {
  let m;
  try {
    m = await import(`kaal-testing/${name}`);
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-testing exports no ./${name} (${e.code ?? e.message})`);
  }
  for (const f of functions) if (typeof m[f] !== "function") assert.fail(`blocked before behavioural assertion: kaal-testing/${name} exports no ${f}`);
  return m;
}
const red = () => subpath("red", ["outcomes", "classify", "report", "evaluate"]);
const observing = () => subpath("observe", ["observe"]);

const dirs = [];
after(() => dirs.forEach((d) => rmSync(d, { recursive: true, force: true })));

/** A node:test file: each entry is [title, "pass" | "fail" | "skip" | "todo"], under one suite. */
function suite(cases) {
  const body = cases
    .map(([title, o]) => {
      const t = JSON.stringify(title);
      if (o === "skip") return `  it(${t}, { skip: true }, () => {});`;
      if (o === "todo") return `  it(${t}, { todo: true }, () => {});`;
      return `  it(${t}, () => { ${o === "fail" ? "throw new Error('RED');" : ""} });`;
    })
    .join("\n");
  return `import { describe, it } from "node:test";\ndescribe("Sample behaviour (sample/C1)", () => {\n${body}\n});\n`;
}

/** An observed run of `tree` (file name to source; null leaves the file out), given the files in `given` (default: every name in `tree`). */
async function observed(tree, given = Object.keys(tree)) {
  const { observe } = await observing();
  const cwd = mkdtempSync(join(tmpdir(), "kaal-testing-red-"));
  dirs.push(cwd);
  for (const [name, source] of Object.entries(tree)) if (source !== null) writeFileSync(join(cwd, name), source);
  return observe({ files: given.map((f) => join(cwd, f)), cwd });
}

/** One file, `a.test.mjs`, whose cases map identity to outcome. */
const cases = (map) => ({ "a.test.mjs": suite(Object.entries(map).map(([id, o]) => [`${id}: does its part`, o])) });

const ids = (list) => [...list].sort();
const classOf = (c, id) => c.reds.find((r) => r.test === id)?.class;
const DEVELOPMENT = { block: ["regression", "missing", "unknown", "unidentified"] };
const PROMOTION = { block: ["regression", "missing", "unknown", "unidentified", "feature"] };

describe("Observation and outcomes by identity (testing/C4)", () => {
  it("testing/T1 [testing/F1]: observe records each given file by its bytes or as absent, and each test it ran with its file, suite path and outcome", async () => {
    const run = await observed({ "a.test.mjs": suite([["sample/T1: one thing", "pass"]]), "gone.test.mjs": null });
    const m = await red();
    const results = m.outcomes(run);
    assert.equal(results.outcome("sample/T1"), "pass");
    assert.equal(results.file("sample/T1"), "a.test.mjs");
    assert.deepEqual(results.findings(), []);
    const absent = await observed({ "gone.test.mjs": null });
    assert.deepEqual(m.outcomes(absent).identities(), [], "an absent file runs nothing");
  });

  it("testing/T2 [testing/F2, testing/N2]: suites are not Test Cases; a skipped or todo test is RED with its marker; a failing test without an identity is an Unidentified RED; a duplicate identity is a finding", async () => {
    const m = await red();
    const results = m.outcomes(
      await observed({
        "a.test.mjs": suite([
          ["sample/T1 [sample/F1]: one thing", "pass"],
          ["sample/T2: another, reworded", "fail"],
          ["sample/T3: not yet", "skip"],
          ["sample/T4: not yet either", "todo"],
          ["a Code test without an identity", "pass"],
          ["checks something without an identity", "fail"],
          ["sample/T5: first", "pass"],
          ["sample/T5: second", "fail"],
        ]),
      }),
    );
    assert.equal(results.outcome("sample/T1"), "pass");
    for (const id of ["sample/T2", "sample/T3", "sample/T4"]) assert.equal(results.outcome(id), "fail", id);
    assert.equal(results.marker("sample/T3"), "skip");
    assert.equal(results.marker("sample/T4"), "todo");
    assert.ok(!results.identities().some((id) => !/^sample\/T\d+$/.test(id)), "only identified leaf tests are Test Cases");
    assert.deepEqual(results.unidentified().map((u) => u.title ?? u), ["checks something without an identity"]);
    assert.ok(results.findings().some((f) => f.key === "sample/T5"), "a duplicate identity is a finding named by its identity");
  });
});

describe("Classification against established behavior (testing/C4)", () => {
  it("testing/T3 [testing/F3]: Regression, Persisting and Feature REDs, new GREEN, and a Missing RED for an established Test Case that disappeared", async () => {
    const m = await red();
    const base = await observed(cases({ "sample/T2": "pass", "sample/T3": "fail", "sample/T4": "pass", "sample/T6": "pass" }));
    const head = await observed(cases({ "sample/T1": "fail", "sample/T2": "fail", "sample/T3": "fail", "sample/T4": "pass", "sample/T7": "pass" }));
    const c = m.classify({ head, base, far: [] });
    assert.equal(classOf(c, "sample/T1"), "feature");
    assert.equal(classOf(c, "sample/T2"), "regression");
    assert.equal(classOf(c, "sample/T3"), "persisting");
    assert.equal(classOf(c, "sample/T6"), "missing");
    assert.equal(classOf(c, "sample/T4"), undefined, "a GREEN Test Case is no RED");
    assert.equal(classOf(c, "sample/T7"), undefined, "a new Test Case already GREEN is legitimate");
    assert.equal(c.counts.newGreen, 1);
    const fresh = m.classify({ head: await observed(cases({ "sample/T1": "fail" })), base: await observed({ "a.test.mjs": null }), far: [] });
    assert.equal(classOf(fresh, "sample/T1"), "feature", "a file the base observably lacked holds new Test Cases");
  });

  it("testing/T4 [testing/F3, testing/I2, testing/N4]: unknown evidence is never read as absent or new", async () => {
    const m = await red();
    const head = await observed(cases({ "sample/T1": "fail", "sample/T2": "fail" }));
    const base = await observed(cases({ "sample/T2": "pass" }));
    const copied = m.classify({ head, base: JSON.parse(JSON.stringify(base)), far: [] });
    assert.equal(classOf(copied, "sample/T1"), "unknown", "a copied base is a claim, not a run");
    assert.equal(classOf(copied, "sample/T2"), "unknown");
    const notGiven = m.classify({ head, base: await observed({ "b.test.mjs": suite([["sample/T9: elsewhere", "pass"]]) }), far: [] });
    assert.equal(classOf(notGiven, "sample/T1"), "unknown", "a file the base was not given");
    const broken = await observed({ "a.test.mjs": `import "./does-not-exist.mjs";\n` });
    assert.equal(classOf(m.classify({ head, base: broken, far: [] }), "sample/T1"), "unknown", "a base file that did not load");
    const thrown = await observed({
      "a.test.mjs": `import { describe, it } from "node:test";\ndescribe("Sample behaviour (sample/C1)", () => {\n  it("sample/T2: does its part", () => {});\n  describe("nested", () => { throw new Error("declaration failed"); });\n});\n`,
    });
    assert.equal(classOf(m.classify({ head, base: thrown, far: [] }), "sample/T1"), "unknown", "a base suite whose declaration threw, though no failing test was reported");
    assert.equal(classOf(m.classify({ head, base: thrown, far: [] }), "sample/T2"), "regression", "what the base did observe still counts");
    const notObserved = m.classify({ head: JSON.parse(JSON.stringify(head)), base, far: [] });
    assert.ok(notObserved.findings.length > 0, "a head that is not an observed run is a finding");
  });
});

describe("Feature-accepted regressions (testing/C4)", () => {
  it("testing/T5 [testing/F4]: a decided FAR entry names its Change and its Test Cases; each malformed member is a finding and accepts nothing", async () => {
    const m = await red();
    const head = await observed(cases({ "sample/T2": "fail" }));
    const base = await observed(cases({ "sample/T2": "pass" }));
    const keys = (far) => m.classify({ head, base, far }).findings.map((f) => f.key);
    assert.deepEqual(keys([{ change: "sample/C2", tests: ["sample/T2"] }]), []);
    for (const [entry, member] of [
      [{ tests: ["sample/T2"] }, "far.0.change"],
      [{ change: "C2", tests: ["sample/T2"] }, "far.0.change"],
      [{ change: "sample/C2" }, "far.0.tests"],
      [{ change: "sample/C2", tests: [] }, "far.0.tests"],
      [{ change: "sample/C2", tests: ["T2"] }, "far.0.tests"],
    ]) {
      assert.ok(keys([entry]).some((k) => k === member || k.startsWith(`${member}.`)), JSON.stringify(entry));
      assert.ok(!m.classify({ head, base, far: [entry] }).reds.some((r) => r.accepted), "a malformed entry accepts nothing");
    }
  });

  it("testing/T6 [testing/F5]: an accepted entry marks only its listed Regression or Missing REDs, under its Change, and they stay RED; any other listed identity is stale", async () => {
    const m = await red();
    const base = await observed(cases({ "sample/T2": "pass", "sample/T3": "pass", "sample/T4": "pass", "sample/T6": "pass" }));
    const head = await observed(cases({ "sample/T1": "fail", "sample/T2": "fail", "sample/T3": "fail", "sample/T4": "pass" }));
    const c = m.classify({ head, base, far: [{ change: "sample/C2", tests: ["sample/T2", "sample/T6", "sample/T1", "sample/T4"] }] });
    const accepted = c.reds.filter((r) => r.accepted);
    assert.deepEqual(ids(accepted.map((r) => r.test)), ["sample/T2", "sample/T6"], "a Regression RED and a Missing RED");
    assert.ok(accepted.every((r) => r.accepted.change === "sample/C2"));
    assert.equal(classOf(c, "sample/T2"), "regression", "accepted, and still RED");
    assert.equal(classOf(c, "sample/T3"), "regression", "an unlisted regression is not accepted");
    assert.deepEqual(ids(c.stale.map((s) => s.test)), ["sample/T1", "sample/T4"], "a Feature RED and a GREEN Test Case are never accepted");
  });

  it("testing/T7 [testing/F10]: evaluation follows the gate's policy; acceptance subtracts single identities; findings always block; a malformed policy fails closed", async () => {
    const m = await red();
    const base = await observed(cases({ "sample/T2": "pass", "sample/T3": "pass", "sample/T4": "fail" }));
    const far = [{ change: "sample/C2", tests: ["sample/T2"] }];

    const tolerated = m.classify({ head: await observed(cases({ "sample/T1": "fail", "sample/T2": "fail", "sample/T3": "pass", "sample/T4": "fail" })), base, far });
    assert.deepEqual(m.evaluate(tolerated, DEVELOPMENT), { pass: true, blocking: [] });
    assert.deepEqual(m.evaluate(tolerated, PROMOTION), { pass: false, blocking: ["sample/T1"] }, "the gate's policy decides that a Feature RED blocks");

    const two = m.classify({ head: await observed(cases({ "sample/T2": "fail", "sample/T3": "fail", "sample/T4": "fail" })), base, far });
    assert.deepEqual(m.evaluate(two, DEVELOPMENT), { pass: false, blocking: ["sample/T3"] }, "accepting sample/T2 leaves sample/T3 blocking");

    const duplicate = m.classify({ head: await observed({ "a.test.mjs": suite([["sample/T2: one", "pass"], ["sample/T2: two", "pass"], ["sample/T3: three", "pass"], ["sample/T4: four", "pass"]]) }), base, far: [] });
    assert.equal(m.evaluate(duplicate, { block: ["feature"] }).pass, false, "a finding blocks whatever the policy");

    for (const policy of [{}, { block: [] }, { block: ["regression", "flaky"] }]) assert.equal(m.evaluate(tolerated, policy).pass, false, JSON.stringify(policy));
  });

  it("testing/T8 [testing/F6]: the report lists every RED by identity, class and file, an accepted RED carries its Change and is counted RED, never GREEN", async () => {
    const m = await red();
    const base = await observed(cases({ "sample/T2": "pass", "sample/T5": "pass" }));
    const head = await observed(cases({ "sample/T1": "fail", "sample/T2": "fail", "sample/T5": "pass" }));
    const c = m.classify({ head, base, far: [{ change: "sample/C2", tests: ["sample/T2"] }] });
    const text = String(m.report(c));
    for (const needle of ["sample/T1", "sample/T2", "sample/C2", "a.test.mjs"]) assert.ok(text.includes(needle), needle);
    const line = text.split("\n").find((l) => l.includes("sample/T2"));
    assert.match(line, /regression/i);
    assert.doesNotMatch(line, /\b(GREEN|pass(ed)?)\b/i, "an accepted regression is never shown as GREEN");
    assert.deepEqual(c.counts, { feature: 1, regression: 1, missing: 0, persisting: 0, unknown: 0, unidentified: 0, accepted: 1, green: 1, newGreen: 0 });
  });
});

describe("Purity and one interpreter (testing/C4)", () => {
  it("testing/T14 [testing/N1]: the same observed runs, FAR outcome and policy give the same results", async () => {
    const m = await red();
    const head = await observed(cases({ "sample/T1": "fail", "sample/T2": "fail" }));
    const base = await observed(cases({ "sample/T2": "pass" }));
    const far = [{ change: "sample/C2", tests: ["sample/T2"] }];
    const a = m.classify({ head, base, far });
    const b = m.classify({ head, base, far });
    assert.deepEqual(m.evaluate(a, PROMOTION), m.evaluate(b, PROMOTION));
    assert.equal(String(m.report(a)), String(m.report(b)));
  });

  it("testing/T15 [testing/N4, testing/N1]: kaal-testing/red reads runs only through Testing's own observation, and imports no host module", async () => {
    await red();
    const source = readFileSync(new URL(import.meta.resolve("kaal-testing/red")), "utf8");
    const imports = [...source.matchAll(/\bfrom\s+["']([^"']+)["']/g)].map((x) => x[1]);
    assert.deepEqual(imports.filter((s) => s !== "./observed.mjs"), [], "red imports only Testing's own observed-run module");
    assert.doesNotMatch(source, /\bimport\s*\(/, "no dynamic import");
    assert.doesNotMatch(source, /\bDate\.now\b|\bnew Date\(/, "no clock");
    assert.doesNotMatch(source, /test:pass|test:fail|test:start/, "no second reading of runner events");
  });
});
