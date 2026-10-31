import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { bootstrap, catalog, evaluate, foundation, readContribution, register, verify } from "kaal-core";
import { Graph, createNode, identify } from "kaal-graph";
import { checkSkill } from "kaal-engineer-skill";
import { read } from "kaal-hosting";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILL = join(PACKAGE, "skills", "kaal-intent");

/** The fenced blocks of a Markdown file, in order. */
function fences(text) {
  return [...text.matchAll(/^```\n([\s\S]*?)^```$/gm)].map((m) => m[1]);
}

describe("the Skill Node", () => {
  const bytes = readFileSync(join(PACKAGE, "payload", "Intent.md"));

  it("is typed by Core's KAAL Skill", () => {
    const node = identify(bytes);
    assert.equal(node.name, "Intent");
    assert.deepEqual(node.type, foundation().skill);
  });

  it("is admitted as a Skill by Core alone", async () => {
    const engine = join(mkdtempSync(join(tmpdir(), "kaal-intent-")), "engine");
    await bootstrap(engine);
    const r = await register(engine, "skill", "kaal-intent", await readContribution(join(PACKAGE, "payload")));
    assert.deepEqual(r.ids, [identify(bytes).id]);
    assert.deepEqual((await catalog(engine)).skills, [{ name: "Intent", id: identify(bytes).id }]);
    assert.equal((await verify(engine)).ok, true);
  });
});

describe("the Intent Definition Node", () => {
  it("is typed by Core's KAAL Definition and distinct from the Skill Node", () => {
    const definition = identify(readFileSync(join(PACKAGE, "payload", "Intent-Definition.md")));
    assert.equal(definition.name, "Intent");
    assert.deepEqual(definition.type, foundation().definition);
    assert.notEqual(definition.id, identify(readFileSync(join(PACKAGE, "payload", "Intent.md"))).id);
  });
});

describe("the IDEA Definition Node", () => {
  it("is typed by Core's KAAL Definition", () => {
    const node = identify(readFileSync(join(PACKAGE, "payload", "IDEA.md")));
    assert.equal(node.name, "IDEA");
    assert.deepEqual(node.type, foundation().definition);
  });
});

describe("the I WON Definition Node", () => {
  it("is typed by Core's KAAL Definition", () => {
    const node = identify(readFileSync(join(PACKAGE, "payload", "I-WON.md")));
    assert.equal(node.name, "I WON");
    assert.deepEqual(node.type, foundation().definition);
  });
});

describe("the Agent Skill", () => {
  it("conforms to the Agent Skills standard and KAAL's rules", async () => {
    assert.deepEqual(checkSkill("kaal-intent", await read(SKILL)), { standard: [], kaal: [], warnings: [] });
  });
});

