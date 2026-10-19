import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { bootstrap, capabilities, foundation, loadEngine, readContribution, registerSkill } from "kaal-core";

const PAYLOAD = fileURLToPath(new URL("../payload/", import.meta.url));

// A fresh Engine with Communication registered; its Nodes are read back as the Engine admitted them.
async function registered() {
  const dir = mkdtempSync(join(tmpdir(), "kaal-communication-"));
  await bootstrap(dir);
  await registerSkill(dir, "kaal-communication", await readContribution(PAYLOAD));
  return { dir, nodes: (await loadEngine(dir)).nodes };
}
const at = (nodes, file) => nodes.find((n) => n.paths.includes(`skills/kaal-communication/${file}`));

describe("payload", () => {
  it("is one Skill and the Channel, Transport and CHAOS Definitions, typed by Core", async () => {
    const f = await foundation();
    const { nodes } = await registered();
    assert.deepEqual({ ...at(nodes, "Communication.md").type }, { ...f.skill });
    assert.deepEqual({ ...at(nodes, "Channel.md").type }, { ...f.definition });
    assert.deepEqual({ ...at(nodes, "Transport.md").type }, { ...f.definition });
    assert.deepEqual({ ...at(nodes, "CHAOS.md").type }, { ...f.definition });
  });

  it("keeps conversation state in its latest messages, with marks that never change", () => {
    const text = readFileSync(join(PAYLOAD, "Communication.md"), "utf8");
    assert.match(text, /latest messages are its current coordination context; nothing else tracks its state/);
    for (const event of ["seen", "taken", "done", "blocked"]) assert.match(text, new RegExp(`\\*\\*${event}\\*\\*`));
    assert.match(text, /Marks are additive historical facts: none is ever changed, removed or replaced/);
    assert.match(text, /A mark is not authorship, approval, authority or permission/);
  });

  it("converges into self-contained Changes, and routes ideas to where their discussion lives", () => {
    const text = readFileSync(join(PAYLOAD, "Communication.md"), "utf8");
    assert.match(text, /does not reference the conversation, transcript or handover it came from/);
    assert.match(text, /ends in one or more self-contained Changes, or concludes explicitly that none is needed/);
    assert.match(text, /\*\*CHAOS\*\*, Changes Help Agents Organize Systematically, as its Definition states/);
    assert.doesNotMatch(text, /Nothing else collects ideas/);
    const chaos = readFileSync(join(PAYLOAD, "CHAOS.md"), "utf8");
    assert.match(chaos, /^# CHAOS\n\nChanges Help Agents Organize Systematically\.$/m);
    assert.match(chaos, /\(1\) an open Change; \(2\) otherwise an open conversation; \(3\) otherwise a new shared conversation; \(4\) only as a last resort, a direct chat with an Agent/);
    assert.match(chaos, /CHAOS governs only where discussion takes place, not how intentions are captured or managed/);
    assert.match(readFileSync(join(PAYLOAD, "Transport.md"), "utf8"), /A Change never references a conversation\./);
  });

  it("defines a Channel as the medium, apart from the context that makes content relevant", () => {
    const text = readFileSync(join(PAYLOAD, "Channel.md"), "utf8");
    assert.match(text, /^A Channel is a medium through which Communication carries content in context\. Context establishes what content is relevant to; the Channel is only the medium\./m);
    assert.match(text, /A location within a Channel, such as a thread or a pull request, holds one conversation\./);
    for (const aspect of ["Location", "Addressing", "Authorship", "Reading", "Reference", "Limits"]) assert.match(text, new RegExp(`\\*\\*${aspect}\\*\\*`), aspect);
    assert.match(text, /A Change never references a conversation\./);
    assert.match(text, /the Change and its facts remain Change's/);
  });

  it("registers into a fresh Engine, where Channel, Transport and CHAOS are admitted", async () => {
    const { dir, nodes } = await registered();
    assert.deepEqual(
      (await capabilities(dir)).skills.map((r) => r.name),
      ["Communication"],
    );
    for (const file of ["Channel.md", "Transport.md", "CHAOS.md"]) assert.ok(at(nodes, file), file);
  });
});
