// requirements/C11: the planned tests of Traceable Requirements, packages/skills/kaal-requirements/plan/traceability/testing.md.
// They are immutable to DO and CHECK. They run outside the package's `npm test` until requirements/C12 turns them GREEN.
// requirements/T16 and requirements/T17 are not written here: their fixture Intent Node is typed by Intent's Definition `Intent`,
// which `kaal/requirements` does not carry yet (see testing.md). A fixture typed by a guessed stand-in would fabricate the RED.
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { bootstrap, catalog, foundation, readContribution, register, verify } from "kaal-core";
import { Graph, createNode, identify } from "kaal-graph";
import { execute } from "kaal-hosting";

const PACKAGE = fileURLToPath(new URL("../../", import.meta.url));
const CAPABILITY = join(PACKAGE, "capability");
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
    const { mkdirSync, writeFileSync } = await import("node:fs");
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
