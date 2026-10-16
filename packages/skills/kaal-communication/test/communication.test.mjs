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
  it("is one Skill and the Transport Definition, typed by Core", () => {
    const f = foundation();
    assert.deepEqual(node("Communication.md").type, f.skill);
    assert.deepEqual(node("Transport.md").type, f.definition);
  });

  it("keeps conversation state in its latest messages, with marks that never change", () => {
    const text = readFileSync(join(PAYLOAD, "Communication.md"), "utf8");
    assert.match(text, /latest messages are its current coordination context; nothing else tracks its state/);
    assert.match(text, /never changed or removed afterwards, and it never stands for the state of the conversation/);
  });

  it("registers into a fresh Engine, where Transport is admitted", () => {
    const dir = mkdtempSync(join(tmpdir(), "kaal-communication-"));
    bootstrap(dir);
    registerSkill(dir, "kaal-communication", readContribution(PAYLOAD));
    assert.deepEqual(
      capabilities(dir).skills.map((r) => r.name),
      ["Communication"],
    );
    assert.ok(loadEngine(dir).nodes.some((n) => n.id === node("Transport.md").id));
  });
});
