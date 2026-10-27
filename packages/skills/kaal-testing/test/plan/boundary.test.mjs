// testing/C11 planned outer tests: PLAN boundary integrity (C-T2).
// Immutable to DO and CHECK; testing/C12 turns them GREEN. Each title names the
// contracts it checks (plan/boundary/*.md). They use kaal-testing's public
// interface only. Each fixture is a case from the Guard lanes, given as a
// verdict either realization could report.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

/** `interpret` from kaal-testing/boundary, or the reason the tests are blocked. */
async function interpreter() {
  let mod;
  try {
    mod = await import("kaal-testing/boundary");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-testing exports no ./boundary (${e.code ?? e.message})`);
  }
  assert.equal(typeof mod.interpret, "function", "blocked before behavioural assertion: kaal-testing/boundary exports no interpret");
  return mod.interpret;
}

const PLAN = "packages/kaal-x/test/plan/x.test.mjs";
const FIXTURES = "packages/kaal-x/test/plan/fixtures/";
const OWNER = { kind: "capability", name: "X" };

/** One concern owner's declaration of its planned boundary. */
const DECLARATION = { concern: "Requirements", owner: OWNER, paths: [PLAN, FIXTURES] };

/** A verdict as either realization reports it: realization A's diff by default. */
const verdict = (over = {}) => ({
  realization: "git",
  anchor: { kind: "plan-commit", ref: "0123456789abcdef0123456789abcdef01234567" },
  bytes: "stored",
  mode: true,
  changes: [],
  outside: [],
  ...over,
});

/** The entries of a list whose text names every given word. */
const naming = (list, ...words) => list.filter((x) => words.every((w) => JSON.stringify(x).includes(w)));

describe("PLAN boundary integrity (testing/C11)", () => {
  it("testing/T20 [testing/F22, testing/F23, testing/I8]: an untouched boundary is unchanged within the declaration, never met, and execution and behaviour stay unknown", async () => {
    const interpret = await interpreter();
    const r = interpret(DECLARATION, verdict());
    assert.equal(r.class, "unchanged within the declaration");
    assert.deepEqual(r.findings.filter((f) => f.kind === "verified failure"), []);
    assert.ok(naming(r.unknowns, "reproducibility").length > 0, "execution reproducibility stays unknown");
    assert.ok(naming(r.unknowns, "behavio").length > 0, "behavioural validity (clean RED, correctness, Outcome) stays unknown");
    assert.doesNotMatch(JSON.stringify(r), /\b(met|passed|valid)\b"/, "nothing is reported met, passed or valid");
  });

  it("testing/T21 [testing/F18, testing/F21]: a changed planned test, and a file a sync re-adds beneath a declared directory (#500), are verified failures naming concern, owner, path and change", async () => {
    const interpret = await interpreter();
    const edited = interpret(DECLARATION, verdict({ changes: [{ path: PLAN, change: "content" }] }));
    assert.equal(edited.class, "verified failure");
    assert.ok(naming(edited.findings, "verified failure", "Requirements", "X", PLAN, "content").length > 0);
    const synced = `${FIXTURES}stale.json`;
    const readded = interpret(DECLARATION, verdict({ changes: [{ path: synced, change: "added" }] }));
    assert.equal(readded.class, "verified failure");
    assert.ok(naming(readded.findings, "verified failure", synced, "added").length > 0, "a file added beneath a declared directory changes the boundary");
    for (const change of ["removed", "renamed"]) {
      assert.equal(interpret(DECLARATION, verdict({ changes: [{ path: PLAN, change }] })).class, "verified failure", `a ${change} planned test changes the boundary`);
    }
  });

  it("testing/T22 [testing/F19, testing/F21]: a lost executable mode (guard/D5) fails when the verdict compared mode, and stays unknown when it did not", async () => {
    const interpret = await interpreter();
    const helper = `${FIXTURES}hook.sh`;
    const a = interpret(DECLARATION, verdict({ changes: [{ path: helper, change: "mode" }] }));
    assert.equal(a.class, "verified failure");
    assert.ok(naming(a.findings, "verified failure", helper, "mode").length > 0);
    const b = interpret(DECLARATION, verdict({ realization: "seal", anchor: { kind: "owner-review", ref: "seal-id" }, mode: false }));
    assert.equal(b.class, "unchanged within the declaration", "an uncompared mode is neither a failure nor a reason to distrust the bytes");
    assert.ok(naming(b.unknowns, "mode").length > 0, "an uncompared mode is unknown");
  });

  it("testing/T23 [testing/F20]: an anchor read from the PR head, a missing anchor, and working-tree bytes (C57, C65) give unknown, never unchanged", async () => {
    const interpret = await interpreter();
    for (const [what, v] of [
      ["the PR head", verdict({ anchor: { kind: "pr-head", ref: "head" } })],
      ["a missing anchor", verdict({ anchor: undefined })],
      ["working-tree bytes", verdict({ realization: "seal", anchor: { kind: "collector-record", ref: "r" }, bytes: "working-tree" })],
    ]) {
      const r = interpret(DECLARATION, v);
      assert.equal(r.class, "unknown", `${what} gives no trusted comparison`);
      assert.ok(r.unknowns.length > 0, `${what} names why it is unknown`);
    }
  });

  it("testing/T24 [testing/F18, testing/F22]: an undeclared cross-Capability dependency (C56) stays unknown, and a declaration whose path leaves the repository is a verified failure", async () => {
    const interpret = await interpreter();
    const format = "packages/kaal-core/plan/installation/contract.md";
    const r = interpret(DECLARATION, verdict({ outside: [format] }));
    assert.ok(naming(r.unknowns, format).length > 0, "what the boundary depends on outside the declaration is unknown");
    assert.notEqual(r.class, "verified failure", "an undeclared dependency is not a failure");
    const escaping = interpret({ ...DECLARATION, paths: [PLAN, "../outside/"] }, verdict());
    assert.equal(escaping.class, "verified failure");
    assert.ok(naming(escaping.findings, "verified failure", "../outside/").length > 0);
  });

  it("testing/T25 [testing/N6, testing/A10, testing/A11]: the same verdict gives the same result from realization A and from realization B, and boundary imports no host module and no Sealing", async () => {
    const interpret = await interpreter();
    for (const changes of [[], [{ path: PLAN, change: "content" }]]) {
      const a = interpret(DECLARATION, verdict({ changes }));
      const b = interpret(DECLARATION, verdict({ changes, realization: "seal", anchor: { kind: "owner-review", ref: "seal-id" } }));
      assert.deepEqual([b.class, b.findings, b.unknowns], [a.class, a.findings, a.unknowns], "Testing reads either realization the same way");
    }
    const source = readFileSync(new URL("../../lib/boundary.mjs", import.meta.url), "utf8");
    const imports = [...source.matchAll(/(?:from\s+|import\s*\(\s*)["']([^"']+)["']/g)].map(([, m]) => m);
    assert.deepEqual(imports, [], "boundary is pure: it imports nothing, Sealing and host modules included");
  });
});
