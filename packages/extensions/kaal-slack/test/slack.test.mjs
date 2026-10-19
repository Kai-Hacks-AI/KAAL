import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { bootstrap, capabilities, foundation, loadEngine, readContribution, registerExtension, registerSkill } from "kaal-core";

const PAYLOAD = fileURLToPath(new URL("../payload/", import.meta.url));
// The prerequisite, resolved as an installed dependency would be.
const COMMUNICATION = join(dirname(fileURLToPath(import.meta.resolve("kaal-communication/package.json"))), "payload");
const at = (nodes, path) => nodes.find((n) => n.paths.includes(path));

async function engine() {
  const dir = mkdtempSync(join(tmpdir(), "kaal-slack-"));
  await bootstrap(dir);
  return dir;
}

// A fresh Engine with Communication and Slack registered.
async function registered() {
  const dir = await engine();
  await registerSkill(dir, "kaal-communication", await readContribution(COMMUNICATION));
  await registerExtension(dir, "kaal-slack", await readContribution(PAYLOAD));
  return dir;
}

describe("payload", () => {
  it("is one Extension and one Channel realization", async () => {
    const { nodes } = await loadEngine(await registered());
    assert.deepEqual({ ...at(nodes, "extensions/kaal-slack/Slack.md").type }, { ...(await foundation()).extension });
    const channel = at(nodes, "skills/kaal-communication/Channel.md");
    assert.deepEqual({ ...at(nodes, "extensions/kaal-slack/Slack-Channel.md").type }, { name: channel.name, id: channel.id }, "Slack Channel must be typed by the current Channel");
  });
});

describe("reactions", () => {
  it("mark events on one message, are only added, and never carry a thread's state", () => {
    const text = readFileSync(join(PAYLOAD, "Slack-Channel.md"), "utf8");
    const skill = readFileSync(fileURLToPath(new URL("../skills/kaal-slack/SKILL.md", import.meta.url)), "utf8");
    const defaults = readFileSync(fileURLToPath(new URL("../skills/kaal-slack/references/defaults.md", import.meta.url)), "utf8");
    assert.match(text, /Reactions are added, never removed, and never carry the state of a thread or who acts next/);
    assert.match(skill, /Only add reactions: never remove or change one/);
    for (const [event, emoji] of [["Seen", "`eyes`"], ["Taken", "the participant's display marker"], ["Done", "`white_check_mark`"], ["Blocked", "`no_entry`"]]) {
      assert.match(defaults, new RegExp(`^\\| ${event} \\| [^|]*${emoji.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "m"));
      assert.ok(text.includes(emoji.replace("the participant's", "a participant's")), `Slack Channel names ${emoji}`);
    }
    assert.match(skill, /A reaction is never authorship/);
    assert.match(text, /the reaction the project's setup assigns to that event, by default/);
    assert.match(skill, /^compatibility: .*Adding reactions is optional\./m);
    assert.match(skill, /If your Slack access cannot add reactions, say the same in a reply instead/);
  });
});

describe("changes", () => {
  it("never link Slack: no file in the package offers a conversation link as context for a Change", () => {
    const root = fileURLToPath(new URL("../", import.meta.url));
    for (const file of ["README.md", "payload/Slack.md", "payload/Slack-Channel.md", "skills/kaal-slack/SKILL.md", "skills/kaal-slack/references/defaults.md"]) {
      assert.doesNotMatch(readFileSync(join(root, file), "utf8"), /optional context/, file);
    }
    assert.match(readFileSync(join(PAYLOAD, "Slack-Channel.md"), "utf8"), /A Change never links one\./);
  });
});

describe("registration", () => {
  it("is refused without kaal-communication, and writes nothing", async () => {
    const dir = await engine();
    const contribution = await readContribution(PAYLOAD);
    await assert.rejects(async () => registerExtension(dir, "kaal-slack", contribution), /Slack-Channel\.md is not admitted: type Channel \(\w+\) resolves to no Node/);
    assert.deepEqual((await capabilities(dir)).extensions, []);
  });

  it("succeeds once kaal-communication is registered", async () => {
    const dir = await registered();
    assert.deepEqual(
      (await capabilities(dir)).extensions.map((r) => r.name),
      ["Slack"],
    );
    const e = await loadEngine(dir);
    const channel = at(e.nodes, "skills/kaal-communication/Channel.md");
    assert.deepEqual(
      e.nodes.filter((n) => n.type?.name === channel.name && n.type.id === channel.id).map((n) => n.name),
      ["Slack Channel"],
    );
  });
});
