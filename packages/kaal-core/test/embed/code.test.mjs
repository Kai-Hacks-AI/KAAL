// Delivered Code loop (core/F70): unit checks of exported functions, against the installed copy.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { REGISTRATION_SCHEMA, REGISTRATION_TYPE, assemble } from "kaal-core/registration";
import { checkSchema } from "kaal-core/frontmatter";

describe("kaal-core Code loop", () => {
  it("names the Registration Type, and its schema is a valid frontmatter schema [core/F47]", () => {
    assert.equal(REGISTRATION_TYPE, "Core/Registration");
    assert.deepEqual(checkSchema(REGISTRATION_TYPE, REGISTRATION_SCHEMA), []);
  });

  it("assembles nothing to an empty result, and the same registrations in any order alike [core/N14, core/F56]", () => {
    const none = assemble([]);
    assert.deepEqual([none.scopes, none.kinds, none.instances, none.findings, none.untraced, none.terms].map((x) => x.length), [0, 0, 0, 0, 0, 0]);
    const regs = [
      { holder: "a", scope: "s", kinds: { K: { traces: "any" } } },
      { holder: "b", scope: "s" },
      { holder: "c", scope: "t", instances: [{ id: "1", kind: { scope: "s", kind: "K" }, traces: [] }] },
    ];
    assert.equal(JSON.stringify(assemble(regs)), JSON.stringify(assemble([...regs].reverse())));
    assert.ok(assemble(regs).findings.some((f) => f.rule.startsWith("scope collision")), "two holders of one scope collide");
  });

  it("leaves an absent complement unavailable and admits a cycle with no finding [core/F80]", () => {
    const r = assemble([
      { holder: "x", scope: "x", kinds: { X: { traces: ["X"] } } },
      { holder: "acme", scope: "acme", instances: [{ id: "a", kind: { scope: "x", kind: "X" }, traces: ["b"] }, { id: "b", kind: { scope: "x", kind: "X" }, traces: ["a"] }] },
    ]);
    assert.deepEqual(r.findings, []);
    assert.equal(r.incoming("acme", "a"), null);
  });
});
