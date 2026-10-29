// change/C1 planned outer tests: Change Nodes, succession and delivery.
// Immutable to DO and CHECK; the DO Change turns them GREEN. Each title names
// the contracts it checks (plan/delivery/*.md). They use kaal-change's
// public interface and its shipped Definitions, and build Nodes with Graph.
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { createNode, identify } from "kaal-graph";

const CAPABILITY = fileURLToPath(new URL("../../capability/", import.meta.url));
const ref = (node) => ({ name: node.name, id: node.id });

/** `assess` from kaal-change/delivery, or the reason the tests are blocked before any behavioural assertion. */
async function assessor() {
  let mod;
  try {
    mod = await import("kaal-change/delivery");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-change exports no ./delivery (${e.code ?? e.message})`);
  }
  assert.equal(typeof mod.assess, "function", "blocked before behavioural assertion: kaal-change/delivery exports no assess");
  return mod.assess;
}

/** A shipped Definition, or the reason the tests are blocked. */
function definition(file) {
  const path = CAPABILITY + file;
  assert.ok(existsSync(path), `blocked before behavioural assertion: kaal-change ships no capability/${file}`);
  return identify(readFileSync(path));
}

/** What every test needs: assess, the Change, Succeeds and Delivers Definitions, and a Change Node builder. */
async function fixture() {
  const assess = await assessor();
  const definitions = [definition("Change-Definition.md"), definition("Succeeds.md"), definition("Delivers.md")];
  const [CHANGE, SUCCEEDS, DELIVERS] = definitions.map(ref);
  /** A Change Node named `name` that succeeds the given Nodes and delivers the given Intents. */
  const change = (name, preds = [], frontmatter = {}, body = `# ${name}\n`, intents = []) =>
    identify(createNode({
      name,
      type: CHANGE,
      ...(preds.length || intents.length
        ? { edges: [
            ...(preds.length ? [{ type: SUCCEEDS, targets: preds.map(ref) }] : []),
            ...(intents.length ? [{ type: DELIVERS, targets: intents.map(ref) }] : []),
          ] }
        : {}),
      frontmatter,
      body,
    }).bytes);
  return { assess, definitions, CHANGE, SUCCEEDS, DELIVERS, change };
}

/** An Intent Node, as the Intent capability would keep it. Its type is the Intent capability's, which Change does not judge. */
const INTENT = Object.freeze({ name: "Intent", id: "1".repeat(64) });
const intentNode = (name, body = `# ${name}\n`) => identify(createNode({ name, type: INTENT, frontmatter: {}, body }).bytes);

/** The findings whose text names every given word. */
const naming = (findings, ...words) => findings.filter((f) => words.every((w) => JSON.stringify(f).includes(w)));

describe("Change Nodes, succession and delivery (change/C1)", () => {
  it("change/T1 [change/I1, change/F1, change/F2, change/F5]: a Node typed by the Change Definition is a Change under its identity, `has` it, and a malformed identity is a finding it does not have", async () => {
    const { assess, definitions, change } = await fixture();
    const good = change("sample/C1");
    const r = assess([...definitions, good]);
    assert.deepEqual(r.changes.map((c) => c.identity), ["sample/C1"], "the Change is known by its identity");
    assert.equal(r.changes[0].id, good.id, "and carries its Node id");
    assert.deepEqual(r.findings, [], "a well-formed Change is no finding");
    assert.equal(r.has("sample/C1"), true, "it has the Change");
    assert.equal(r.has("sample/C9"), false, "and not one that is absent");
    for (const bad of ["sample/c1", "sample/C01", "sample/C0", "C1", "sample/C1a", "sample/T1"]) {
      const b = assess([...definitions, change(bad)]);
      assert.ok(naming(b.findings, bad).length > 0, `${bad} is a malformed identity`);
      assert.ok(!b.changes.some((c) => c.identity === bad), `${bad} is not walked as a Change`);
      assert.equal(b.has(bad), false, `${bad} is not had`);
    }
  });

  it("change/T2 [change/F2, change/F5]: two Change Nodes with one identity are a finding, neither is walked, and `has` is false for it", async () => {
    const { assess, definitions, change } = await fixture();
    const one = change("sample/C1", [], {}, "one\n");
    const other = change("sample/C1", [], {}, "other\n");
    const r = assess([...definitions, one, other, change("sample/C2", [one])]);
    assert.ok(naming(r.findings, "sample/C1", one.id, other.id).length > 0, "the duplicate identity names both Nodes");
    assert.ok(!r.changes.some((c) => c.identity === "sample/C1"), "neither Node is walked");
    assert.equal(r.has("sample/C1"), false, "a duplicated identity is not had");
    assert.deepEqual(r.succeeds("sample/C2"), [], "succeeding a duplicated identity is not walked");
  });

  it("change/T3 [change/I2, change/N2, change/F5]: a predecessor is stated by its successor alone, and the reverse is derived", async () => {
    const { assess, definitions, change } = await fixture();
    const a = change("sample/C1");
    const b = change("sample/C2", [a]);
    const r = assess([...definitions, a, b]);
    assert.deepEqual(r.findings, []);
    assert.deepEqual(r.succeeds("sample/C2"), ["sample/C1"], "the successor states its predecessor");
    assert.deepEqual(r.succeeds("sample/C1"), [], "the predecessor states nothing");
    assert.deepEqual(r.successors("sample/C1"), ["sample/C2"], "what succeeds it is derived");
    assert.equal(a.frontmatter.edges, undefined, "nothing was written into the predecessor");
  });

  it("change/T4 [change/F5, change/A3]: the transitive views follow the Edges all the way, in both directions", async () => {
    const { assess, definitions, change } = await fixture();
    const c1 = change("x/C1");
    const c2 = change("y/C2", [c1]);
    const c3 = change("x/C3", [c2]);
    const c4 = change("z/C4", [c1, c3]);
    const r = assess([...definitions, c4, c3, c2, c1]);
    assert.deepEqual(r.findings, []);
    assert.deepEqual(r.succeeds("z/C4"), ["x/C1", "x/C3"], "direct predecessors, sorted");
    assert.deepEqual(r.succeeds("z/C4", { transitive: true }), ["x/C1", "x/C3", "y/C2"], "transitive predecessors, across namespaces, once each");
    assert.deepEqual(r.successors("x/C1"), ["y/C2", "z/C4"], "direct successors, sorted");
    assert.deepEqual(r.successors("x/C1", { transitive: true }), ["x/C3", "y/C2", "z/C4"], "everything that succeeds it");
  });

  it("change/T5 [change/F4]: an unresolved target and a target that is not a Change are findings", async () => {
    const { assess, definitions, change } = await fixture();
    const absent = change("sample/C9");
    const b = change("sample/C2", [absent]);
    const r = assess([...definitions, b]);
    assert.ok(naming(r.findings, "sample/C2", "sample/C9", "unresolved").length > 0, "a target that is not present is unresolved");
    assert.deepEqual(r.succeeds("sample/C2"), [], "an unresolved Edge is not listed");
    const [changeDefinition] = definitions;
    const c = change("sample/C3", [changeDefinition]);
    const s = assess([...definitions, c]);
    assert.ok(naming(s.findings, "sample/C3", changeDefinition.id, "not a Change").length > 0, "a target of another type is not a Change");
    assert.deepEqual(s.succeeds("sample/C3"), []);
  });

  it("change/T6 [change/F4, change/A4]: a target edited after it was pinned is stale, and is reported, not repaired", async () => {
    const { assess, definitions, change } = await fixture();
    const before = change("sample/C1", [], {}, "as planned\n");
    const after = change("sample/C1", [], {}, "as edited\n");
    const b = change("sample/C2", [before]);
    const r = assess([...definitions, after, b]);
    assert.ok(naming(r.findings, "sample/C2", "sample/C1", before.id, "stale").length > 0, "the stale pin names the successor, the identity and the pinned id");
    assert.deepEqual(r.succeeds("sample/C2"), [], "a stale Edge is not listed");
    assert.deepEqual(r.successors("sample/C1"), [], "and is not reversed onto the edited Change");
    assert.equal(r.changes.find((c) => c.identity === "sample/C2").id, b.id, "the successor is unchanged");
  });

  it("change/T7 [change/I3, change/F3, change/F6]: priority, rank, order, state and delivered are not a Change Node's to hold", async () => {
    const { assess, definitions, change } = await fixture();
    for (const key of ["priority", "rank", "order", "state", "delivered"]) {
      const r = assess([...definitions, change("sample/C1", [], { [key]: "1" })]);
      assert.ok(naming(r.findings, "sample/C1", key).length > 0, `${key} is a finding`);
    }
    const r = assess([...definitions, change("sample/C1", [], { title: "kept" })]);
    assert.deepEqual(r.findings, [], "other keys are the Change's own");
    for (const c of r.changes) for (const key of ["priority", "rank", "order", "state", "delivered"]) assert.ok(!(key in c), `the result carries no ${key}`);
  });

  it("change/T8 [change/N1, change/I4]: order does not matter, other Nodes are ignored, and no Changes give an empty result", async () => {
    const { assess, definitions, change } = await fixture();
    const a = change("sample/C1");
    const b = change("sample/C2", [a]);
    const nodes = [...definitions, a, b];
    const forward = assess(nodes);
    const backward = assess([...nodes].reverse());
    assert.deepEqual(backward.changes, forward.changes);
    assert.deepEqual(backward.findings, forward.findings);
    assert.deepEqual(backward.successors("sample/C1"), forward.successors("sample/C1"));
    const none = assess(definitions);
    assert.deepEqual(none.changes, [], "the Definitions are not Changes");
    assert.deepEqual(none.findings, [], "no Changes is no finding");
    assert.deepEqual(assess([]).changes, []);
  });

  it("change/T17 [change/F4, change/F12, change/A4]: under content addressing, closing a cycle edits a pinned Change, so the attempt is a stale pin and never a cycle", async () => {
    const { assess, definitions, change } = await fixture();
    const a = change("sample/C1");
    const b = change("sample/C2", [a]);
    const closing = change("sample/C1", [b]);
    assert.notEqual(closing.id, a.id, "stating the predecessor changes the Change's bytes, and so its id");
    const r = assess([...definitions, closing, b]);
    assert.ok(naming(r.findings, "sample/C2", "sample/C1", a.id, "stale").length > 0, "the Edge pinned before the edit is stale");
    assert.deepEqual(naming(r.findings, "cycle"), [], "no cycle resolves, so none is reported");
    assert.deepEqual(r.succeeds("sample/C1", { transitive: true }), ["sample/C2"], "the new Edge resolves");
    assert.deepEqual(r.succeeds("sample/C2", { transitive: true }), [], "the stale Edge is not walked");
    assert.deepEqual(r.successors("sample/C1", { transitive: true }), [], "nor reversed");
  });

  it("change/T18 [change/F12, change/A4]: Nodes whose ids are not their bytes' hash can state a cycle, which is a finding naming its Changes, and the views still terminate", async () => {
    const { assess, definitions, change } = await fixture();
    // Graph takes any frozen Node as identify() shapes it and does not recompute its id,
    // so these ids are asserted, not derived from bytes.
    const ID = { A: "a".repeat(64), B: "b".repeat(64), C: "c".repeat(64) };
    const forged = (name, id, deps) => {
      const n = change(name, deps.map(([depName, depId]) => ({ name: depName, id: depId })));
      return Object.freeze({ ...n, id });
    };
    const a = forged("sample/C1", ID.A, [["sample/C2", ID.B]]);
    const b = forged("sample/C2", ID.B, [["sample/C1", ID.A]]);
    const self = forged("sample/C3", ID.C, [["sample/C3", ID.C]]);
    const r = assess([...definitions, a, b, self]);
    assert.ok(naming(r.findings, "cycle", "sample/C1", "sample/C2").length > 0, "the cycle names each of its Changes");
    assert.ok(naming(r.findings, "cycle", "sample/C3").length > 0, "a Change succeeding itself is a cycle");
    assert.deepEqual(r.succeeds("sample/C1", { transitive: true }), ["sample/C2"], "the walk terminates and never lists the start");
    assert.deepEqual(r.successors("sample/C1", { transitive: true }), ["sample/C2"]);
    assert.deepEqual(r.succeeds("sample/C3", { transitive: true }), [], "a Change is never its own predecessor");
    assert.deepEqual(r.successors("sample/C3"), []);
    const acyclic = assess([...definitions, change("sample/C1"), change("sample/C4")]);
    assert.deepEqual(naming(acyclic.findings, "cycle"), [], "without a cycle there is no cycle finding");
  });

  it("change/T19 [change/F13, change/A9]: `exchange()` is plain, sorted, deterministic data: walked Changes with resolved direct relationships and required Cases, and typed findings", async () => {
    const { assess, definitions, change } = await fixture();
    const intent = intentNode("sample/I1");
    const c1 = change("sample/C1", [], { requires: ["sample/T2", "sample/T1"] }, "# sample/C1\n", [intent]);
    const c2 = change("sample/C2", [c1]);
    const edited = change("sample/C3", [], {}, "as planned\n");
    const c4 = change("sample/C4", [c2, edited, c1]);
    const dupA = change("sample/C5", [], {}, "one\n");
    const dupB = change("sample/C5", [], {}, "other\n");
    const nodes = [...definitions, intent, c4, dupB, c2, change("sample/C3", [], {}, "as edited\n"), c1, dupA, change("sample/c6")];
    const data = assess(nodes).exchange();
    assert.equal(JSON.stringify(JSON.parse(JSON.stringify(data))), JSON.stringify(data), "it is plain JSON data");
    assert.deepEqual(Object.keys(data).sort(), ["changes", "findings"]);
    assert.deepEqual(data.changes.map((c) => c.identity), ["sample/C1", "sample/C2", "sample/C3", "sample/C4"], "walked Changes only, sorted");
    for (const c of data.changes) assert.deepEqual(Object.keys(c).sort(), ["delivers", "id", "identity", "requires", "succeeds"], "without evidence, no delivery members");
    assert.equal(data.changes[1].id, c2.id, "each carries its content id");
    assert.deepEqual(data.changes[0].delivers, ["sample/I1"], "the Intents it delivers");
    assert.deepEqual(data.changes[0].requires, ["sample/T1", "sample/T2"], "its required Cases, sorted");
    assert.deepEqual(data.changes[1].succeeds, ["sample/C1"]);
    assert.deepEqual(data.changes[3].succeeds, ["sample/C1", "sample/C2"], "resolved direct predecessors only, sorted: the stale pin is not one");
    const kinds = data.findings.map((f) => f.kind);
    for (const k of ["stale", "duplicate", "malformed"]) assert.ok(kinds.includes(k), `a ${k} finding is typed`);
    assert.ok(!kinds.includes("no-tests"), "without evidence, a Change without required Cases is no finding");
    assert.deepEqual(kinds, [...kinds].sort(), "findings are sorted by kind");
    assert.equal(JSON.stringify(assess([...nodes].reverse()).exchange()), JSON.stringify(data), "byte-identical in any order");
    const evidence = [{ case: "sample/T2", result: "passed" }, { case: "sample/T1", result: "passed" }];
    const given = assess(nodes, { evidence }).exchange();
    for (const c of given.changes) assert.deepEqual(Object.keys(c).sort(), ["awaiting", "delivered", "delivers", "id", "identity", "requires", "satisfied", "succeeds", "unmet"], "with evidence, the delivery members");
    assert.ok(given.findings.some((f) => f.kind === "no-tests" && f.change === "sample/C2"), "with evidence, a Change without required Cases is a no-tests finding");
    assert.equal(JSON.stringify(assess([...nodes].reverse(), { evidence: [...evidence].reverse() }).exchange()), JSON.stringify(given), "byte-identical in any order of evidence too");
  });

  it("change/T20 [change/I9, change/N2, change/F14]: a Change states the Intents it delivers, and an unresolved or stale Intent is a finding", async () => {
    const { assess, definitions, change } = await fixture();
    const i1 = intentNode("sample/I1");
    const i2 = intentNode("sample/I2");
    const c1 = change("sample/C1", [], {}, "# sample/C1\n", [i2, i1]);
    const r = assess([...definitions, i1, i2, c1]);
    assert.deepEqual(r.delivers("sample/C1"), ["sample/I1", "sample/I2"], "its Intents, sorted");
    assert.equal(i1.frontmatter.edges, undefined, "nothing was written into the Intent");
    const absent = intentNode("sample/I3");
    const edited = intentNode("sample/I1", "as edited\n");
    const c2 = change("sample/C2", [], {}, "# sample/C2\n", [i1, absent]);
    const s = assess([...definitions, edited, c2]);
    assert.ok(naming(s.findings, "sample/C2", "sample/I3", "unresolved").length > 0, "an Intent that is not present is unresolved");
    assert.ok(naming(s.findings, "sample/C2", "sample/I1", i1.id, "stale").length > 0, "an Intent edited after it was pinned is stale");
    assert.deepEqual(s.delivers("sample/C2"), [], "neither is listed");
  });

  it("change/T21 [change/I10, change/F15, change/F16, change/A10]: a Change is satisfied only when Testing's evidence reads every required Case `passed`, and anything else is unmet under Testing's word", async () => {
    const { assess, definitions, change } = await fixture();
    const c1 = change("sample/C1", [], { requires: ["sample/T1", "sample/T2"] });
    const nodes = [...definitions, c1];
    assert.equal(assess(nodes).delivery("sample/C1"), undefined, "without evidence there is no delivery result");
    const green = assess(nodes, { evidence: [{ case: "sample/T1", result: "passed" }, { case: "sample/T2", result: "passed" }, { case: "other/T9", result: "failed" }] });
    assert.equal(green.delivery("sample/C1").satisfied, true, "every required Case passed; a Case not required is not counted");
    assert.deepEqual(green.delivery("sample/C1").unmet, []);
    for (const word of ["failed", "unknown", "inapplicable", "skip", "todo", "blocked", "GREEN", "pass"]) {
      const r = assess(nodes, { evidence: [{ case: "sample/T1", result: "passed" }, { case: "sample/T2", result: word }] });
      assert.equal(r.delivery("sample/C1").satisfied, false, `${word} is not passed`);
      assert.deepEqual(r.delivery("sample/C1").unmet, [{ case: "sample/T2", result: word }], `${word} passes through as Testing said it`);
    }
    const notRun = assess(nodes, { evidence: [{ case: "sample/T2", result: "passed" }] });
    assert.deepEqual(notRun.delivery("sample/C1").unmet, [{ case: "sample/T1", result: "absent" }], "a Case with no result given is unmet as absent");
    const conflicting = assess(nodes, { evidence: [{ case: "sample/T1", result: "passed" }, { case: "sample/T2", result: "passed" }, { case: "sample/T2", result: "failed" }] });
    assert.equal(conflicting.delivery("sample/C1").satisfied, false, "a Case is met only when every entry for it is passed");
    for (const requires of [undefined, []]) {
      const none = change("sample/C2", [], requires ? { requires } : {});
      const r = assess([...definitions, none], { evidence: [] });
      assert.ok(naming(r.findings, "sample/C2", "no-tests").length > 0, "no required Cases is a finding");
      assert.equal(r.delivery("sample/C2").satisfied, false, "and never satisfied: no zero-test GREEN");
      assert.equal(r.delivery("sample/C2").delivered, false);
    }
    for (const entry of ["", 7]) {
      const bad = change("sample/C3", [], { requires: ["sample/T1", entry] });
      const b = assess([...definitions, bad], { evidence: [{ case: "sample/T1", result: "passed" }, { case: entry, result: "passed" }] });
      assert.ok(naming(b.findings, "sample/C3", "malformed-test").length > 0, `${JSON.stringify(entry)} is not a Case identity`);
      assert.equal(b.delivery("sample/C3").satisfied, false, "and the Change is not satisfied");
    }
    const repeated = change("sample/C4", [], { requires: ["sample/T1", "sample/T1"] });
    const rr = assess([...definitions, repeated], { evidence: [{ case: "sample/T1", result: "passed" }] });
    assert.ok(naming(rr.findings, "sample/C4", "sample/T1", "malformed-test").length > 0, "a repeated entry is a finding");
    assert.equal(rr.delivery("sample/C4").satisfied, false);
  });

  it("change/T22 [change/I2, change/I10, change/F17, change/A10]: a satisfied Change is delivered only when every Change it succeeds is delivered, and no Case about main is implied", async () => {
    const { assess, definitions, change } = await fixture();
    const PASSED = (...cases) => cases.map((c) => ({ case: c, result: "passed" }));
    const a = change("sample/C1", [], { requires: ["sample/T1"] });
    const b = change("sample/C2", [a], { requires: ["sample/T2"] });
    const c = change("sample/C3", [b], { requires: ["sample/T3"] });
    const nodes = [...definitions, a, b, c];
    const all = assess(nodes, { evidence: PASSED("sample/T1", "sample/T2", "sample/T3") });
    for (const id of ["sample/C1", "sample/C2", "sample/C3"]) assert.equal(all.delivery(id).delivered, true, `${id} is delivered`);
    assert.deepEqual(all.delivery("sample/C3").awaiting, []);
    const held = assess(nodes, { evidence: PASSED("sample/T2", "sample/T3") });
    assert.equal(held.delivery("sample/C1").delivered, false, "a Change whose own Test is unmet is not delivered");
    assert.deepEqual(held.delivery("sample/C2"), { satisfied: true, delivered: false, unmet: [], awaiting: ["sample/C1"] }, "own Tests satisfied is not delivered while a predecessor is not");
    assert.deepEqual(held.delivery("sample/C3").awaiting, ["sample/C2"], "and delivery waits down the chain");
    assert.equal(held.delivery("sample/C3").satisfied, true);
    assert.equal(held.delivery("sample/C3").delivered, false);
    const before = change("sample/C4", [], { requires: ["sample/T4"] }, "as planned\n");
    const after = change("sample/C4", [], { requires: ["sample/T4"] }, "as edited\n");
    const d = change("sample/C5", [before], { requires: ["sample/T5"] });
    const stale = assess([...definitions, after, d], { evidence: PASSED("sample/T4", "sample/T5") });
    assert.equal(stale.delivery("sample/C4").delivered, true);
    assert.deepEqual(stale.delivery("sample/C5").awaiting, ["sample/C4"], "a stale predecessor holds its successor");
    assert.equal(stale.delivery("sample/C5").delivered, false);
    const ID = { A: "a".repeat(64), B: "b".repeat(64) };
    const forged = (name, id, dep) => Object.freeze({ ...change(name, [dep], { requires: ["sample/T1"] }), id });
    const x = forged("sample/C6", ID.A, { name: "sample/C7", id: ID.B });
    const y = forged("sample/C7", ID.B, { name: "sample/C6", id: ID.A });
    const cyc = assess([...definitions, x, y], { evidence: PASSED("sample/T1") });
    assert.equal(cyc.delivery("sample/C6").delivered, false, "no Change on a cycle is delivered");
    assert.equal(cyc.delivery("sample/C7").delivered, false);
    const merged = assess([...definitions, change("sample/C8", [], { requires: ["sample/T8"] })], { evidence: PASSED("sample/T8") });
    assert.equal(merged.delivery("sample/C8").delivered, true, "delivered on its required Cases alone, with no rule about main");
    const onMain = change("sample/C9", [], { requires: ["sample/T8", "engineering/T1"] });
    const notYet = assess([...definitions, onMain], { evidence: PASSED("sample/T8") });
    assert.deepEqual(notYet.delivery("sample/C9").unmet, [{ case: "engineering/T1", result: "absent" }], "a Change that requires an is-on-main Case is not delivered until it passed");
  });

  it("change/T23 [change/N5, change/I4]: a Change Node present on disk but not given is absent, and nothing in the result claims registration, admission or KAAL verification", async () => {
    const { assess, definitions, CHANGE, change } = await fixture();
    const bytes = createNode({ name: "sample/C1", type: CHANGE, frontmatter: { requires: ["sample/T1"] }, body: "# sample/C1\n" }).bytes;
    const present = identify(bytes);
    const dir = mkdtempSync(join(tmpdir(), "kaal-change-presence-"));
    const cwd = process.cwd();
    try {
      writeFileSync(join(dir, "sample-C1.md"), bytes);
      process.chdir(dir);
      const r = assess(definitions, { evidence: [{ case: "sample/T1", result: "passed" }] });
      assert.equal(r.has("sample/C1"), false, "presence on disk is not registration: a Change not given is absent");
      assert.deepEqual(r.exchange().changes, [], "and is not in the exchange");
      assert.deepEqual(r.findings, [], "nor does it raise a finding");
    } finally {
      process.chdir(cwd);
      rmSync(dir, { recursive: true, force: true });
    }
    const pred = change("sample/C2", [], { requires: ["sample/T2"] });
    const given = assess([...definitions, present, pred, change("sample/C3", [pred], { requires: ["sample/T3"] }, "# sample/C3\n", [])], {
      evidence: ["sample/T1", "sample/T2", "sample/T3"].map((c) => ({ case: c, result: "passed" })),
    });
    const claims = /regist|admi|verif|kaal-?verified/i;
    const walk = (v, path) => {
      if (Array.isArray(v)) return v.forEach((x, i) => walk(x, `${path}[${i}]`));
      if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) {
        assert.doesNotMatch(k, claims, `${path}.${k} claims registration, admission or verification`);
        walk(x, `${path}.${k}`);
      }
      else if (typeof v === "string") assert.doesNotMatch(v, claims, `${path} claims registration, admission or verification`);
    };
    walk(given.exchange(), "exchange()");
    walk(given.findings, "findings");
    for (const id of ["sample/C1", "sample/C2", "sample/C3"]) walk(given.delivery(id), `delivery(${id})`);
    assert.equal(given.delivery("sample/C3").delivered, true, "delivered is Change's verdict on the given evidence, and that is all it says");
  });
});
