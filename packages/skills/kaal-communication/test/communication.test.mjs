import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { bootstrap, capabilities, foundation, identify, loadEngine, readContribution, registerSkill } from "kaal-core";

const PAYLOAD = fileURLToPath(new URL("../payload/", import.meta.url));
const node = (file) => identify(readFileSync(join(PAYLOAD, file)));

describe("payload", () => {
  it("is one Skill and the Transport and CHAOS Definitions, typed by Core", () => {
    const f = foundation();
    assert.deepEqual(node("Communication.md").type, f.skill);
    assert.deepEqual(node("Transport.md").type, f.definition);
    assert.deepEqual(node("CHAOS.md").type, f.definition);
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
    assert.match(text, /\*\*CHAOS\*\*, Changes Helping Agent Orders Systematically, as its Definition states/);
    assert.doesNotMatch(text, /Nothing else collects ideas/);
    const chaos = readFileSync(join(PAYLOAD, "CHAOS.md"), "utf8");
    assert.match(chaos, /^# CHAOS\n\nChanges Helping Agent Orders Systematically\.$/m);
    assert.match(chaos, /\(1\) an open Change; \(2\) otherwise an open conversation; \(3\) otherwise a new shared conversation; \(4\) only as a last resort, a direct chat with an Agent/);
    assert.match(chaos, /CHAOS governs only where discussion takes place, not how intentions are captured or managed/);
    assert.match(readFileSync(join(PAYLOAD, "Transport.md"), "utf8"), /A Change never references a conversation\./);
  });

  it("registers into a fresh Engine, where Transport and CHAOS are admitted", () => {
    const dir = mkdtempSync(join(tmpdir(), "kaal-communication-"));
    bootstrap(dir);
    registerSkill(dir, "kaal-communication", readContribution(PAYLOAD));
    assert.deepEqual(
      capabilities(dir).skills.map((r) => r.name),
      ["Communication"],
    );
    for (const file of ["Transport.md", "CHAOS.md"]) assert.ok(loadEngine(dir).nodes.some((n) => n.id === node(file).id), file);
  });
});