describe("the Intent form", () => {
  const reference = readFileSync(join(SKILL, "references", "intent.md"), "utf8");
  const [form, example] = fences(reference);
  const definition = identify(readFileSync(join(PACKAGE, "payload", "Intent-Definition.md")));

  it("types every Intent by the Intent Definition, by its name and exact id", () => {
    for (const text of [form.replace("<what is wanted, in a few words>", "placeholder"), example]) {
      assert.deepEqual(identify(Buffer.from(text)).type, { name: definition.name, id: definition.id });
    }
  });

  it("carries only a name and its type, then what is wanted and why", () => {
    assert.deepEqual(Object.keys(identify(Buffer.from(example)).frontmatter), ["name", "type"]);
    assert.match(example, /^---\nname: [^\n]+\ntype:\n  name: Intent\n  id: [0-9a-f]{64}\n---\n\n# Intent capture\n\n[^\n#]+\n\n## Why\n\n[^\n#]+\n$/);
  });

  it("resolves in Graph to the Intent Definition, with nothing unresolved", () => {
    const intent = identify(Buffer.from(example));
    const graph = new Graph([definition, intent]);
    assert.equal(graph.resolve(intent.type), definition);
    assert.deepEqual(graph.typed(intent.type), [{ name: intent.name, id: intent.id }]);
    assert.deepEqual(graph.check(), []);
  });

  it("is admitted by Core once its type is registered, and not before", async () => {
    const engine = join(mkdtempSync(join(tmpdir(), "kaal-intent-")), "engine");
    await bootstrap(engine);
    const intent = identify(Buffer.from(example));
    const withIntent = async () => evaluate({ ...(await read(engine)), "intents/intent-capture.md": Buffer.from(example) });
    const before = await withIntent();
    assert.equal(before.nodes.some((n) => n.id === intent.id), false);
    assert.deepEqual(before.rejected.map((r) => r.path), ["intents/intent-capture.md"]);
    await register(engine, "skill", "kaal-intent", await readContribution(join(PACKAGE, "payload")));
    const after = await withIntent();
    assert.equal(after.nodes.some((n) => n.id === intent.id), true);
    assert.deepEqual(after.rejected, []);
  });
});

// intent/C2: Intent elements as Nodes (plan/traces, intent/F1–F6).
describe("an Intent element of a capability", () => {
  const reference = readFileSync(join(SKILL, "references", "intent.md"), "utf8");
  const definition = identify(readFileSync(join(PACKAGE, "payload", "Intent-Definition.md")));
  const element = fences(reference)[2] ?? "";
  const rule = new RegExp(reference.match(/The name matches `(\^[^`]+\$)`/)?.[1] ?? "$^");

  it("intent/T1: is identified by Graph, named <capability>/I<n> and typed by the Intent Definition", () => {
    const node = identify(Buffer.from(element));
    assert.match(node.name, rule);
    assert.deepEqual(node.type, { name: definition.name, id: definition.id });
    assert.deepEqual(Object.keys(node.frontmatter), ["name", "type"]);
  });

  it("intent/T2: the identification rule accepts <capability>/I<n> and refuses every other name", () => {
    for (const name of ["graph/I7", "agents/I1", "kaal-core/I12"]) assert.match(name, rule, name);
    for (const name of ["graph/F4", "I7", "graph/I0", "graph/I07", "Graph/I7", "graph/I7 extra", "graph/i7"]) assert.doesNotMatch(name, rule, name);
  });

  it("intent/T3: a Requirement's Serves Edge is traversed into the Intent, and an edit to the Intent shows as drift", () => {
    const serves = createNode({ name: "Serves", type: foundation().definition, body: "# Serves\n\nA fixture relationship.\n" }).node;
    const intent = identify(Buffer.from(element));
    const requirement = createNode({
      name: "graph/F4",
      type: { name: "Requirement", id: "0".repeat(64) },
      edges: [{ type: { name: serves.name, id: serves.id }, targets: [{ name: intent.name, id: intent.id }] }],
    }).node;
    const graph = new Graph([definition, serves, intent, requirement]);
    assert.deepEqual([...graph.traverse(intent.id, { direction: "in" })].map((s) => s.id).filter((id) => id !== intent.id), [requirement.id]);
    assert.deepEqual(graph.out(intent.id), []);
    const edited = identify(Buffer.from(element.replace(/\n$/, " Edited.\n")));
    const drifted = new Graph([definition, serves, edited, requirement]);
    assert.notDeepEqual(drifted.check().filter((p) => p.includes(intent.name)), []);
  });

  it("intent/T4: Intent's ownership claim covers exactly its package and names the Intent Skill Node", () => {
    const claim = JSON.parse(readFileSync(join(PACKAGE, "ownership.kaal.json"), "utf8"));
    const skill = identify(readFileSync(join(PACKAGE, "payload", "Intent.md")));
    assert.deepEqual(claim, { owner: { kind: "capability", name: "Intent", id: skill.id }, paths: ["packages/skills/kaal-intent/"] });
  });
});
