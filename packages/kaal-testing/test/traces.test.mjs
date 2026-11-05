import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { derive } from "kaal-testing/traces";

const file = (text) => [{ path: "test/embed/a.test.mjs", text }];

describe("traces derive (implementation)", () => {
  it("reads a plain literal title", () => {
    const r = derive(file('it("acme/T1 [acme/F1]", () => {});\n'));
    assert.deepEqual(r.findings, []);
    assert.deepEqual(r.model.cases, [{ id: "acme/T1", tests: ["acme/F1"] }]);
  });

  it("treats a title that continues as an expression as not static, so it traces nothing", () => {
    for (const text of [
      'it("acme/T1 [acme/F1]".replace("F1", target), () => {});\n',
      'it("acme/T1 [acme/F1]" + suffix, () => {});\n',
      "it(`acme/T1 [acme/F1]`.trim(), () => {});\n",
    ]) {
      const r = derive(file(text));
      assert.deepEqual(r.model.cases, [], text);
      assert.equal(r.findings.length, 1, text);
    }
  });

  it("accepts a literal followed by a comment before the comma", () => {
    const r = derive(file('it("acme/T1 [acme/F1]" /* why */, () => {});\n'));
    assert.deepEqual(r.model.cases, [{ id: "acme/T1", tests: ["acme/F1"] }]);
  });
});
