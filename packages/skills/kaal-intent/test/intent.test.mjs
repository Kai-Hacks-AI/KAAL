import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { bootstrap, catalog, foundation, readContribution, register, verify } from "kaal-core";
import { identify } from "kaal-graph";
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
  const [, example] = fences(reference);

  it("is in the Kernel's Form with a name and nothing else", () => {
    const intent = identify(Buffer.from(example));
    assert.equal(intent.name, "Intent capture");
    assert.equal(intent.type, undefined);
  });

  it("carries only what is wanted and why", () => {
    assert.match(example, /^---\nname: [^\n]+\n---\n\n# Intent capture\n\n[^\n#]+\n\n## Why\n\n[^\n#]+\n$/);
  });
});
