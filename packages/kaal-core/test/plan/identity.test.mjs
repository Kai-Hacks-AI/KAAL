// core/C164 planned outer tests: identity and numbering. Immutable to DO and CHECK.
// Each title names the contracts it checks (plan/identity/*.md). They use
// kaal-core's public interface only, and give registrations as their frontmatter
// content. The kinds and prefixes here are fixtures: Core prescribes none.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

/** `assemble` from kaal-core/registration, or the reason the tests are blocked before any behavioural assertion. */
async function assembler() {
  let mod;
  try {
    mod = await import("kaal-core/registration");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-core exports no ./registration (${e.code ?? e.message})`);
  }
  assert.equal(typeof mod.assemble, "function", "blocked before behavioural assertion: kaal-core/registration exports no assemble");
  return mod.assemble;
}

/** An assembly that offers `nextFree`, or the reason the test is blocked before any behavioural assertion. */
function finder(assembly) {
  if (typeof assembly.nextFree !== "function") assert.fail("blocked before behavioural assertion: an assembly offers no nextFree");
  return assembly;
}

const reg = (holder, scope, kinds = {}, instances = []) => ({ holder, scope, kinds, instances });
const inst = (id, kind) => ({ id, kind, traces: [] });
const kind = (scope, name) => ({ scope, kind: name });
const C = kind("change", "C");
const T = kind("testing", "T");

/** The two kind owners: Change numbers its Changes `C…`, Testing its Cases `T…`. */
const OWNERS = [reg("kaal-change", "change", { C: { traces: [], numbered: "C" } }), reg("kaal-testing", "testing", { T: { traces: [], numbered: "T" } })];
const rules = (assembly) => assembly.findings.map((f) => f.rule);

describe("Identity and numbering (core/C164)", () => {
  it("core/T134 [core/F125, core/F127, core/A66, core/A67]: a kind with numbered and a holder whose ids follow it assemble with no finding, and nextFree returns one more than the highest held, the prefix and 1 when none is held, and never fills a gap", async () => {
    const assemble = await assembler();
    const a = finder(assemble([...OWNERS, reg("kaal-core", "core", {}, [inst("C150", C), inst("C162", C), inst("C9", C)]), reg("kaal-release", "release", {}, [inst("T1", T), inst("T3", T)])]));
    assert.deepEqual(a.findings, [], "ids that follow the numbering are no finding");
    assert.deepEqual(a.nextFree("core", C), { id: "C163" }, "one more than the highest, whatever order they are held in");
    assert.deepEqual(a.nextFree("release", T), { id: "T4" }, "the gap at T2 is not filled");
    const none = finder(assemble([...OWNERS, reg("kaal-hosting", "hosting")]));
    assert.deepEqual(none.nextFree("hosting", C), { id: "C1" }, "a claimed scope that holds none starts at 1");
  });

  it("core/T135 [core/F126, core/F127, core/A66]: the same id in two scopes is two identities with no finding, nextFree answers each scope on its own, and one id twice in a scope is the collision finding", async () => {
    const assemble = await assembler();
    const a = finder(assemble([...OWNERS, reg("kaal-core", "core", {}, [inst("T128", T)]), reg("kaal-release", "release", {}, [inst("T128", T), inst("T200", T)])]));
    assert.deepEqual(a.findings, [], "T128 in core and in release is no collision");
    assert.deepEqual(a.nextFree("core", T), { id: "T129" });
    assert.deepEqual(a.nextFree("release", T), { id: "T201" });
    const twice = assemble([...OWNERS, reg("kaal-core", "core", {}, [inst("T5", T), inst("T5", T)])]);
    assert.ok(twice.findings.length > 0, "one identity stated twice in a scope is still a finding (core/F49)");
  });

  it("core/T136 [core/F126, core/F127, core/N33, core/A66]: an id of a numbered kind that is not the prefix and a positive decimal without a leading zero is an unnumbered-id finding naming scope, id and kind, and nextFree returns null for that scope and kind and says why", async () => {
    const assemble = await assembler();
    for (const bad of ["T07", "T0", "T-1", "X5", "T1a", "T"]) {
      const a = finder(assemble([...OWNERS, reg("kaal-core", "core", {}, [inst("T1", T), inst(bad, T)])]));
      const found = a.findings.filter((f) => f.rule === "unnumbered-id");
      assert.equal(found.length, 1, `${bad} is one unnumbered-id finding`);
      assert.deepEqual([found[0].scope, found[0].id], ["core", bad]);
      const next = a.nextFree("core", T);
      assert.equal(next.id, null, `${bad} blocks the finder: an unreadable id is never skipped`);
      assert.equal(typeof next.reason, "string");
      assert.ok(next.reason.length > 0);
    }
  });

  it("core/T137 [core/F127, core/N33, core/A67]: nextFree returns null with a reason for a scope no registration claims, a kind not defined and a kind that is not numbered, never a first number", async () => {
    const assemble = await assembler();
    const a = finder(assemble([...OWNERS, reg("kaal-opaque", "opaque", { Free: { traces: [] } }, [inst("whatever", kind("opaque", "Free"))]), reg("kaal-core", "core", {}, [inst("C1", C)])]));
    for (const [scope, k] of [["nowhere", C], ["core", kind("change", "Missing")], ["opaque", kind("opaque", "Free")]]) {
      const next = a.nextFree(scope, k);
      assert.equal(next.id, null, `${scope} ${k.kind} is unknown, not "the first number is free"`);
      assert.equal(typeof next.reason, "string");
    }
    assert.deepEqual(rules(a).filter((r) => r === "unnumbered-id"), [], "an opaque kind keeps the opaque identity it has today");
  });

  it("core/T138 [core/F128, core/A67]: nextFree depends only on the registrations given, so the same registrations in any order give the same answer, and a number held only in a registration added to the union is no longer offered", async () => {
    const assemble = await assembler();
    const main = reg("kaal-core", "core", {}, [inst("C162", C)]);
    const branch = reg("kaal-core-branch", "core-extra", {}, []);
    const onBranch = reg("kaal-core", "core", {}, [inst("C162", C), inst("C163", C)]);
    const one = finder(assemble([...OWNERS, main, branch])).nextFree("core", C);
    const two = finder(assemble([branch, main, ...[...OWNERS].reverse()])).nextFree("core", C);
    assert.deepEqual(one, { id: "C163" });
    assert.deepEqual(two, one, "order of the registrations changes nothing");
    assert.deepEqual(finder(assemble([...OWNERS, onBranch])).nextFree("core", C), { id: "C164" }, "a number held on a branch the caller passes is not offered again");
  });
});
