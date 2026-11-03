// requirements/C11: the planned tests of Traceable Requirements, packages/skills/kaal-requirements/plan/traceability/testing.md.
// They are immutable to DO and CHECK. They run outside the package's `npm test` until requirements/C12 turns them GREEN.
// requirements/T16 and requirements/T17 use test/fixtures/Intent-Definition.md: a verbatim copy of `kaal/intent`'s
// packages/skills/kaal-intent/payload/Intent-Definition.md (kaal/intent at d1d08f7, #748), pinned by id below. The end-to-end link to
// Intent's own Definition is NOT proven until Intent reaches `main`: the copy must then be re-pinned (see testing.md).
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { bootstrap, catalog, foundation, readContribution, register, verify } from "kaal-core";
import { Graph, createNode, identify } from "kaal-graph";
import { execute } from "kaal-hosting";

const PACKAGE = fileURLToPath(new URL("../../", import.meta.url));
const CAPABILITY = join(PACKAGE, "capability");
const FIXTURE_INTENT_DEFINITION = fileURLToPath(new URL("../fixtures/Intent-Definition.md", import.meta.url));
// The id of Intent's Definition `Intent` as kaal/intent holds it at d1d08f7. Re-pin when Intent reaches main.
const PINNED_INTENT_DEFINITION_ID = "f86d4e30bf200b59da174c7fee0b73e61b2d87e209e34c1ce7938929d3b260ae";
const read = (file) => readFileSync(join(CAPABILITY, file), "utf8");
const pkg = () => JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
const serves = () => {
  const path = join(CAPABILITY, "Serves.md");
  assert.ok(existsSync(path), "blocked before behavioural assertion: capability/Serves.md does not exist");
  return path;
};
const packed = async () => {
  const r = await execute("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE });
  assert.equal(r.status, 0, r.stderr);
  return JSON.parse(r.stdout)[0].files.map((f) => f.path).sort();
};

describe("kaal-requirements: Traceable Requirements", () => {
  it("requirements/T15: Serves is a KAAL Definition that states its direction, Requirement to Intent, that it transfers no ownership, and that a trigger is not an Intent [requirements/F13]", () => {
    const text = readFileSync(serves(), "utf8");
    const node = identify(readFileSync(serves()));
    assert.equal(node.name, "Serves");
    assert.deepEqual(node.type, foundation().definition);
    assert.match(text, /Requirement Node to an Intent Node/);
    assert.match(text, /transfers no ownership/);
    assert.match(text, /trigger is not an Intent/);
  });

  it("requirements/T16: a fixture Requirement Node sample/F1, typed by Requirement, with a Serves Edge to a fixture Intent Node, is admitted beside Requirements' contribution; the Engine verifies, out() and in() show the Edge, and traverse() from the Intent in reaches the Requirement [requirements/F12, requirements/F13, requirements/I7]", async () => {
    const intentDefinition = identify(readFileSync(FIXTURE_INTENT_DEFINITION));
    assert.equal(intentDefinition.id, PINNED_INTENT_DEFINITION_ID, "the fixture is the pinned copy of Intent's Definition");
    assert.equal(intentDefinition.name, "Intent");
    const servesNode = identify(readFileSync(serves()));
    const requirementDefinition = identify(readFileSync(join(CAPABILITY, "Requirement.md")));
    const intent = createNode({ name: "sample/I1", type: { name: intentDefinition.name, id: intentDefinition.id }, body: "# sample/I1\n\nA fixture Intent.\n" }).node;
    const requirement = createNode({
      name: "sample/F1",
      type: { name: requirementDefinition.name, id: requirementDefinition.id },
      edges: [{ type: { name: servesNode.name, id: servesNode.id }, targets: [{ name: intent.name, id: intent.id }] }],
      body: "# sample/F1\n\nA fixture Requirement.\n",
    }).node;
    const graph = new Graph([requirementDefinition, servesNode, intentDefinition, intent, requirement]);
    assert.deepEqual(graph.check(), []);
    assert.deepEqual(graph.out(requirement.id).map((e) => e.target.id), [intent.id]);
    assert.deepEqual(graph.in(intent.id).map((e) => e.source.id), [requirement.id]);
    assert.deepEqual([...graph.traverse(intent.id, { direction: "in" })].map((s) => s.id).filter((id) => id !== intent.id), [requirement.id]);

    const engine = join(mkdtempSync(join(tmpdir(), "kaal-requirements-t16-")), "engine");
    await bootstrap(engine);
    await register(engine, "capability", "requirements", await readContribution(CAPABILITY));
    assert.equal((await verify(engine)).ok, true);
  });

  it("requirements/T17: after the fixture Intent changes, the same Edge is reported by check() as naming another id, the Engine still verifies, and the Requirement is unchanged [requirements/F14]", async () => {
    const intentDefinition = identify(readFileSync(FIXTURE_INTENT_DEFINITION));
    const servesNode = identify(readFileSync(serves()));
    const requirementDefinition = identify(readFileSync(join(CAPABILITY, "Requirement.md")));
    const typeRef = { name: intentDefinition.name, id: intentDefinition.id };
    const intent = createNode({ name: "sample/I1", type: typeRef, body: "# sample/I1\n\nA fixture Intent.\n" }).node;
    const requirement = createNode({
      name: "sample/F1",
      type: { name: requirementDefinition.name, id: requirementDefinition.id },
      edges: [{ type: { name: servesNode.name, id: servesNode.id }, targets: [{ name: intent.name, id: intent.id }] }],
      body: "# sample/F1\n\nA fixture Requirement.\n",
    }).node;
    const edited = createNode({ name: "sample/I1", type: typeRef, body: "# sample/I1\n\nA fixture Intent. Edited.\n" }).node;
    assert.notEqual(edited.id, intent.id);
    const drifted = new Graph([requirementDefinition, servesNode, intentDefinition, edited, requirement]);
    assert.notDeepEqual(drifted.check().filter((p) => p.includes("sample/I1")), [], "check() reports the Edge naming the earlier id");
    assert.equal(requirement.id, createNode({ name: "sample/F1", type: { name: requirementDefinition.name, id: requirementDefinition.id }, edges: [{ type: { name: servesNode.name, id: servesNode.id }, targets: [{ name: intent.name, id: intent.id }] }], body: "# sample/F1\n\nA fixture Requirement.\n" }).node.id, "the Requirement is unchanged");

    const engine = join(mkdtempSync(join(tmpdir(), "kaal-requirements-t17-")), "engine");
    await bootstrap(engine);
    await register(engine, "capability", "requirements", await readContribution(CAPABILITY));
    assert.equal((await verify(engine)).ok, true);
  });

  it("requirements/T18: a capability whose Requirements are still bracket citations is admitted beside Requirements' contribution, the Engine verifies, Serves is present, and no Serves Edge is reported for it [requirements/F15, requirements/N6]", async () => {
    const engine = join(mkdtempSync(join(tmpdir(), "kaal-requirements-trace-")), "engine");
    await bootstrap(engine);
    await register(engine, "capability", "requirements", await readContribution(CAPABILITY));
    const sample = createNode({
      name: "Sample",
      type: foundation().capability,
      body: "Sample states its Requirements as bracket citations, such as `**sample/F1** [sample/I1]`, and no Edge.\n",
    });
    const dir = join(mkdtempSync(join(tmpdir(), "kaal-requirements-sample-")), "sample");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "Sample.md"), sample.bytes);
    await register(engine, "capability", "sample", await readContribution(dir));
    assert.equal((await verify(engine)).ok, true);
    assert.ok(existsSync(join(engine, "capabilities", "requirements", "Serves.md")), "blocked before behavioural assertion: Serves is not admitted with the contribution");
    const servesNode = identify(readFileSync(join(engine, "capabilities", "requirements", "Serves.md")));
    const graph = new Graph([identify(sample.bytes), servesNode]);
    assert.deepEqual(graph.edges({ name: "Serves", id: servesNode.id }), []);
    assert.deepEqual(graph.check(), []);
    assert.equal((await catalog(engine)).capabilities.some((c) => c.name === "Sample"), true);
  });

  it("requirements/T19: the Definition Requirement states the identification rule and Serves, and the Capability Node names Serves among what it provides [requirements/F12, requirements/F16]", () => {
    const definition = read("Requirement.md");
    assert.match(definition, /`<capability>\/F<n>`/);
    assert.match(definition, /`<capability>\/N<n>`/);
    assert.match(definition, /states the Intents it serves as `Serves` Edges, where they are represented, and none where none is\./);
    assert.match(read("Requirements.md"), /It provides the Requirement Definition and the `Serves` Definition\./);
  });

  it("requirements/T20: nothing the package ships imports a module, and it has no dependencies [requirements/N5]", async () => {
    assert.equal(pkg().dependencies, undefined);
    for (const path of await packed()) assert.doesNotMatch(path, /\.(c|m)?[jt]sx?$/, `${path} is not a module`);
  });
});
