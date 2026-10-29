// testing/C12 implementation tests for kaal-testing/boundary, beside the
// planned outer tests in test/plan/boundary.test.mjs.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { interpret, problems } from "kaal-testing/boundary";

const DECLARATION = { concern: "Intent", owner: { kind: "capability", name: "Y" }, paths: ["packages/y/test/plan/"] };
const VERDICT = { realization: "git", anchor: { kind: "plan-commit", ref: "c" }, bytes: "stored", mode: true, changes: [], outside: [] };

describe("interpret", () => {
  it("reports a change against an untrusted baseline as unknown, never as a verified failure", () => {
    const r = interpret(DECLARATION, { ...VERDICT, anchor: { kind: "pr-head", ref: "h" }, changes: [{ path: "packages/y/test/plan/a.test.mjs", change: "content" }] });
    assert.equal(r.class, "unknown");
    assert.deepEqual(r.findings, []);
    assert.ok(r.unknowns.some((u) => u.subject === "packages/y/test/plan/a.test.mjs"));
  });

  it("ignores a change outside the declaration, and keeps an unknown change kind unknown", () => {
    assert.equal(interpret(DECLARATION, { ...VERDICT, changes: [{ path: "packages/y/src/x.ts", change: "content" }] }).class, "unchanged within the declaration");
    const odd = interpret(DECLARATION, { ...VERDICT, changes: [{ path: "packages/y/test/plan/a.test.mjs", change: "copied" }] });
    assert.deepEqual(odd.findings, []);
    assert.ok(odd.unknowns.some((u) => u.reason.includes("copied")));
  });

  it("is unknown for a verdict with no known realization or no list of changes", () => {
    assert.equal(interpret(DECLARATION, { ...VERDICT, realization: "rsync" }).class, "unknown");
    assert.equal(interpret(DECLARATION, { ...VERDICT, changes: undefined }).class, "unknown");
    assert.equal(interpret(DECLARATION, null).class, "unknown");
  });

  it("names why a declaration does not read", () => {
    assert.deepEqual(problems(DECLARATION), []);
    assert.equal(problems(null).length, 1);
    assert.equal(problems({ concern: "", owner: {}, paths: [] }).length, 3);
    for (const p of ["/abs", "a\\b", "a/./b", "a//b", ""]) assert.equal(problems({ ...DECLARATION, paths: [p] }).length, 1, p);
  });

  it("returns fresh unknowns, so a caller's change to one result never reaches the next", () => {
    const first = interpret(DECLARATION, VERDICT);
    for (const u of first.unknowns) u.reason = "changed by a caller";
    assert.ok(interpret(DECLARATION, VERDICT).unknowns.every((u) => u.reason !== "changed by a caller"));
  });
});
