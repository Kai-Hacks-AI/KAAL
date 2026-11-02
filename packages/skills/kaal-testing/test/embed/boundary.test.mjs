// kaal-testing's embedded cases for PLAN boundary integrity (testing/F18–testing/F23). They reach the installed
// package by its name and decide each requirement from behaviour.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { interpret } from "kaal-testing/boundary";

const PLAN = "acme/spec/a.test.mjs";
const DECLARATION = { concern: "Requirements", owner: { kind: "capability", name: "Acme" }, paths: [PLAN, "acme/spec/fixtures/"] };
const verdict = (over = {}) => ({ realization: "git", anchor: { kind: "plan-commit", ref: "0123456789abcdef0123456789abcdef01234567" }, bytes: "stored", mode: true, changes: [], outside: [], ...over });
const attest = (v) => ({ by: "the gate that produced and verified the verdict", anchor: v.anchor.ref });

describe("PLAN boundary integrity", () => {
  it("reads an untouched boundary as unchanged within the declaration, never as met [testing/F22, testing/F23]", () => {
    const v = verdict();
    assert.equal(interpret(DECLARATION, v, attest(v)).class, "unchanged within the declaration");
  });

  it("reads a changed planned test as a verified failure [testing/F18, testing/F21]", () => {
    const v = verdict({ changes: [{ path: PLAN, change: "content" }] });
    assert.equal(interpret(DECLARATION, v, attest(v)).class, "verified failure");
  });

  it("reads a verdict without its trust authority's attestation as unknown, never unchanged [testing/F19, testing/F20]", () => {
    assert.equal(interpret(DECLARATION, verdict()).class, "unknown");
  });
});
