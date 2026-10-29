// The package's deterministic contracts: its payload is the Controls
// Capability Node, the two Definitions a documented control uses and the VARISC,
// HAPTIC and CATCH ME IF YOU CAN Definitions, typed as Core types them; Core admits them
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
import { bootstrap, catalog, foundation, readContribution, register, verify } from "kaal-core";
import { checkSkill } from "kaal-engineer-skill";
import { createNode, Graph, identify } from "kaal-graph";
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
  it("controls/T1: is the Controls Capability Node and the Control, Realized by, VARISC, HAPTIC and CATCH ME IF YOU CAN Definitions", async () => {
    assert.deepEqual(Object.keys(await readContribution(PAYLOAD)).sort(), ["CATCH-ME-IF-YOU-CAN.md", "Control.md", "Controls.md", "HAPTIC.md", "Realized-by.md", "VARISC.md"]);
    assert.deepEqual(node("Controls.md").type, foundation().capability);
    assert.deepEqual([node("Control.md").name, node("Control.md").type], ["Control", foundation().definition]);
    assert.deepEqual([node("Realized-by.md").name, node("Realized-by.md").type], ["Realized by", foundation().definition]);
    assert.deepEqual([node("VARISC.md").name, node("VARISC.md").type], ["VARISC", foundation().definition]);
    assert.deepEqual([node("HAPTIC.md").name, node("HAPTIC.md").type], ["HAPTIC", foundation().definition]);
  });

  it("controls/T2: registers into a fresh Engine as a Capability, not a Skill", async () => {
    const dir = mkdtempSync(join(tmpdir(), "kaal-controls-"));
    await bootstrap(dir);
    await register(dir, "capability", "kaal-controls", await readContribution(PAYLOAD));
    const listed = await catalog(dir);
    assert.deepEqual([listed.capabilities.map((r) => r.name), listed.skills.map((r) => r.name)], [["Controls"], []]);
    const verification = await verify(dir);
    assert.deepEqual([verification.ok, verification.problems], [true, []]);
  });

  it("controls/T3: keeps the identity of the Definitions other capabilities document their controls with", () => {
    assert.deepEqual(
      ["Control.md", "Realized-by.md", "VARISC.md", "HAPTIC.md"].map((f) => node(f).id),
      [
        "2e737aa4bd36b31c536c879a39e8debc7cba94ee2d070443a5216f0c26ee29cd",
        "07c7ea76667f0a16edcf6bb1e7e6aaf2ec114b817d3e7ad8222db0c5afb486f7",
        "912d4d41e8592a52ee46e0599af7e17c8429f354a78ede9b78c8cbb5ac17b007",
        "172f9ae967582aa2ce90085247792d96c739ba40802d7e7db29b87f81e2f29e3",
      ],
    );
  });
});

describe("CATCH ME IF YOU CAN", () => {
  it("controls/T5: is a Definition in the payload, which a fresh Engine admits whole", async () => {
    assert.deepEqual([node("CATCH-ME-IF-YOU-CAN.md").name, node("CATCH-ME-IF-YOU-CAN.md").type], ["CATCH ME IF YOU CAN", foundation().definition]);
    const dir = mkdtempSync(join(tmpdir(), "kaal-controls-catch-"));
    await bootstrap(dir);
    await register(dir, "capability", "kaal-controls", await readContribution(PAYLOAD));
    const verification = await verify(dir);
    assert.deepEqual([verification.ok, verification.problems], [true, []]);
  });

  it("controls/T6: keeps the Owner's expansion verbatim, and its initials spell the name", () => {
    const expansion = "Control Agents Through Continuous Hunting Misbehaving Elements, Implementing Fierce Yet Objective Unbiased Checks Against Noncompliance.";
    const text = readFileSync(join(PAYLOAD, "CATCH-ME-IF-YOU-CAN.md"), "utf8");
    assert.ok(text.split("\n").includes(expansion), "the expansion is one line of its own");
    const initials = expansion.split(/\s+/).map((word) => word[0]).join("");
    assert.equal(initials, "CATCH ME IF YOU CAN".replaceAll(" ", ""));
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
  it("controls/T2: is admitted with the capability that documents it, once Controls is registered", async () => {
    const dir = mkdtempSync(join(tmpdir(), "kaal-controls-documented-"));
    await bootstrap(dir);
    const { capability, control } = documented();
    await assert.rejects(register(dir, "capability", "example", { "Example.md": capability.bytes, "Example-review.md": control.bytes }), /Example-review\.md is not admitted/);
    await register(dir, "capability", "kaal-controls", await readContribution(PAYLOAD));
    await register(dir, "capability", "example", { "Example.md": capability.bytes, "Example-review.md": control.bytes });
    const verification = await verify(dir);
    assert.deepEqual([verification.ok, verification.problems], [true, []]);
  });

  it("has a Realized by Edge that Graph finds well formed and resolved", () => {
    const { capability, control } = documented();
    const payload = ["Control.md", "Controls.md", "Realized-by.md"].map(node);
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
  it("controls/T1: names the Controls Capability Node by its kind and exact name and id, and claims the package's tree", () => {
    const { claim, finding } = readClaim(`packages/skills/kaal-controls/${CLAIM_FILE}`, readFileSync(join(PACKAGE, CLAIM_FILE)));
    assert.equal(finding, undefined);
    assert.deepEqual(claim.owner, { kind: "capability", ...ref(node("Controls.md")) });
    assert.deepEqual(claim.paths, ["packages/skills/kaal-controls/"]);
  });
});
