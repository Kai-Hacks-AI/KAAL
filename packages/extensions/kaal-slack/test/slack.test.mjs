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

describe("signals", () => {
  const text = readFileSync(join(PAYLOAD, "Slack-Transport.md"), "utf8");
  const skill = readFileSync(fileURLToPath(new URL("../skills/kaal-slack/SKILL.md", import.meta.url)), "utf8");
  const defaults = readFileSync(fileURLToPath(new URL("../skills/kaal-slack/references/defaults.md", import.meta.url)), "utf8");

  it("realizes every point of the current Transport", () => {
    const points = [...readFileSync(join(COMMUNICATION, "Transport.md"), "utf8").matchAll(/^- \*\*(\w+)\*\*:/gm)].map((m) => m[1]);
    assert.ok(points.includes("Signals"));
    assert.deepEqual([...text.matchAll(/^- \*\*(\w+)\*\*:/gm)].map((m) => m[1]), points);
  });

  it("names a reaction for every state and for a person as next actor, the same in Node and defaults", () => {
    for (const [state, emoji] of [["active", "large_green_circle"], ["waiting", "large_yellow_circle"], ["blocked", "red_circle"], ["concluded", "white_check_mark"], ["person", "bust_in_silhouette"]]) {
      assert.match(text, new RegExp(`\`${emoji}\` \\(${state}\\)|\`${emoji}\` for a ${state}`));
      assert.match(defaults, new RegExp(`\`${emoji}\``));
    }
  });

  it("counts only the signalling account, and never treats a signal as approval", () => {
    assert.match(text, /only the account that added a reaction remove it/);
    assert.match(skill, /can both add and remove reactions/);
    assert.match(skill, /Never treat a signal as approval/);
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
