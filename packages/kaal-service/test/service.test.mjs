// Deterministic verification of what can be decided mechanically: the Nodes'
// Form and types, admission into an Engine by Core alone, what the package
// delivers, and that Graph derives a Service's provider and consumers from the
// Edges their own Nodes carry. What the Definitions mean is not verified here:
// that is validation, by independent Agent or human review.
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { bootstrap, catalog, foundation, loadEngine, readContribution, register } from "kaal-core";
import { createNode, Graph, identify } from "kaal-graph";
import { execute, readFile } from "kaal-hosting";

const PACKAGE = fileURLToPath(new URL("../", import.meta.url));
const CAPABILITY = join(PACKAGE, "capability");
const ref = ({ name, id }) => ({ name, id });
const node = async (file) => identify(await readFile(join(CAPABILITY, file)));

describe("kaal-service", () => {
  it("delivers its Capability Node in Form, typed by Core's KAAL Capability", async () => {
    const n = await node("Service.md");
    assert.equal(n.name, "Service");
    assert.deepEqual(n.type, foundation().capability);
  });

  it("delivers the Service, provides and consumes Definitions in Form, typed by Core's KAAL Definition", async () => {
    for (const [file, name] of [["Service-Definition.md", "Service"], ["provides.md", "provides"], ["consumes.md", "consumes"]]) {
      const n = await node(file);
      assert.equal(n.name, name, file);
      assert.deepEqual(n.type, foundation().definition, file);
    }
  });

  it("is admitted into a fresh Engine by Core alone, and discovered there as one Capability", async () => {
    const dir = mkdtempSync(join(tmpdir(), "kaal-service-"));
    await bootstrap(dir);
    await register(dir, "capability", "service", await readContribution(CAPABILITY));
    const found = await catalog(dir);
    assert.deepEqual([found.capabilities.map((r) => r.name), found.agents, found.skills, found.extensions], [["Service"], [], [], []]);
    assert.deepEqual((await loadEngine(dir)).rejected, []);
  });

  it("packs its Nodes and nothing else beyond its metadata", async () => {
    const r = await execute("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE });
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(JSON.parse(r.stdout)[0].files.map((f) => f.path).sort(), [
      "LICENSE",
      "README.md",
      "capability/Service-Definition.md",
      "capability/Service.md",
      "capability/consumes.md",
      "capability/provides.md",
      "package.json",
    ]);
  });
});

describe("a Service in an Engine", () => {
  // One Capability provides a Service, and a Node of each CASE kind consumes
  // it. Each is an ordinary contribution: Core admits them by their types, and
  // only Graph reads their Edges.
  async function engine() {
    const f = foundation();
    const service = ref(await node("Service-Definition.md"));
    const provides = ref(await node("provides.md"));
    const consumes = ref(await node("consumes.md"));
    const dir = mkdtempSync(join(tmpdir(), "kaal-service-engine-"));
    await bootstrap(dir);
    await register(dir, "capability", "service", await readContribution(CAPABILITY));

    const greetings = createNode({ name: "Greetings", type: service });
    const greeting = createNode({ name: "Greeting", type: f.capability, edges: [{ type: provides, targets: [ref(greetings.node)] }] });
    await register(dir, "capability", "greeting", { "Greeting.md": greeting.bytes, "Greetings.md": greetings.bytes });
    const uses = { type: consumes, targets: [ref(greetings.node)] };
    const consumers = {
      capability: createNode({ name: "Welcome", type: f.capability, edges: [uses] }),
      agent: createNode({ name: "Host", type: f.agent, edges: [uses] }),
      skill: createNode({ name: "Greeter", type: f.skill, edges: [uses] }),
      extension: createNode({ name: "Doorbell", type: f.extension, edges: [uses] }),
    };
    for (const [kind, c] of Object.entries(consumers)) await register(dir, kind, c.node.name.toLowerCase(), { [`${c.node.name}.md`]: c.bytes });

    const loaded = await loadEngine(dir);
    assert.deepEqual(loaded.rejected, []);
    return { graph: new Graph(loaded.nodes), service, provides, consumes, greetings: ref(greetings.node), greeting: ref(greeting.node), consumers: Object.values(consumers).map((c) => ref(c.node)) };
  }

  it("admits the Service, its provider and its consumers by their types alone, and every Edge resolves", async () => {
    const { graph, service, greetings } = await engine();
    assert.deepEqual(graph.typed(service), [greetings]);
    assert.deepEqual(graph.check(), []);
  });

  it("derives the one provider and every consumer from the Edges their own Nodes carry", async () => {
    const { graph, provides, consumes, greetings, greeting, consumers } = await engine();
    const incoming = graph.in(greetings.id);
    const sources = (type) => incoming.filter((e) => e.type.id === type.id).map((e) => e.source.name).sort();
    assert.deepEqual(sources(provides), [greeting.name]);
    assert.deepEqual(sources(consumes), consumers.map((c) => c.name).sort());
  });

  it("needs nothing from the provider about its consumers: the provider's only Edge is the Service it provides", async () => {
    const { graph, provides, greetings, greeting } = await engine();
    assert.deepEqual(graph.out(greeting.id), [{ type: provides, target: greetings }]);
    assert.deepEqual(graph.out(greetings.id), []);
  });

  it("traverses from a Service to its consumers, and from a consumer to the Service's provider, by Edge type", async () => {
    const { graph, provides, consumes, greetings, greeting, consumers } = await engine();
    const names = (start, options) => [...graph.traverse(start, options)].filter((s) => s.depth > 0).map((s) => graph.node(s.id).name).sort();
    assert.deepEqual(names(greetings.id, { direction: "in", type: consumes.id }), consumers.map((c) => c.name).sort());
    const [service] = graph.out(consumers[1].id).map((e) => e.target);
    assert.deepEqual(names(service.id, { direction: "in", type: provides.id }), [greeting.name]);
  });
});
