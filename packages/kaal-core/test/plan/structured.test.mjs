// core/C27 planned outer tests: Structured Frontmatter Values. Immutable to DO
// and CHECK; core/C27's DO turns them GREEN. Each title names the contracts it
// checks (plan/structured/*.md). They use kaal-core's public interface only.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

/** kaal-core/frontmatter, or the reason the tests are blocked before any behavioural assertion. */
async function frontmatter() {
  try {
    return await import("kaal-core/frontmatter");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-core exports no ./frontmatter (${e.code ?? e.message})`);
  }
}

/** One line of non-empty text, no leading or trailing whitespace: an opaque identity (core/A29). */
const IDENTITY = { value: "parameter", pattern: "^\\S(?:.*\\S)?$" };

const TYPE = "Sample/Structured";
const SCHEMA = {
  keys: {
    owner: { value: "name", required: true },
    point: { value: "record", fields: { x: { value: "number", required: true }, y: { value: "number" } } },
    points: { value: "record", list: true, fields: { x: { value: "number", required: true } } },
    labels: { value: "map", key: IDENTITY, of: { value: "enum", values: ["on", "off"] } },
    target: { value: "either", of: [IDENTITY, { value: "record", fields: { scope: IDENTITY, id: { ...IDENTITY, required: true } } }] },
    targets: { value: "either", list: true, of: [IDENTITY, { value: "record", fields: { scope: IDENTITY, id: { ...IDENTITY, required: true } } }] },
    nested: { value: "record", fields: { inner: { value: "record", fields: { deep: { value: "boolean", required: true } } } } },
  },
};
const TYPES = { [TYPE]: SCHEMA };
const doc = (front, body = "# A structured artifact\n\nIts prose.\n") => Buffer.from(`---\ntype: ${TYPE}\nowner: KAAL Definition\n${front}---\n\n${body}`);
const where = (r) => r.findings.map((f) => (f.at === undefined ? f.key : `${f.key}${f.at}`)).sort();
const with1 = (key, decl) => ({ keys: { ...SCHEMA.keys, [key]: decl } });

describe("Structured Frontmatter Values (core/C27)", () => {
  it("core/T60 [core/F57, core/F58, core/F59, core/F60]: a schema declaring record, map and either, nested and as lists, is valid; each malformed declaration is a schema finding with its at", async () => {
    const { checkSchema } = await frontmatter();
    assert.deepEqual(checkSchema(TYPE, SCHEMA), []);
    const broken = [
      ["r", { value: "record" }, "/fields"],
      ["r", { value: "record", fields: {} }, "/fields"],
      ["r", { value: "record", fields: { a: { value: "text" } } }, "/fields/a"],
      ["r", { value: "record", fields: { a: { value: "record", fields: { b: { value: "number", list: "yes" } } } } }, "/fields/a/fields/b"],
      ["m", { value: "map", of: { value: "number" } }, "/key"],
      ["m", { value: "map", key: IDENTITY }, "/of"],
      ["m", { value: "map", key: { value: "number" }, of: { value: "number" } }, "/key"],
      ["m", { value: "map", key: IDENTITY, of: { value: "number", required: true } }, "/of"],
      ["e", { value: "either", of: [IDENTITY] }, "/of"],
      ["e", { value: "either", of: [IDENTITY, { value: "string" }] }, "/of/1"],
      ["x", { value: "number", fields: { a: { value: "number" } } }, ""],
      ["x", { value: "number", of: { value: "number" } }, ""],
    ];
    for (const [key, decl, at] of broken) {
      const findings = checkSchema(TYPE, with1(key, decl));
      assert.equal(findings.length, 1, JSON.stringify(decl));
      assert.equal(findings[0].key, key, JSON.stringify(decl));
      assert.equal(findings[0].at ?? "", at, JSON.stringify(decl));
    }
  });

  it("core/T61 [core/F57, core/F61]: a record conforms when every declared field conforms; an undeclared field, a missing required field, a wrong field and a non-mapping are invalid, each named by key and at", async () => {
    const { validate } = await frontmatter();
    assert.equal(validate(doc("point: { x: 1, y: 2 }\npoints: [{ x: 1 }, { x: 2 }]\nnested: { inner: { deep: true } }\n"), TYPES).verdict, "valid");
    const cases = [
      ["point: { x: 1, z: 2 }\n", ["point/z"]],
      ["point: { y: 2 }\n", ["point/x"]],
      ["point: { x: one }\n", ["point/x"]],
      ["point: 3\n", ["point"]],
      ["points: [{ x: 1 }, { x: 1, extra: 0 }]\n", ["points/1/extra"]],
      ["nested: { inner: {} }\n", ["nested/inner/deep"]],
      ["point: [{ x: 1 }]\n", ["point"]],
    ];
    for (const [front, expected] of cases) {
      const r = validate(doc(front), TYPES);
      assert.equal(r.verdict, "invalid", front);
      assert.deepEqual(where(r), expected, front);
    }
  });

  it("core/T62 [core/I19, core/F57]: a prose field name is invalid in an artifact's record and in a schema's fields", async () => {
    const { validate, checkSchema } = await frontmatter();
    for (const prose of ["description", "summary", "rationale", "instructions", "prompt", "notes", "comment", "explanation"]) {
      const r = validate(doc(`point: { x: 1, ${prose}: some words }\n`), TYPES);
      assert.equal(r.verdict, "invalid", prose);
      assert.deepEqual(r.findings.map((f) => [f.key, f.at, f.rule]), [["point", `/${prose}`, "prose"]], prose);
      const s = checkSchema(TYPE, with1("r", { value: "record", fields: { [prose]: IDENTITY } }));
      assert.deepEqual(s.map((f) => [f.key, f.at, f.rule]), [["r", `/fields/${prose}`, "prose"]], prose);
    }
  });

  it("core/T63 [core/F58, core/F61]: a map conforms when every key matches and every value conforms; a bad key or value is named; an empty map conforms", async () => {
    const { validate } = await frontmatter();
    for (const front of ["labels: {}\n", 'labels: { "NFR.1": on, "bb/store": off, case 1: on }\n']) assert.equal(validate(doc(front), TYPES).verdict, "valid", front);
    const cases = [
      ['labels: { " padded": on }\n', ["labels/ padded"]],
      ["labels: { a: maybe, b: on }\n", ["labels/a"]],
      ['labels: { "x/y": maybe }\n', ["labels/x~1y"]],
      ["labels: [a, b]\n", ["labels"]],
    ];
    for (const [front, expected] of cases) {
      const r = validate(doc(front), TYPES);
      assert.equal(r.verdict, "invalid", front);
      assert.deepEqual(where(r), expected, front);
    }
  });

  it("core/T64 [core/F59, core/F61]: either conforms when any alternative does, and is invalid when none does, item by item in a list", async () => {
    const { validate } = await frontmatter();
    for (const front of ["target: REQ-001\n", "target: { scope: other, id: x }\n", "target: { id: x }\n", "targets: [REQ-001, { scope: other, id: case 1 }]\n", "targets: []\n"]) {
      assert.equal(validate(doc(front), TYPES).verdict, "valid", front);
    }
    const cases = [
      ['target: " x"\n', ["target"]],
      ["target: { scope: other }\n", ["target"]],
      ["target: 3\n", ["target"]],
      ["targets: [REQ-001, 3, { id: y, extra: z }]\n", ["targets/1", "targets/2"]],
    ];
    for (const [front, expected] of cases) {
      const r = validate(doc(front), TYPES);
      assert.equal(r.verdict, "invalid", front);
      assert.deepEqual(where(r), expected, front);
    }
  });

  it("core/T65 [core/N17, core/F61]: findings on flat frontmatter are unchanged and carry no at; the same bytes give the same result, whatever the body", async () => {
    const { validate } = await frontmatter();
    const flat = { "Sample/Flat": { keys: { owner: { value: "name", required: true }, order: { value: "number" }, orders: { value: "number", list: true } } } };
    const r = validate(Buffer.from("---\ntype: Sample/Flat\norder: x\norders: [1, x]\nstray: 1\n---\n"), flat);
    assert.deepEqual(r.findings.map((f) => [f.key, f.rule]).sort(), [["order", "value"], ["orders", "value"], ["owner", "required"], ["stray", "undeclared"]]);
    assert.ok(r.findings.every((f) => !("at" in f)));
    const front = "point: { x: 1, z: 2 }\ntargets: [3]\n";
    const a = validate(doc(front), TYPES);
    assert.deepEqual(validate(doc(front, "# Other\n\nDifferent prose.\n"), TYPES), a);
    assert.deepEqual(validate(doc(front), TYPES), a);
  });

  it("core/T66 [core/I19, core/A29]: core/A25's Registration shape, with core/T50's fixture kinds and instances, validates against a schema written with these kinds; each break in it is found where it is", async () => {
    const { validate, checkSchema } = await frontmatter();
    const RULE = { value: "either", of: [{ value: "enum", values: ["any"] }, { ...IDENTITY, list: true }] };
    const TARGET = { value: "either", of: [IDENTITY, { value: "record", fields: { scope: { ...IDENTITY, required: true }, id: { ...IDENTITY, required: true } } }] };
    const registration = {
      "Sample/Registration": {
        keys: {
          holder: { ...IDENTITY, required: true },
          scope: { ...IDENTITY, required: true },
          kinds: { value: "map", key: IDENTITY, of: { value: "record", fields: { traces: { ...RULE, required: true }, acyclic: { value: "boolean" } } } },
          instances: { value: "record", list: true, fields: { id: { ...IDENTITY, required: true }, kind: { ...IDENTITY, required: true }, traces: { ...TARGET, list: true } } },
        },
      },
    };
    assert.deepEqual(checkSchema("Sample/Registration", registration["Sample/Registration"]), []);
    const reg = (body) => Buffer.from(`---\ntype: Sample/Registration\n${body}---\n\nThe registration, explained.\n`);
    const kinds = "holder: kaal-testing\nscope: testing\nkinds:\n  T: { traces: any }\n  D: { traces: [T], acyclic: true }\n  C: { traces: [] }\n";
    const acme = "holder: acme-product\nscope: acme\ninstances:\n  - { id: REQ-001, kind: F, traces: [WHY-1] }\n  - { id: NFR.1, kind: N, traces: [WHY-1] }\n  - { id: \"defect:1\", kind: D, traces: [case 2] }\n  - { id: case 2, kind: T, traces: [bb/store, { scope: testing, id: case 1 }] }\n  - { id: src/store.ts, kind: Code }\n";
    assert.equal(validate(reg(kinds), registration).verdict, "valid");
    assert.equal(validate(reg(acme), registration).verdict, "valid");
    const breaks = [
      [kinds.replace("traces: any", "traces: all"), ["kinds/T/traces"]],
      [kinds.replace("acyclic: true", "acyclic: yes"), ["kinds/D/acyclic"]],
      [kinds.replace("C: { traces: [] }", "C: {}"), ["kinds/C/traces"]],
      [acme.replace("{ scope: testing, id: case 1 }", "{ scope: testing }"), ["instances/3/traces/1"]],
      [acme.replace("{ id: NFR.1, kind: N,", "{ id: NFR.1, kind: N, incoming: [x],"), ["instances/1/incoming"]],
      [acme.replace("- { id: src/store.ts, kind: Code }", "- { kind: Code }"), ["instances/4/id"]],
    ];
    for (const [body, expected] of breaks) {
      const r = validate(reg(body), registration);
      assert.equal(r.verdict, "invalid", body);
      assert.deepEqual(where(r), expected, body);
    }
  });
});
