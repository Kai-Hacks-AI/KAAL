import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { bootstrap, capabilities, foundation, identify, loadEngine, readContribution, registerExtension, registerSkill } from "kaal-core";

const PAYLOAD = fileURLToPath(new URL("../payload/", import.meta.url));
// The prerequisite, resolved as an installed dependency would be.
const COMMUNICATION = join(dirname(fileURLToPath(import.meta.resolve("kaal-communication/package.json"))), "payload");
const node = (dir, file) => identify(readFileSync(join(dir, file)));

function engine() {
  const dir = mkdtempSync(join(tmpdir(), "kaal-slack-"));
  bootstrap(dir);
  return dir;
}

describe("payload", () => {
  it("is one Extension and one Transport realization", () => {
    assert.deepEqual(node(PAYLOAD, "Slack.md").type, foundation().extension);
    const transport = node(COMMUNICATION, "Transport.md");
    assert.deepEqual(node(PAYLOAD, "Slack-Transport.md").type, { name: transport.name, id: transport.id }, "Slack Transport must be typed by the current Transport");
  });
});

describe("reactions", () => {
  it("mark events on one message, are only added, and never carry a thread's state", () => {
    const text = readFileSync(join(PAYLOAD, "Slack-Transport.md"), "utf8");
    const skill = readFileSync(fileURLToPath(new URL("../skills/kaal-slack/SKILL.md", import.meta.url)), "utf8");
    const defaults = readFileSync(fileURLToPath(new URL("../skills/kaal-slack/references/defaults.md", import.meta.url)), "utf8");
    assert.match(text, /Reactions are added, never removed, and never carry the state of a thread or who acts next/);
    assert.match(skill, /Only add reactions: never remove or change one/);
    for (const [event, emoji] of [["Seen", "`eyes`"], ["Taken", "the participant's display marker"], ["Done", "`white_check_mark`"], ["Blocked", "`no_entry`"]]) {
      assert.match(defaults, new RegExp(`^\\| ${event} \\| [^|]*${emoji.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "m"));
      assert.ok(text.includes(emoji.replace("the participant's", "a participant's")), `Slack Transport names ${emoji}`);
    }
    assert.match(skill, /A reaction is never authorship/);
  });
});

describe("registration", () => {
  it("is refused without kaal-communication, and writes nothing", () => {
    const dir = engine();
    assert.throws(() => registerExtension(dir, "kaal-slack", readContribution(PAYLOAD)), /Slack-Transport\.md is not admitted: type Transport \(\w+\) resolves to no Node/);
    assert.deepEqual(capabilities(dir).extensions, []);
  });

  it("succeeds once kaal-communication is registered", () => {
    const dir = engine();
    registerSkill(dir, "kaal-communication", readContribution(COMMUNICATION));
    registerExtension(dir, "kaal-slack", readContribution(PAYLOAD));
    assert.deepEqual(
      capabilities(dir).extensions.map((r) => r.name),
      ["Slack"],
    );
    const e = loadEngine(dir);
    const transport = node(COMMUNICATION, "Transport.md");
    assert.deepEqual(
      e.typedBy({ name: transport.name, id: transport.id }).map((n) => n.name),
      ["Slack Transport"],
    );
  });
});
