// project/C2 planned outer tests: the Project map.
// Immutable to DO and CHECK; the DO Change turns them GREEN. Each title names
// the contracts it checks (plan/map/*.md). They use kaal-project's public
// interface only, and give Project Plans and Change's exchange as plain data.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

/** kaal-project/map, or the reason the tests are blocked before any behavioural assertion. */
async function projectMap() {
  let mod;
  try {
    mod = await import("kaal-project/map");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-project exports no ./map (${e.code ?? e.message})`);
  }
  for (const name of ["map", "render"]) {
    assert.equal(typeof mod[name], "function", `blocked before behavioural assertion: kaal-project/map exports no ${name}`);
  }
  return mod;
}

/** A Project governing three Changes: sample/C1 and sample/C2 land together, sample/C3 goes before sample/C1. */
const plan = (over = {}) => ({
  project: "sample/P1",
  outcome: "sample/O1",
  warrant: "integration risk across two capabilities",
  changes: ["sample/C2", "sample/C1", "sample/C3"],
  grouping: [["sample/C1", "sample/C2"]],
  sequencing: [{ before: "sample/C3", after: "sample/C1" }],
  ...over,
});

/** A stand-in content id for a Change identity. */
const ID = (identity) => identity.at(-1).repeat(64);

/** Change's exchange, as a consumer passes it, plain data (change/F13, #530). sample/C2 succeeds sample/C1. Members this map does not consume ride along. */
const changes = (ids = ["sample/C1", "sample/C2", "sample/C3"], deps = { "sample/C2": ["sample/C1"] }, findings = []) => ({
  changes: ids.map((identity) => ({ identity, id: ID(identity), succeeds: [...(deps[identity] ?? [])], delivers: [], requires: [] })),
  findings,
});

const PROJECT = (name) => ({ name, owner: "Project" });
const SUCCEEDS = Object.freeze({ from: "sample/C2", to: "sample/C1", relation: { name: "Succeeds", owner: "Change" }, source: ID("sample/C2") });
const project = (from, to, name) => ({ from, to, relation: PROJECT(name), source: "sample/P1" });

/** The findings whose text names every given word. */
const naming = (findings, ...words) => findings.filter((f) => words.every((w) => JSON.stringify(f).includes(w)));

describe("the Project map (project/C2)", () => {
  it("project/T1 [project/I1, project/I3, project/F2, project/F3]: alone, a Plan maps to its Project and Project's own relations, governs, grouped with and before, with every Change unresolved and nothing owned by Change", async () => {
    const { map } = await projectMap();
    assert.deepEqual(map([plan()]), {
      nodes: [
        { identity: "sample/C1", kind: "change", owner: "Change", resolved: false },
        { identity: "sample/C2", kind: "change", owner: "Change", resolved: false },
        { identity: "sample/C3", kind: "change", owner: "Change", resolved: false },
        { identity: "sample/P1", kind: "project", owner: "Project", resolved: true },
      ],
      relations: [
        project("sample/C1", "sample/C2", "grouped with"),
        project("sample/C2", "sample/C1", "grouped with"),
        project("sample/C3", "sample/C1", "before"),
        project("sample/P1", "sample/C1", "governs"),
        project("sample/P1", "sample/C2", "governs"),
        project("sample/P1", "sample/C3", "governs"),
      ],
      findings: [],
    });
  });

  it("project/T2 [project/I2, project/I4, project/F2, project/F3]: with Change's exchange, Succeeds is Change's, qualified and sourced to the succeeding Change's content id, and the governed Changes are resolved with their id", async () => {
    const { map } = await projectMap();
    const out = map([plan()], { changes: changes() });
    assert.deepEqual(out.findings, []);
    assert.deepEqual(
      out.nodes.filter((n) => n.kind === "change"),
      ["sample/C1", "sample/C2", "sample/C3"].map((identity) => ({ identity, kind: "change", owner: "Change", resolved: true, id: ID(identity) })),
    );
    assert.deepEqual(out.relations.filter((r) => r.relation.owner === "Change"), [SUCCEEDS]);
  });

  it("project/T3 [project/I2, project/F1, project/F2, project/F3]: Project's before is never Succeeds, Project owns only its three relation names, and a Plan that states a relation between Changes that is Change's is a finding", async () => {
    const { map } = await projectMap();
    for (const out of [map([plan()]), map([plan()], { changes: changes(undefined, {}) })]) {
      assert.deepEqual(out.relations.filter((r) => r.relation.owner !== "Project"), [], "before gives no relation of Change's");
      assert.deepEqual([...new Set(out.relations.map((r) => r.relation.name))].sort(), ["before", "governs", "grouped with"]);
    }
    for (const member of ["succeeds", "dependsOn", "dependencies"]) {
      const out = map([plan({ [member]: [{ from: "sample/C2", to: "sample/C1" }] })]);
      assert.equal(naming(out.findings, member).length, 1, `a Plan stating ${member} is a finding naming it`);
      assert.deepEqual(out.relations.filter((r) => r.relation.owner !== "Project" || !["governs", "grouped with", "before"].includes(r.relation.name)), [], `${member} gives no relation`);
    }
  });

  it("project/T4 [project/N1, project/I5]: the same input gives byte-identical output in any input order, and the input is unchanged", async () => {
    const { map } = await projectMap();
    const plans = [plan(), plan({ project: "sample/P2", changes: ["sample/C4"], grouping: [], sequencing: [] })];
    const given = { changes: changes() };
    const before = structuredClone(plans);
    const first = JSON.stringify(map(plans, given));
    assert.equal(JSON.stringify(map(plans, given)), first, "repeated");
    const permuted = [
      { ...plans[0], changes: [...plans[0].changes].reverse() },
      plans[1],
    ].reverse();
    const exchange = changes();
    const shuffled = { changes: { changes: [...exchange.changes].reverse(), findings: exchange.findings } };
    assert.equal(JSON.stringify(map(permuted, shuffled)), first, "any input order");
    assert.deepEqual(plans, before, "input unchanged");
  });

  it("project/T5 [project/I3, project/F1, project/F2, project/F3]: a governed Change Change's exchange does not list is unresolved and reported, Change's findings pass through as Change's, and a malformed Plan member is a finding naming it", async () => {
    const { map } = await projectMap();
    const stale = { kind: "stale", change: "sample/C3", predecessor: "sample/C1" };
    const elsewhere = { kind: "unresolved", change: "other/C7", predecessor: "other/C8" };
    const out = map([plan()], { changes: changes(["sample/C1", "sample/C2"], undefined, [stale, elsewhere]) });
    assert.deepEqual(out.nodes.find((n) => n.identity === "sample/C3"), { identity: "sample/C3", kind: "change", owner: "Change", resolved: false });
    assert.equal(naming(out.findings, "Project", "sample/C3").length, 1, "the missing Change is reported by Project");
    assert.deepEqual(out.findings.filter((f) => f.owner === "Change"), [{ owner: "Change", ...stale }], "Change's finding on a governed Change passes through unflattened");
    const broken = [
      [plan({ project: undefined }), "project"],
      [plan({ grouping: [["sample/C1"]] }), "grouping"],
      [plan({ sequencing: [{ before: "sample/C9", after: "sample/C1" }] }), "sample/C9"],
      [plan({ grouping: [["sample/C1", "sample/C8"]] }), "sample/C8"],
    ];
    for (const [p, word] of broken) {
      assert.ok(naming(map([p]).findings, word).length >= 1, `a finding naming ${word}`);
    }
  });

  it("project/T6 [project/F4, project/I5]: the Markdown tree renders a small composed map exactly", async () => {
    const { map, render } = await projectMap();
    assert.equal(
      render(map([plan()], { changes: changes() })),
      [
        "- sample/P1",
        "  - sample/C2",
        "    - Succeeds sample/C1 (Change)",
        "    - grouped with sample/C1 (Project)",
        "  - sample/C3",
        "    - before sample/C1 (Project)",
        "  - sample/C1",
        "    - grouped with sample/C2 (Project)",
        "",
      ].join("\n"),
    );
    assert.equal(
      render(map([plan()], { changes: changes(["sample/C1", "sample/C2"]) })).split("\n").find((l) => l.includes("sample/C3")),
      "  - sample/C3 (unresolved)",
    );
  });

  it("project/T7 [project/I2, project/I4]: removing Change's exchange removes every relation and finding Change owns and nothing Project owns", async () => {
    const { map } = await projectMap();
    const composed = map([plan()], { changes: changes(undefined, undefined, [{ kind: "stale", change: "sample/C2", predecessor: "sample/C1" }]) });
    const alone = map([plan()]);
    assert.deepEqual(composed.relations.filter((r) => r.relation.owner === "Project"), alone.relations);
    assert.deepEqual(alone.relations.filter((r) => r.relation.owner !== "Project"), []);
    assert.deepEqual(composed.findings.filter((f) => f.owner === "Project"), alone.findings);
    assert.deepEqual(alone.findings.filter((f) => f.owner !== "Project"), []);
  });
  it("project/T8 [project/I3, project/F3]: a missing Change complement stays honestly unresolved: with no exchange, with an exchange that lists no Changes, and with Change's cannot-assess finding alone, every governed Change is unresolved and named, no Succeeds appears, and Change's finding passes through unchanged", async () => {
    const { map } = await projectMap();
    const governed = ["sample/C1", "sample/C2", "sample/C3"];
    const unresolved = (out) => governed.every((c) => out.nodes.find((n) => n.identity === c)?.resolved === false);
    const alone = map([plan()]);
    assert.ok(unresolved(alone), "no exchange: every governed Change is unresolved");
    assert.deepEqual(alone.findings.filter((f) => f.owner === "Change"), []);
    const cannot = { kind: "cannot-assess", peer: "@kaihacksai/kaal-graph", next: [{ action: "install", peer: "@kaihacksai/kaal-graph" }, { action: "analyze" }] };
    for (const [label, exchange] of [["an empty exchange", { changes: [], findings: [] }], ["cannot-assess alone", { findings: [cannot] }]]) {
      const out = map([plan()], { changes: exchange });
      assert.ok(unresolved(out), `${label}: every governed Change is unresolved`);
      for (const c of governed) assert.equal(naming(out.findings, "Project", c).length, 1, `${label}: Project names ${c}`);
      assert.deepEqual(out.relations.filter((r) => r.relation.owner !== "Project"), [], `${label}: no Succeeds`);
      assert.ok(out.nodes.every((n) => !("id" in n)), `${label}: no content id is invented`);
    }
    const out = map([plan()], { changes: { findings: [cannot] } });
    assert.deepEqual(out.findings.filter((f) => f.owner === "Change"), [{ owner: "Change", ...cannot }], "cannot-assess passes through unchanged");
    assert.doesNotMatch(JSON.stringify(out), /"(?:delivered|satisfied)"/, "nothing reads as delivered or satisfied");
  });

  it("project/T9 [project/I2, project/I4, project/F3]: Project's coordination order never becomes a Change prerequisite: a before gives no Succeeds, a Succeeds gives no before, and where both hold between the same Changes, both appear, each under its owner", async () => {
    const { map, render } = await projectMap();
    const before = map([plan()], { changes: changes(undefined, {}) });
    assert.deepEqual(before.relations.filter((r) => r.relation.name === "before"), [project("sample/C3", "sample/C1", "before")]);
    assert.deepEqual(before.relations.filter((r) => r.relation.owner === "Change"), [], "a before gives no Succeeds");
    const succeeds = map([plan({ sequencing: [] })], { changes: changes() });
    assert.deepEqual(succeeds.relations.filter((r) => r.relation.owner === "Change"), [SUCCEEDS]);
    assert.deepEqual(succeeds.relations.filter((r) => r.relation.name === "before"), [], "a Succeeds gives no before");
    const both = map([plan({ sequencing: [{ before: "sample/C1", after: "sample/C2" }] })], { changes: changes() });
    assert.deepEqual(
      both.relations.filter((r) => r.from === "sample/C1" || r.relation.owner === "Change").filter((r) => ["before", "Succeeds"].includes(r.relation.name)),
      [project("sample/C1", "sample/C2", "before"), SUCCEEDS],
      "both hold, each under its owner, neither merged nor derived",
    );
    const tree = render(both);
    assert.match(tree, /^ {4}- before sample\/C2 \(Project\)$/m);
    assert.match(tree, /^ {4}- Succeeds sample\/C1 \(Change\)$/m);
  });
});
