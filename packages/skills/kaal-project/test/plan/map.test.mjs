// project/C2 planned outer tests: the Project map.
// Immutable to DO and CHECK; the DO Change turns them GREEN. Each title names
// the contracts it checks (plan/map/*.md). They use kaal-project's public
// interface only, and give Project Plans and Change's map as plain data.
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

const changeNode = (id) => ({ id, kind: "change", owner: "Change", resolved: true });
const DEPENDENCY = Object.freeze({ from: "sample/C2", to: "sample/C1", kind: "dependency", owner: "Change", source: "sample/C2" });
const LIFECYCLE = Object.freeze({ from: "sample/C1", to: "Accepted", kind: "lifecycle", owner: "Change", source: "sample/C1" });

/** Change's map, as data in the shared output contract. */
const changes = (ids = ["sample/C1", "sample/C2", "sample/C3"]) => ({
  nodes: ids.map(changeNode),
  relations: [{ ...DEPENDENCY }, { ...LIFECYCLE }],
  findings: [],
});

const project = (from, to, kind) => ({ from, to, kind, owner: "Project", source: "sample/P1" });

/** The findings whose text names every given word. */
const naming = (findings, ...words) => findings.filter((f) => words.every((w) => JSON.stringify(f).includes(w)));

describe("the Project map (project/C2)", () => {
  it("project/T1 [project/I1, project/I3, project/F3]: alone, a Plan maps to its Project, governs, grouping and sequencing, all owned by Project, with every Change unresolved and no dependency", async () => {
    const { map } = await projectMap();
    assert.deepEqual(map([plan()]), {
      nodes: [
        { id: "sample/C1", kind: "change", owner: "Change", resolved: false },
        { id: "sample/C2", kind: "change", owner: "Change", resolved: false },
        { id: "sample/C3", kind: "change", owner: "Change", resolved: false },
        { id: "sample/P1", kind: "project", owner: "Project", resolved: true },
      ],
      relations: [
        project("sample/C1", "sample/C2", "grouping"),
        project("sample/C2", "sample/C1", "grouping"),
        project("sample/C3", "sample/C1", "sequencing"),
        project("sample/P1", "sample/C1", "governs"),
        project("sample/P1", "sample/C2", "governs"),
        project("sample/P1", "sample/C3", "governs"),
      ],
      findings: [],
    });
  });

  it("project/T2 [project/I2, project/I4, project/F3]: with Change's map, dependency and lifecycle relations are Change's, copied unchanged, and the governed Changes are resolved", async () => {
    const { map } = await projectMap();
    const out = map([plan()], { changes: changes() });
    assert.deepEqual(out.findings, []);
    assert.ok(out.nodes.filter((n) => n.kind === "change").every((n) => n.resolved), "every governed Change is resolved");
    assert.deepEqual(out.relations.filter((r) => r.owner === "Change"), [LIFECYCLE, DEPENDENCY], "sorted by from, to, kind and owner");
    assert.deepEqual(out.relations.filter((r) => r.kind === "dependency" && r.owner !== "Change"), [], "no dependency of Project's own");
  });

  it("project/T3 [project/I2, project/F1, project/F3]: sequencing is never dependency, and a Plan that states a dependency is a finding", async () => {
    const { map } = await projectMap();
    for (const out of [map([plan()]), map([plan()], { changes: { ...changes(), relations: [] } })]) {
      assert.deepEqual(out.relations.filter((r) => r.kind === "dependency"), [], "sequencing gives no dependency");
      assert.equal(out.relations.filter((r) => r.kind === "sequencing").length, 1);
    }
    for (const member of ["dependsOn", "dependencies"]) {
      const out = map([plan({ [member]: [{ from: "sample/C2", to: "sample/C1" }] })]);
      assert.equal(naming(out.findings, member).length, 1, `a Plan stating ${member} is a finding naming it`);
      assert.deepEqual(out.relations.filter((r) => r.kind === "dependency"), [], `${member} gives no relation`);
    }
  });

  it("project/T4 [project/N1, project/I5]: the same input gives byte-identical output in any input order, and the input is unchanged", async () => {
    const { map } = await projectMap();
    const plans = [plan(), plan({ project: "sample/P2", changes: ["sample/C4"], grouping: [], sequencing: [] })];
    const given = { changes: changes() };
    const before = structuredClone({ plans, given });
    const first = JSON.stringify(map(plans, given));
    assert.equal(JSON.stringify(map(plans, given)), first, "repeated");
    const permuted = [
      { ...plans[0], changes: [...plans[0].changes].reverse() },
      plans[1],
    ].reverse();
    const shuffled = { changes: { ...given.changes, nodes: [...given.changes.nodes].reverse(), relations: [...given.changes.relations].reverse() } };
    assert.equal(JSON.stringify(map(permuted, shuffled)), first, "any input order");
    assert.deepEqual({ plans, given }, before, "input unchanged");
  });

  it("project/T5 [project/I3, project/F1, project/F3]: a governed Change missing from Change's map is unresolved and reported, and a malformed Plan member is a finding naming it", async () => {
    const { map } = await projectMap();
    const out = map([plan()], { changes: changes(["sample/C1", "sample/C2"]) });
    assert.deepEqual(out.nodes.find((n) => n.id === "sample/C3"), { id: "sample/C3", kind: "change", owner: "Change", resolved: false });
    assert.equal(naming(out.findings, "sample/C3").length, 1, "the missing Change is reported");
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
        "    - depends on sample/C1 (Change)",
        "    - grouped with sample/C1 (Project)",
        "  - sample/C3",
        "    - before sample/C1 (Project)",
        "  - sample/C1",
        "    - grouped with sample/C2 (Project)",
        "    - is Accepted (Change)",
        "",
      ].join("\n"),
    );
    assert.equal(
      render(map([plan()], { changes: changes(["sample/C1", "sample/C2"]) })).split("\n").find((l) => l.includes("sample/C3")),
      "  - sample/C3 (unresolved)",
    );
  });

  it("project/T7 [project/I2, project/I4]: removing Change's map removes every dependency relation and nothing Project owns", async () => {
    const { map } = await projectMap();
    const composed = map([plan()], { changes: changes() });
    const alone = map([plan()]);
    assert.deepEqual(composed.relations.filter((r) => r.owner === "Project"), alone.relations);
    assert.deepEqual(alone.relations.filter((r) => r.owner !== "Project"), []);
  });
});
