// testing/C48 planned outer tests: Testing derives each Case's `tests →` relationship (testing/N7) from the
// Case's own declaration in its source file, so Engineering's reverse traceability can follow it without a
// text manifest. Immutable to DO and CHECK; testing/C49 turns them GREEN. Each title names the contracts it
// checks (plan/traces/*.md). Files are given as plain data: Testing never executes a case file to trace it.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

/** kaal-testing/traces, or the reason the tests are blocked before any behavioural assertion. */
async function traces() {
  let m, model;
  try {
    m = await import("kaal-testing/traces");
    model = await import("kaal-testing/model");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-testing exports no ./traces (${e.code ?? e.message})`);
  }
  for (const f of ["derive", "edges", "incoming"]) if (typeof m[f] !== "function") assert.fail(`blocked before behavioural assertion: kaal-testing/traces exports no ${f}`);
  if (!Array.isArray(m.LOCATIONS)) assert.fail("blocked before behavioural assertion: kaal-testing/traces exports no LOCATIONS");
  return { ...m, check: model.check, tested: model.tested };
}

const file = (path, ...lines) => ({ path, text: ['import { describe, it, test } from "node:test";', ...lines, ""].join("\n") });
const PLAN = file("test/plan/thing.test.mjs",
  'describe("Thing (acme/C1)", () => {',
  '  it("acme/T1 [acme/F1, acme/N1]: does the thing", () => {});',
  "  it('acme/T2 [acme/F2]: does it again', () => {});",
  '  test(`acme/T3 [acme/F1]: and once more`, () => {});',
  "});");
const EMBED = file("test/embed/thing.test.mjs",
  'describe("The thing", () => {',
  '  it("reads a thing as given [acme/F2]", () => {});',
  '  it("names what it found", () => {});',
  "});");
const ENGINEER = file("test/engineer/thing.test.mjs", 'it("acme/T9 [acme/F3, other/F7]: the lane installs it", async () => {});');

describe("Case tests → derived from the Case's own declaration (testing/C48)", () => {
  it("testing/T98 [testing/F84, testing/N7]: each Case in a case location declares its targets in its own title, bare identifiers are its owner's, and the derived model is Testing's model", async () => {
    const { derive, check, tested, LOCATIONS } = await traces();
    assert.deepEqual([...LOCATIONS].sort(), ["test/acceptance/", "test/embed/", "test/engineer/", "test/plan/"], "the case locations (testing/F76, testing/F77)");
    const d = derive([PLAN, EMBED, ENGINEER]);
    assert.deepEqual(d.findings, []);
    assert.deepEqual(d.model, { cases: [
      { id: "acme/T1", tests: ["acme/F1", "acme/N1"] },
      { id: "acme/T2", tests: ["acme/F2"] },
      { id: "acme/T3", tests: ["acme/F1"] },
      { id: "acme/T9", tests: ["acme/F3", "other/F7"] },
      { id: "reads a thing as given [acme/F2]", tests: ["acme/F2"] },
    ] }, "a Case is named by its leading identity, or else by its title, and its targets are its brackets");
    assert.deepEqual(check(d.model), [], "the derived model is a valid Testing model");
    assert.deepEqual(tested(d.model)["acme/F1"], ["acme/T1", "acme/T3"]);
    assert.deepEqual(d.untraced, ["test/embed/thing.test.mjs > names what it found"], "a title with no targets is listed as untraced, never guessed");
    const bare = derive([file("test/plan/core.test.mjs", 'it("core/T1 [I1, F5]: bare targets are the Case\'s owner\'s", () => {});')]);
    assert.deepEqual(bare.model.cases, [{ id: "core/T1", tests: ["core/I1", "core/F5"] }], "a bare target is qualified by the owner the Case's identity names");
    const guard = file("test/acceptance/intent.test.mjs", 'it("T2 [I1]: removing it leaves the tests intact", () => {});');
    assert.deepEqual(derive([guard], { owner: "guard" }).model.cases, [{ id: "guard/T2", tests: ["guard/I1"] }], "or else by the owner the caller gives, from the location's ownership claim");
    assert.deepEqual(derive([file("test/plan/mixed.test.mjs", 'it("acme/T1 [F1, other/F2]: x", () => {});')], { owner: "guard" }).model.cases, [{ id: "acme/T1", tests: ["acme/F1", "other/F2"] }], "the Case's own identity wins over the caller's owner, and a qualified target is kept as written");
  });

  it("testing/T99 [testing/F85]: only case files in a case location are read, and a file elsewhere traces nothing", async () => {
    const { derive } = await traces();
    const elsewhere = [
      file("test/verifiers.test.mjs", 'it("acme/T5 [acme/F5]: an implementation test", () => {});'),
      file("lib/thing.mjs", 'it("acme/T6 [acme/F6]: not a case file", () => {});'),
      file("test/plan/helper.mjs", 'it("acme/T7 [acme/F7]: not a .test.mjs file", () => {});'),
      file("docs/test/plan/x.test.mjs", 'it("acme/T8 [acme/F8]: a location only at the root", () => {});'),
    ];
    assert.deepEqual(derive(elsewhere).model.cases, []);
    assert.deepEqual(derive([...elsewhere, ENGINEER]).model.cases.map((c) => c.id), ["acme/T9"]);
  });

  it("testing/T100 [testing/F86]: a title that cannot be read statically, a malformed target, or a Case named twice is a finding, never a trace", async () => {
    const { derive } = await traces();
    for (const [why, f, named] of [
      ["a title built at run time", file("test/plan/a.test.mjs", "const t = 'acme/T1 [acme/F1]: x';", "it(t, () => {});"), "test/plan/a.test.mjs"],
      ["a template with a substitution", file("test/plan/b.test.mjs", "it(`${id} [acme/F1]: x`, () => {});"), "test/plan/b.test.mjs"],
      ["a bare target with no owner to qualify it", file("test/plan/c.test.mjs", 'it("does x [F1]", () => {});'), "F1"],
      ["a bare Case identity with no owner to qualify it", file("test/plan/f.test.mjs", 'it("T1 [acme/F1]: x", () => {});'), "T1"],
      ["an empty bracket", file("test/plan/d.test.mjs", 'it("acme/T1 []: x", () => {});'), "test/plan/d.test.mjs"],
      ["a target named twice", file("test/plan/e.test.mjs", 'it("acme/T1 [acme/F1, acme/F1]: x", () => {});'), "acme/F1"],
    ]) {
      const d = derive([f]);
      assert.ok(d.findings.length > 0, why);
      assert.ok(d.findings.some((x) => x.includes(named)), `${why} names ${named}`);
      assert.deepEqual(d.model.cases, [], `${why} traces nothing`);
    }
    const twice = derive([PLAN, file("test/engineer/again.test.mjs", 'it("acme/T1 [acme/F9]: elsewhere", () => {});')]);
    assert.ok(twice.findings.some((x) => x.includes("acme/T1") && x.includes("test/engineer/again.test.mjs") && x.includes("test/plan/thing.test.mjs")), "a Case named twice names both files");
    assert.ok(!twice.model.cases.some((c) => c.id === "acme/T1"), "neither declaration of a Case named twice is traced");
    for (const bad of [undefined, [{ path: "test/plan/x.test.mjs" }], [{ text: "it('a [b/C1]', () => {})" }], "test/plan/x.test.mjs"]) {
      const d = derive(bad);
      assert.ok(d.findings.length > 0, JSON.stringify(bad));
      assert.deepEqual(d.model.cases, []);
    }
  });

  it("testing/T101 [testing/F87]: the derived relationship is traversable both ways: edges out of each Case, and the Cases that test a target", async () => {
    const { derive, edges, incoming } = await traces();
    const { model } = derive([PLAN, EMBED, ENGINEER]);
    const e = edges(model);
    assert.deepEqual(e.findings, []);
    assert.deepEqual(e.edges.filter((x) => x.from === "acme/T1"), [{ from: "acme/T1", type: "tests", to: "acme/F1" }, { from: "acme/T1", type: "tests", to: "acme/N1" }]);
    assert.equal(e.edges.length, 7);
    assert.ok(e.edges.every((x) => x.type === "tests"), "Testing's one relationship, by its name");
    assert.deepEqual(incoming(model, "acme/F2"), ["acme/T2", "reads a thing as given [acme/F2]"]);
    assert.deepEqual(incoming(model, "other/F7"), ["acme/T9"], "a target another owner holds is traced by name, and its meaning stays its owner's");
    assert.deepEqual(incoming(model, "acme/F404"), [], "a target no Case tests has none");
    assert.deepEqual(incoming(model, "constructor"), [], "a target named like an Object.prototype member has none");
    const escaped = derive([file("test/embed/q.test.mjs", 'it("reads \\"x\\" as given [acme/F6]", () => {});')]);
    assert.deepEqual(escaped.model.cases, [{ id: 'reads "x" as given [acme/F6]', tests: ["acme/F6"] }], "an escaped quote stays inside the title");
    assert.deepEqual(edges({ cases: [{ id: "b", tests: ["z/F2", "a/F1"] }, { id: "a", tests: ["c/F3"] }, { id: "r", tests: ["d/F4"], retired: true }] }).edges, [
      { from: "a", type: "tests", to: "c/F3" }, { from: "b", type: "tests", to: "a/F1" }, { from: "b", type: "tests", to: "z/F2" },
    ], "edges are ordered by Case, then target, and a retired Case traces nothing");
    const broken = edges({ cases: [{ id: "acme/T1", tests: ["acme/F1"] }, { id: "acme/T1", tests: ["acme/F2"] }] });
    assert.ok(broken.findings.length > 0, "a model with a finding gives findings");
    assert.deepEqual(broken.edges, [], "and no edge");
  });

  it("testing/T102 [testing/N18, testing/F86]: deriving is pure and deterministic, reads only case calls in the text given and never executes it", async () => {
    const { derive } = await traces();
    const quoted = file("test/plan/quoted.test.mjs", 'const fixture = `  it(${title}, () => {});`;', "assert.match(s, /npm test(\\s|$)/);", "// each test (T1) is named here", 'it("acme/T5 [acme/F5]: the only case", () => {});');
    assert.deepEqual(derive([quoted]), { model: { cases: [{ id: "acme/T5", tests: ["acme/F5"] }] }, untraced: [], findings: [] }, "a call inside a string, a regular expression or a comment is not a case");
    const trap = file("test/plan/trap.test.mjs", "globalThis.__kaalTraced = true;", 'it("acme/T4 [acme/F4]: x", () => { globalThis.__kaalTraced = true; });');
    const d = derive([trap]);
    assert.equal(globalThis.__kaalTraced, undefined, "the case file is never run");
    assert.deepEqual(d.model.cases, [{ id: "acme/T4", tests: ["acme/F4"] }]);
    const files = [PLAN, EMBED, ENGINEER];
    const before = structuredClone(files);
    assert.deepEqual(derive([...files].reverse()), derive(files), "the order files are given in does not matter");
    const noisy = [file("test/plan/z.test.mjs", 'it("acme/T1 [F1]: x", () => {});', "it(t, () => {});"), file("test/plan/a.test.mjs", 'it("acme/T2 [acme/F2, acme/F2]: y", () => {});')];
    assert.deepEqual(derive([...noisy].reverse()).findings, derive(noisy).findings, "findings come in the same order too");
    assert.deepEqual(files, before, "the files given are not changed");
  });
});
