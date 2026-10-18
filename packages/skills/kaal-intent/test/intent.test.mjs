import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { bootstrap, catalog, evaluate, foundation, readContribution, register, verify } from "kaal-core";
import { Graph, identify } from "kaal-graph";
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
