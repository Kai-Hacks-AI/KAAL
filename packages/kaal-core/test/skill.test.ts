// core/C52 Code tests for the Skill standard, beyond the planned core/T103 to core/T109.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { judgeLayout, judgeSize, judgeSkill, readBaseline, standard } from "../dist/skill.js";

const words = (n: number) => Array.from({ length: n }, (_, i) => `w${i}`).join(" ");
const skill = (n: number, extra: Partial<Parameters<typeof judgeSkill>[0]> = {}) => judgeSkill({ name: "kaal-x", skillMd: words(n), paths: ["SKILL.md"], ...extra });

describe("Skill standard (core/C52)", () => {
  it("states every rule once and the thresholds in order", () => {
    assert.deepEqual(standard.rules.map((r) => r.id), ["entry", "layout", "router", "detail", "lane", "size"]);
    assert.ok(standard.thresholds.soft < standard.thresholds.medium && standard.thresholds.medium < standard.thresholds.hard);
  });
  it("counts an empty file and a file of only frontmatter as no words", () => {
    assert.equal(judgeSize("").words, 0);
    assert.equal(judgeSize("---\nname: x\n---\n").words, 0);
  });
  it("a layout with a file named like a permitted folder is a finding", () => {
    assert.deepEqual(judgeLayout(["SKILL.md", "references"]).map((f) => f.path), ["references"]);
    assert.deepEqual(judgeLayout([]).map((f) => f.rule), ["entry"]);
  });
  it("the ratchet compares only a Skill's own entry by name, never one inherited from the object prototype", () => {
    assert.equal(skill(650, { baseline: {} }).ratchet, "new");
    assert.equal(skill(650, { baseline: Object.create({ "kaal-x": { owner: "x", words: 650 } }) }).ratchet, "new");
  });
  it("a copy below its entry is known and never stale, a variant below its own words is stale", () => {
    const baseline = { "kaal-x": { owner: "x", words: 650, variants: { external: 620 } } };
    assert.equal(skill(640, { baseline, instance: { kind: "copy" } }).ratchet, "known");
    assert.equal(skill(610, { baseline, instance: { kind: "variant", id: "external" } }).ratchet, "stale");
    assert.equal(skill(610, { baseline, instance: { kind: "variant", id: "constructor" } }).ratchet, "new", "a name on the object prototype is no variant");
  });
  it("published never blocks and carries no ratchet", () => {
    const v = skill(700, { lifecycle: "published", baseline: { "kaal-x": { owner: "x", words: 650 } } });
    assert.equal(v.blocks, false);
    assert.equal(v.ratchet, undefined);
    assert.equal(v.level, "hard");
  });
  it("a baseline is read strictly", () => {
    assert.throws(() => readBaseline("[]"));
    assert.throws(() => readBaseline('{"a":{"owner":"","words":1}}'));
    assert.throws(() => readBaseline('{"a":{"owner":"x","words":-1}}'));
    assert.deepEqual(readBaseline('{"a":{"owner":"x","words":1,"variants":{"v":2}}}'), { a: { owner: "x", words: 1, variants: { v: 2 } } });
  });
});
