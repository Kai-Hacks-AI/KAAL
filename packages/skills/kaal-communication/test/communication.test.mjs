import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { bootstrap, capabilities, foundation, identify, loadEngine, readContribution, registerSkill } from "kaal-core";
import { execute, read } from "kaal-hosting";
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

describe("the command", () => {
  const SCRIPT = fileURLToPath(new URL("../skills/kaal-communication/scripts/open-handovers.mjs", import.meta.url));

  it("refuses a records directory or Engine that does not exist", async () => {
    const dir = registered();
    const missing = await execute(process.execPath, [SCRIPT, join(dir, "no-such-records"), "--engine", dir], { cwd: dir });
    assert.equal(missing.status, 2);
    assert.match(missing.stderr, /no-such-records is not a directory/);
    const noEngine = await execute(process.execPath, [SCRIPT, dir, "--engine", join(dir, "no-such-engine")], { cwd: dir });
    assert.equal(noEngine.status, 2);
  });

  it("prints every open record before exiting", async () => {
    const dir = registered();
    const records = mkdtempSync(join(tmpdir(), "kaal-records-"));
    for (let i = 0; i < 400; i++) writeFileSync(join(records, `r${i}.md`), request(`Request number ${i} ${"x".repeat(150)}`));
    const r = await execute(process.execPath, [SCRIPT, records, "--engine", dir], { cwd: dir });
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.stdout.trim().split("\n").length, 400);
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

  it("close nothing when Answers holds more than its two lines", async () => {
    const files = await read(registered());
    const first = request("First request");
    const ref = identify(first);
    const loose = record("Loose answer", `## From\n\nB\n\n## To\n\nA\n\n## Answers\n\n- name: Other\n- name: ${ref.name}\n- id: ${ref.id}\n\n## Outcome\n\nDone.\n`);
    const r = judge(files, { "a.md": first, "b.md": loose });
    assert.match(r.problems.join("\n"), /b\.md: Answers holds exactly/);
    assert.deepEqual(
      r.open.map((x) => x.name),
      ["First request"],
    );
  });

  it("read only their own sections", () => {
    const s = sections("---\nname: x\n---\n\n## From\n\nA\n\n## Notes\n\nignored\n\n## To\n\nB\n");
    assert.deepEqual(s, { From: "A", To: "B" });
  });
});
