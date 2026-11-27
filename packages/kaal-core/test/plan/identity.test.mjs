// core/C164 planned outer tests: identity and numbering. Immutable to DO and CHECK.
// Each title names the contracts it checks (plan/identity/*.md). They use
// kaal-core's public interface only, and give registrations as their frontmatter
// content. The kinds, prefixes and technical identities here are fixtures: Core
// prescribes none.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

/** `kaal-core/registration`, or the reason the tests are blocked before any behavioural assertion. */
async function registration() {
  try {
    return await import("kaal-core/registration");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-core exports no ./registration (${e.code ?? e.message})`);
  }
}

/** An assembly that offers `nextID` and `checkID`, or the reason the test is blocked before any behavioural assertion. */
async function assembly(registrations) {
  const { assemble } = await registration();
  assert.equal(typeof assemble, "function", "blocked before behavioural assertion: kaal-core/registration exports no assemble");
  const a = assemble(registrations);
  if (typeof a.nextID !== "function" || typeof a.checkID !== "function") assert.fail("blocked before behavioural assertion: an assembly offers no nextID and checkID");
  return a;
}

const reg = (holder, scope, kinds = {}, instances = []) => ({ holder, scope, kinds, instances });
const inst = (id, kind, guid, ...traces) => ({ id, kind, guid, traces });
const kind = (scope, name) => ({ scope, kind: name });
const C = kind("change", "C");
const T = kind("testing", "T");

/** The two kind owners: Change numbers its Changes `C…`, Testing its Cases `T…`. */
const OWNERS = [reg("kaal-change", "change", { C: { traces: "any", numbered: "C" } }), reg("kaal-testing", "testing", { T: { traces: "any", numbered: "T" } })];
const claim = (guid, namespace, id, k) => ({ guid, namespace, id, kind: k });
const text = (x) => JSON.stringify(x);
const rules = (a) => a.findings.map((f) => f.rule);

describe("Identity and numbering (core/C164)", () => {
  it("core/T134 [core/F125, core/F128, core/A66, core/A67]: a kind with numbered and instances whose ids follow it assemble with no finding, and nextID proposes one more than the highest held, the prefix and 1 when none is held, never fills a gap, and gives the same proposal to two callers", async () => {
    const a = await assembly([...OWNERS, reg("kaal-core", "core", {}, [inst("C150", C, "g1"), inst("C162", C, "g2"), inst("C9", C, "g3")]), reg("kaal-release", "release", {}, [inst("T1", T, "g4"), inst("T3", T, "g5")])]);
    assert.deepEqual(a.findings, [], "ids that follow the numbering are no finding");
    assert.deepEqual(a.nextID("core", C), { id: "C163" }, "one more than the highest, whatever order they are held in");
    assert.deepEqual(a.nextID("core", C), a.nextID("core", C), "a proposal reserves nothing: the same claims give the same answer");
    assert.deepEqual(a.nextID("release", T), { id: "T4" }, "the gap at T2 is not filled");
    const none = await assembly([...OWNERS, reg("kaal-empty", "empty")]);
    assert.deepEqual(none.nextID("empty", C), { id: "C1" }, "a claimed namespace that holds none starts at 1");
  });

  it("core/T135 [core/F126, core/F127, core/F128, core/A67]: the same identifier in two namespaces is two things with no finding, nextID answers each namespace on its own, and checkID on a claim of another guid for a held identifier names the holder as id-taken", async () => {
    const a = await assembly([...OWNERS, reg("kaal-core", "core", {}, [inst("T128", T, "g-core")]), reg("kaal-release", "release", {}, [inst("T128", T, "g-rel"), inst("T200", T, "g-rel2")])]);
    assert.deepEqual(a.findings, [], "T128 in core and in release is no collision");
    assert.deepEqual(a.nextID("core", T), { id: "T129" });
    assert.deepEqual(a.nextID("release", T), { id: "T201" });
    const taken = a.checkID(claim("g-other", "core", "T128", T));
    assert.equal(taken.ok, false);
    assert.ok(taken.findings.some((f) => f.rule === "id-taken" && text(f).includes("g-core")), "the finding names the technical identity that holds it");
    assert.deepEqual(a.checkID(claim("g-other", "core", "T129", T)), { ok: true }, "a free identifier is accepted");
  });

  it("core/T136 [core/F127, core/F128, core/N33, core/A67]: checkID returns unnumbered-id for an identifier that is not the prefix and a positive decimal without a leading zero and unclaimed-namespace for a namespace nobody claims, and nextID returns null with a reason where the namespace holds an unnumbered identifier, is unclaimed, or the kind is undefined or not numbered", async () => {
    const a = await assembly([...OWNERS, reg("kaal-opaque", "opaque", { Free: { traces: "any" } }, [inst("whatever", kind("opaque", "Free"), "g-free")]), reg("kaal-core", "core", {}, [inst("C1", C, "g1")])]);
    for (const bad of ["C07", "C0", "C-1", "X5", "C1a", "C"]) {
      const v = a.checkID(claim("g-new", "core", bad, C));
      assert.equal(v.ok, false, `${bad} is refused`);
      assert.ok(v.findings.some((f) => f.rule === "unnumbered-id"), `${bad} is unnumbered-id`);
    }
    const lost = a.checkID(claim("g-new", "nowhere", "C1", C));
    assert.ok(lost.ok === false && lost.findings.some((f) => f.rule === "unclaimed-namespace"));
    for (const [ns, k] of [["nowhere", C], ["core", kind("change", "Missing")], ["opaque", kind("opaque", "Free")]]) {
      const next = a.nextID(ns, k);
      assert.equal(next.id, null, `${ns} ${k.kind} is unknown, not "the first number is free"`);
      assert.ok(typeof next.reason === "string" && next.reason.length > 0);
    }
    const dirty = await assembly([...OWNERS, reg("kaal-core", "core", {}, [inst("C1", C, "g1"), inst("C07", C, "g2")])]);
    assert.ok(rules(dirty).includes("unnumbered-id"), "an unreadable identifier already held is a finding, never skipped");
    assert.equal(dirty.nextID("core", C).id, null, "and the finder refuses to answer past it");
  });

  it("core/T137 [core/F127, core/F129, core/N33, core/A67]: a renumbering, the same guid with another identifier, is judged as a proposal and is no finding by itself, and two proposals that take one identifier with different guids each fail against a union holding the other, whatever the order the claims were given in", async () => {
    const a = await assembly([...OWNERS, reg("kaal-core", "core", {}, [inst("C1", C, "g1")])]);
    assert.deepEqual(a.checkID(claim("g1", "core", "C7", C)), { ok: true }, "the same technical identity under another identifier is a renumbering");
    assert.deepEqual(a.checkID(claim("g1", "core", "C1", C)), { ok: true }, "and its own current claim is no clash with itself");
    const entryA = reg("kaal-core", "core", {}, [inst("C9", C, "gA")]);
    const entryB = reg("kaal-core", "core", {}, [inst("C9", C, "gB")]);
    const forward = await assembly([...OWNERS, entryA, entryB]);
    const backward = await assembly([entryB, entryA, ...[...OWNERS].reverse()]);
    for (const u of [forward, backward]) {
      const clash = u.findings.filter((f) => text(f).includes("gA") && text(f).includes("gB"));
      assert.ok(clash.length > 0, "the verdict on the union names both technical identities");
    }
    assert.deepEqual(forward.findings.map(text).sort(), backward.findings.map(text).sort(), "the verdict does not depend on the order of the claims");
    const heldByA = await assembly([...OWNERS, entryA]);
    const lateB = heldByA.checkID(claim("gB", "core", "C9", C));
    assert.ok(lateB.ok === false && lateB.findings.some((f) => f.rule === "id-taken" && text(f).includes("gA")), "the proposal judged second fails");
  });

  it("core/T138 [core/F126, core/A66]: one guid stated by two instances is a guid-claimed-twice finding naming both", async () => {
    const a = await assembly([...OWNERS, reg("kaal-core", "core", {}, [inst("C1", C, "g-copied")]), reg("kaal-release", "release", {}, [inst("C1", C, "g-copied")])]);
    const found = a.findings.filter((f) => f.rule === "guid-claimed-twice");
    assert.equal(found.length, 1);
    assert.ok(text(found[0]).includes("core") && text(found[0]).includes("release"), "it names both claims");
  });

  it("core/T139 [core/F130, core/A68]: a trace that states a guid still resolves after its target is renumbered, and a trace that states a namespace and an identifier is unresolved after it, with nothing guessed", async () => {
    const fixtures = (id) => [
      ...OWNERS,
      reg("kaal-core", "core", {}, [
        inst(id, C, "g-change"),
        inst("T1", T, "g-by-guid", { guid: "g-change" }),
        inst("T2", T, "g-by-id", { scope: "core", id: "C1" }),
      ]),
    ];
    const before = await assembly(fixtures("C1"));
    assert.deepEqual(before.findings, [], "both traces resolve while the target is C1");
    const after = await assembly(fixtures("C7"));
    const unresolved = after.findings.filter((f) => String(f.rule).startsWith("unresolved"));
    assert.equal(unresolved.length, 1, "exactly one trace no longer resolves");
    assert.equal(unresolved[0].source.id, "T2", "the one that stated the old identifier");
  });

  it("core/T140 [core/F131, core/A68]: an instance with no guid is reported as unadopted and is no finding, and adoptGuid gives the same guid for the same namespace and identifier on every call and a different one for another", async () => {
    const mod = await registration();
    assert.equal(typeof mod.adoptGuid, "function", "blocked before behavioural assertion: kaal-core/registration exports no adoptGuid");
    const a = await assembly([...OWNERS, reg("kaal-core", "core", {}, [{ id: "C150", kind: C }, inst("C151", C, "g-adopted")])]);
    assert.deepEqual(a.findings, [], "an unadopted instance is judged as it is today and is no finding");
    assert.ok(a.unadopted.some((x) => x.scope === "core" && x.id === "C150"), "it is reported as unadopted");
    assert.ok(!a.unadopted.some((x) => x.id === "C151"), "an adopted one is not");
    const one = mod.adoptGuid("core", "C150");
    assert.equal(typeof one, "string");
    assert.ok(one.length > 0);
    assert.equal(mod.adoptGuid("core", "C150"), one, "the same input gives the same guid on every call");
    assert.notEqual(mod.adoptGuid("core", "C151"), one, "another identifier gives another guid");
    assert.notEqual(mod.adoptGuid("release", "C150"), one, "another namespace gives another guid");
  });
});
