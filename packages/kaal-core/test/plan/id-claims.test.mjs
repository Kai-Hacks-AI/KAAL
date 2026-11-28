// core/C251 planned outer tests: id claims. Immutable to DO and CHECK.
// Each title names the contracts it checks (plan/id-claims/*.md). They call
// judgeIdClaims and nextClaim with data only. The capabilities, kinds and
// numbers here are fixtures: Core states none.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

/** `kaal-core/id-claims`, or the reason the tests are blocked before any behavioural assertion. */
async function claims() {
  let mod;
  try {
    mod = await import("kaal-core/id-claims");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-core exports no ./id-claims (${e.code ?? e.message})`);
  }
  assert.equal(typeof mod.judgeIdClaims, "function", "blocked before behavioural assertion: kaal-core/id-claims exports no judgeIdClaims");
  assert.equal(typeof mod.nextClaim, "function", "blocked before behavioural assertion: kaal-core/id-claims exports no nextClaim");
  return mod;
}

const FROM = { change: 251, case: 1800 };
const claim = (capability, kind, id, name = `${kind}-${id}.json`) => ({ name, content: { capability, kind, id } });
const use = (capability, kind, id, path = `p/${kind}${id}`) => ({ capability, kind, id, path });
const rules = (r) => r.findings.map((f) => f.rule).sort();

describe("Id claims (core/C251)", () => {
  it("core/T142 [core/F133, core/F134, core/A70]: well-formed claims whose name agrees with their content pass, and a name that disagrees, a missing or extra member, a range, a list, an id that is not a positive integer and a kind that is not a lowercase word are each a mismatch", async () => {
    const { judgeIdClaims } = await claims();
    const ok = judgeIdClaims({ claims: [claim("core", "change", 251), claim("release", "case", 1800)], used: [], from: FROM });
    assert.equal(ok.verdict, "pass");
    assert.deepEqual(ok.findings, []);
    const bad = [
      { name: "change-252.json", content: { capability: "core", kind: "change", id: 251 } },
      { name: "case-251.json", content: { capability: "core", kind: "change", id: 251 } },
      { name: "change-251.json", content: { kind: "change", id: 251 } },
      { name: "change-251.json", content: { capability: "", kind: "change", id: 251 } },
      { name: "change-251.json", content: { capability: "core", kind: "change", id: 251, extra: 1 } },
      { name: "change-251.json", content: { capability: "core", kind: "change", from: 251, to: 260 } },
      { name: "change-251.json", content: { capability: "core", kind: "change", id: 251, to: 260 } },
      { name: "change-251.json", content: { capability: "core", kind: "change", id: [251, 252] } },
      { name: "change-251.json", content: { capability: "core", kind: "change", id: "251" } },
      { name: "change-0.json", content: { capability: "core", kind: "change", id: 0 } },
      { name: "change--1.json", content: { capability: "core", kind: "change", id: -1 } },
      { name: "change-2.5.json", content: { capability: "core", kind: "change", id: 2.5 } },
      { name: "Change-251.json", content: { capability: "core", kind: "Change", id: 251 } },
    ];
    for (const c of bad) {
      const r = judgeIdClaims({ claims: [c], used: [], from: FROM });
      assert.equal(r.verdict, "fail", `${JSON.stringify(c)} passed`);
      assert.ok(rules(r).includes("mismatch"), `${JSON.stringify(c)} is a mismatch`);
    }
  });

  it("core/T143 [core/F135, core/F136, core/A70]: an id below its kind's first claimable number is legacy and not judged, a claim below it is below-start, and two claims of one kind and id are a duplicate naming both capabilities", async () => {
    const { judgeIdClaims } = await claims();
    const legacy = judgeIdClaims({ claims: [], used: [use("release", "change", 175), use("controls", "change", 175), use("hosting", "case", 1740)], from: FROM });
    assert.equal(legacy.verdict, "pass", "a legacy id was judged");
    const low = judgeIdClaims({ claims: [claim("core", "change", 175)], used: [], from: FROM });
    assert.equal(low.verdict, "fail");
    assert.deepEqual(rules(low), ["below-start"]);
    const twice = judgeIdClaims({ claims: [claim("core", "change", 300), claim("release", "change", 300, "change-300-b.json")], used: [], from: FROM });
    assert.equal(twice.verdict, "fail");
    assert.ok(rules(twice).includes("duplicate"));
    const text = JSON.stringify(twice.findings);
    assert.ok(text.includes("core") && text.includes("release"), "the duplicate names both capabilities");
    const other = judgeIdClaims({ claims: [claim("core", "change", 300), claim("core", "case", 1800)], used: [], from: FROM });
    assert.equal(other.verdict, "pass", "one number in two kinds is no duplicate");
  });

  it("core/T144 [core/F137, core/A70]: an id used at or above the first claimable number passes when its owner claimed it, is unclaimed with no claim, and is foreign when another capability claimed it, and a legacy id used by any capability passes", async () => {
    const { judgeIdClaims } = await claims();
    const have = [claim("core", "change", 251), claim("release", "change", 252), claim("core", "case", 1800)];
    assert.equal(judgeIdClaims({ claims: have, used: [use("core", "change", 251), use("core", "case", 1800)], from: FROM }).verdict, "pass");
    const none = judgeIdClaims({ claims: have, used: [use("core", "change", 400)], from: FROM });
    assert.equal(none.verdict, "fail");
    assert.deepEqual(rules(none), ["unclaimed"]);
    const stolen = judgeIdClaims({ claims: have, used: [use("core", "change", 252)], from: FROM });
    assert.equal(stolen.verdict, "fail");
    assert.deepEqual(rules(stolen), ["foreign"]);
    assert.ok(JSON.stringify(stolen.findings).includes("release"), "the finding names who claimed it");
    const kind = judgeIdClaims({ claims: have, used: [use("core", "case", 251)], from: FROM });
    assert.equal(kind.verdict, "fail", "a change claim admitted a case id");
    assert.equal(judgeIdClaims({ claims: have, used: [use("hotfix", "case", 12)], from: FROM }).verdict, "pass", "a legacy id passes whoever uses it");
  });

  it("core/T145 [core/F138, core/N34, core/A70]: a claims, used or from that is not the shape it should be is unknown with the fact named, never a pass", async () => {
    const { judgeIdClaims } = await claims();
    const good = { claims: [claim("core", "change", 251)], used: [], from: FROM };
    for (const bad of [undefined, null, 7, {}, "x"]) {
      const r = judgeIdClaims({ ...good, claims: bad });
      assert.equal(r.verdict, "unknown", `claims ${JSON.stringify(bad)} was judged`);
      assert.equal(r.fact, "claims");
    }
    for (const bad of [undefined, null, 7, {}, "x", [{ capability: "core", kind: "change", id: "1", path: "p" }], [{ kind: "change", id: 1, path: "p" }]]) {
      const r = judgeIdClaims({ ...good, used: bad });
      assert.equal(r.verdict, "unknown", `used ${JSON.stringify(bad)} was judged`);
      assert.equal(r.fact, "used");
    }
    for (const bad of [undefined, null, 7, [], "x", { change: "251" }, { change: 0 }, { change: 2.5 }]) {
      const r = judgeIdClaims({ ...good, from: bad });
      assert.equal(r.verdict, "unknown", `from ${JSON.stringify(bad)} was judged`);
      assert.equal(r.fact, "from");
    }
    assert.equal(judgeIdClaims(undefined).verdict, "unknown", "no input at all is unknown");
  });

  it("core/T146 [core/F139, core/N34, core/A70]: nextClaim is one above the highest claim of its kind or the first claimable number when there is none, never fills a gap, gives the same answer twice, answers each kind on its own, and is null with a reason for a kind not in from or a claim it cannot read", async () => {
    const { nextClaim } = await claims();
    const have = [claim("core", "change", 251), claim("release", "change", 253), claim("core", "case", 1805)];
    assert.deepEqual(nextClaim(have, FROM, "change"), { id: 254 }, "the gap at 252 is not filled");
    assert.deepEqual(nextClaim(have, FROM, "change"), nextClaim(have, FROM, "change"), "it reserves nothing");
    assert.deepEqual(nextClaim(have, FROM, "case"), { id: 1806 }, "each kind on its own");
    assert.deepEqual(nextClaim([], FROM, "change"), { id: 251 }, "none claimed gives the first claimable number");
    for (const [c, f, k] of [[have, FROM, "defect"], [[{ name: "x.json", content: 7 }], FROM, "change"], [7, FROM, "change"], [have, 7, "change"]]) {
      const r = nextClaim(c, f, k);
      assert.equal(r.id, null);
      assert.ok(typeof r.reason === "string" && r.reason.length > 0);
    }
  });

  it("core/T147 [core/N34, core/A70]: the verdict and the findings do not depend on the order of the claims or the uses", async () => {
    const { judgeIdClaims } = await claims();
    const cs = [claim("core", "change", 251), claim("release", "change", 252), claim("core", "case", 1800), claim("core", "change", 175), claim("hosting", "change", 400, "change-401.json")];
    const us = [use("core", "change", 251), use("core", "change", 252), use("core", "change", 999), use("release", "case", 1800)];
    const one = judgeIdClaims({ claims: cs, used: us, from: FROM });
    const two = judgeIdClaims({ claims: [...cs].reverse(), used: [...us].reverse(), from: FROM });
    assert.equal(one.verdict, "fail");
    assert.equal(two.verdict, one.verdict);
    const text = (r) => r.findings.map((f) => JSON.stringify(f)).sort();
    assert.deepEqual(text(two), text(one));
  });
});
