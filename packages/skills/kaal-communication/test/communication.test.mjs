import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { bootstrap, capabilities, foundation, identify, loadEngine, readContribution, registerSkill } from "kaal-core";
import { read } from "kaal-hosting";
import { judge, sections } from "../skills/kaal-communication/scripts/handovers.mjs";

const PAYLOAD = new URL("../payload/", import.meta.url);
const node = (file) => identify(readFileSync(new URL(file, PAYLOAD)));

function engine() {
  const dir = mkdtempSync(join(tmpdir(), "kaal-communication-"));
  bootstrap(dir);
  return dir;
}

function registered() {
  const dir = engine();
  registerSkill(dir, "kaal-communication", readContribution(PAYLOAD.pathname));
  return dir;
}

function record(name, body, type = node("Handover.md")) {
  return Buffer.from(`---\nname: ${name}\ntype:\n  name: ${type.name}\n  id: ${type.id}\n---\n\n# ${name}\n\n${body}`);
}

const request = (name, to = "Example Agent B") => record(name, `## From\n\nExample Agent A\n\n## To\n\n${to}\n\n## Request\n\nDo the example work.\n\n## Evidence\n\n- https://chat.example.com/m/1\n`);
const answer = (name, target) =>
  record(name, `## From\n\nExample Agent B\n\n## To\n\nExample Agent A\n\n## Answers\n\n- name: ${target.name}\n- id: ${target.id}\n\n## Outcome\n\nDone.\n`);

describe("payload", () => {
  it("is one Skill and two Definitions, typed by Core", () => {
    const f = foundation();
    assert.deepEqual(node("Communication.md").type, f.skill);
    assert.deepEqual(node("Transport.md").type, f.definition);
    assert.deepEqual(node("Handover.md").type, f.definition);
  });

  it("registers into a fresh Engine, where Transport and Handover are admitted", () => {
    const dir = registered();
    assert.deepEqual(
      capabilities(dir).skills.map((r) => r.name),
      ["Communication"],
    );
    const e = loadEngine(dir);
    for (const file of ["Transport.md", "Handover.md"]) assert.ok(e.nodes.some((n) => n.id === node(file).id), file);
  });
});

describe("handover records", () => {
  it("are open until a record answers them", async () => {
    const files = await read(registered());
    const first = request("First request");
    const second = request("Second request");
    const r = judge(files, { "a.md": first, "b.md": second, "c.md": answer("First done", identify(first)) });
    assert.deepEqual(r.problems, []);
    assert.deepEqual(
      r.open.map((x) => x.name),
      ["Second request"],
    );
    assert.deepEqual(
      r.answered.map((x) => x.name),
      ["First request"],
    );
    assert.equal(r.open[0].evidence, "- https://chat.example.com/m/1");
  });

  it("need an Engine that holds Handover", async () => {
    const r = judge(await read(engine()), { "a.md": request("A request") });
    assert.match(r.problems.join("\n"), /holds no Handover Definition/);
  });

  it("report records not typed by Handover, malformed ones, and answers to nothing", async () => {
    const files = await read(registered());
    const stranger = record("Not a handover", "## From\n\nx\n", node("Transport.md"));
    const unknown = { name: "Missing", id: "0".repeat(64) };
    const r = judge(files, {
      "stranger.md": stranger,
      "partial.md": record("Partial", "## From\n\nExample Agent A\n"),
      "orphan.md": answer("Orphan answer", unknown),
      "notes.txt": Buffer.from("plain notes are not records\n"),
    });
    const text = r.problems.join("\n");
    assert.match(text, /stranger\.md: not typed by a Handover/);
    assert.match(text, /partial\.md: missing To, Request/);
    assert.match(text, /orphan\.md: answers Missing/);
  });

  it("report a record whose type names Handover with an unknown id", async () => {
    const fake = { name: "Handover", id: "f".repeat(64) };
    const r = judge(await read(registered()), { "fake.md": record("Fake", "## From\n\nA\n", fake) });
    assert.match(r.problems.join("\n"), /fake\.md: /);
    assert.deepEqual(r.open, []);
  });

  it("read only their own sections", () => {
    const s = sections("---\nname: x\n---\n\n## From\n\nA\n\n## Notes\n\nignored\n\n## To\n\nB\n");
    assert.deepEqual(s, { From: "A", To: "B" });
  });
});
