// The package's deterministic contracts: its payload is the Controls Skill
// Node, the two Definitions a documented control uses and the VARISC
// and HAPTIC Definitions, typed as Core types them; Core admits them
// into a fresh Engine, and admits a control a capability documents with
// them; Graph finds that control's Edges well
// formed and resolved; the Agent Skill conforms. What the Nodes and the
// Agent Skill mean is validated by reading them, not here.
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { bootstrap, capabilities, foundation, identify, readContribution, register, registerSkill, verify } from "kaal-core";
import { checkSkill } from "kaal-engineer-skill";
import { createNode, Graph, identify as graphIdentify } from "kaal-graph";
import { read } from "kaal-hosting";
import { CLAIM_FILE, readClaim } from "kaal-testing/attribution";

const PACKAGE = fileURLToPath(new URL("../", import.meta.url));
const PAYLOAD = join(PACKAGE, "payload");
const node = (file) => identify(readFileSync(join(PAYLOAD, file)));
const ref = (n) => ({ name: n.name, id: n.id });

/** A capability that documents one of its controls, realized by the capability itself. */
function documented() {
  const capability = createNode({ name: "Example", type: foundation().capability, body: "# Example\n\nAn example capability.\n" });
  const control = createNode({
    name: "Example review",
    type: ref(node("Control.md")),
    edges: [{ type: ref(node("Realized-by.md")), targets: [ref(capability.node)] }],
    body: "# Example review\n\nA proposed change is reviewed before it is applied.\n",
  });
  return { capability, control };
}

describe("payload", () => {
  it("is the Controls Skill Node and the Control, Realized by, VARISC and HAPTIC Definitions", async () => {
    assert.deepEqual(Object.keys(await readContribution(PAYLOAD)).sort(), ["Control.md", "Controls.md", "HAPTIC.md", "Realized-by.md", "VARISC.md"]);
    assert.deepEqual(node("Controls.md").type, foundation().skill);
    assert.deepEqual([node("Control.md").name, node("Control.md").type], ["Control", foundation().definition]);
    assert.deepEqual([node("Realized-by.md").name, node("Realized-by.md").type], ["Realized by", foundation().definition]);
    assert.deepEqual([node("VARISC.md").name, node("VARISC.md").type], ["VARISC", foundation().definition]);
    assert.deepEqual([node("HAPTIC.md").name, node("HAPTIC.md").type], ["HAPTIC", foundation().definition]);
  });

  it("registers into a fresh Engine", async () => {
    const dir = mkdtempSync(join(tmpdir(), "kaal-controls-"));
    await bootstrap(dir);
    await registerSkill(dir, "kaal-controls", await readContribution(PAYLOAD));
    assert.deepEqual((await capabilities(dir)).skills.map((r) => r.name), ["Controls"]);
    const verification = await verify(dir);
    assert.deepEqual([verification.ok, verification.problems], [true, []]);
  });
});

describe("HAPTIC", () => {
  it("keeps the Owner's mnemonic verbatim and its three levels in ladder order", () => {
    const text = readFileSync(join(PAYLOAD, "HAPTIC.md"), "utf8");
    assert.match(text, /^Human < Agent < Program To Improve Controls\.$/m);
    const levels = ["Human", "Agent", "Program"].map((level) => text.indexOf(`- **${level}**:`));
    assert.ok(levels.every((at) => at > 0), "each level is defined");
    assert.deepEqual([...levels].sort((a, b) => a - b), levels);
  });
});

describe("a documented control", () => {
  it("is admitted with the capability that documents it, once Controls is registered", async () => {
    const dir = mkdtempSync(join(tmpdir(), "kaal-controls-documented-"));
    await bootstrap(dir);
    const { capability, control } = documented();
    await assert.rejects(register(dir, "capability", "example", { "Example.md": capability.bytes, "Example-review.md": control.bytes }), /Example-review\.md is not admitted/);
    await registerSkill(dir, "kaal-controls", await readContribution(PAYLOAD));
    await register(dir, "capability", "example", { "Example.md": capability.bytes, "Example-review.md": control.bytes });
    const verification = await verify(dir);
    assert.deepEqual([verification.ok, verification.problems], [true, []]);
  });

  it("has a Realized by Edge that Graph finds well formed and resolved", () => {
    const { capability, control } = documented();
    // Graph takes Nodes as its own identify() returns them.
    const payload = ["Control.md", "Controls.md", "Realized-by.md"].map((f) => graphIdentify(readFileSync(join(PAYLOAD, f))));
    const graph = new Graph([...payload, capability.node, control.node]);
    assert.deepEqual(graph.check(), []);
    assert.deepEqual(graph.out(control.node.id), [{ type: ref(node("Realized-by.md")), target: ref(capability.node) }]);
    assert.deepEqual(graph.typed(ref(node("Control.md"))), [ref(control.node)]);
  });
});

describe("the Agent Skill", () => {
  it("conforms", async () => {
    const dir = join(PACKAGE, "skills", "kaal-controls");
    assert.deepEqual(checkSkill("kaal-controls", await read(dir)), { standard: [], kaal: [], warnings: [] });
  });
});

describe("Controls' own claim", () => {
  it("names the Controls Skill Node by its kind and exact name and id, and claims the package's tree", () => {
    const { claim, finding } = readClaim(`packages/skills/kaal-controls/${CLAIM_FILE}`, readFileSync(join(PACKAGE, CLAIM_FILE)));
    assert.equal(finding, undefined);
    assert.deepEqual(claim.owner, { kind: "skill", ...ref(node("Controls.md")) });
    assert.deepEqual(claim.paths, ["packages/skills/kaal-controls/"]);
  });
});
