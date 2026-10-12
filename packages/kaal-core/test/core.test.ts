import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  bootstrap,
  capabilities,
  evaluate,
  exportPayload,
  foundation,
  identify,
  loadEngine,
  payload,
  registerExtension,
  registerSkill,
  sha256,
  verify,
  type Ref,
} from "kaal-core";

/**
 * The foundational identities, pinned. Changing a foundational document's
 * bytes changes its id (and the id of every Node typed by it); that must be
 * a visible, reviewed change to this table.
 */
const PINNED = {
  kernel: "ddaa92fac353ee8afc639832a8a17ed5d038b641ce9a28ee3acb0aee754e6a2f",
  node: "e35de03241f75702886248ce4ebc38e19a88bc0fd5338a1618f5316c8ae1124f",
  definition: "46fbaf19ec03f357002b029c99171ed0ea456e502f641c22c8338cbf51566fce",
  skill: "e71195c81b4551e9301fc7a801a0a81b48cf1e64792b5aa77e29eba3c043b1f5",
  extension: "8ed0270988440c0a726c3270a7a99757c68f937b4f6771ebcee1de282ea183b6",
};

function node(name: string, type?: Ref, body = `# ${name}\n`): string {
  return `---\nname: ${name}\n${type ? `type:\n  name: ${type.name}\n  id: ${type.id}\n` : ""}---\n\n${body}`;
}

function tmp(): string {
  return mkdtempSync(join(tmpdir(), "kaal-core-test-"));
}

function engine(): string {
  const dir = join(tmp(), ".kaal");
  bootstrap(dir);
  return dir;
}

function readTree(dir: string): Record<string, Buffer> {
  const files: Record<string, Buffer> = {};
  for (const path of readdirSync(dir, { recursive: true, encoding: "utf8" })) {
    if (statSync(join(dir, path)).isFile()) files[path.split("\\").join("/")] = readFileSync(join(dir, path));
  }
  return files;
}

function snapshot(dir: string): string {
  return JSON.stringify(Object.entries(readTree(dir)).map(([p, b]) => [p, sha256(b)]));
}

const f = foundation();

describe("identity", () => {
  it("is the SHA-256 of exact bytes, and the foundation is deterministic", () => {
    assert.deepEqual(
      { kernel: f.kernel, node: f.node.id, definition: f.definition.id, skill: f.skill.id, extension: f.extension.id },
      PINNED,
    );
    for (const [path, bytes] of Object.entries(payload())) if (path !== "KAAL-KERNEL.md") assert.equal(identify(bytes).id, sha256(bytes));
  });

  it("carries exactly five foundational documents, the Kernel not a Node", () => {
    const files = payload();
    assert.deepEqual(Object.keys(files).sort(), ["KAAL-KERNEL.md", "core/KAAL-Definition.md", "core/KAAL-Extension.md", "core/KAAL-Skill.md", "core/Node.md"]);
    assert.throws(() => identify(files["KAAL-KERNEL.md"]));
  });

  it("does not depend on filename or location", () => {
    const bytes = Buffer.from(node("Thing", f.definition));
    const a = evaluate({ ...payload(), "x/a.md": bytes });
    const b = evaluate({ ...payload(), "deep/er/b.md": bytes });
    assert.equal(a.named("Thing")[0].id, b.named("Thing")[0].id);
  });

  it("changes with any byte", () => {
    assert.notEqual(identify(Buffer.from(node("A", f.node))).id, identify(Buffer.from(node("A", f.node) + " ")).id);
  });

  it("reads the Form strictly", () => {
    assert.deepEqual(identify(Buffer.from(node("KAAL Thing", f.definition))).type, f.definition);
    for (const bad of [
      "no frontmatter\n",
      "---\r\nname: A\r\n---\r\n",
      "---\nname:  A\n---\n",
      "---\nname: A \n---\n",
      "---\ntype:\n  name: Node\n  id: " + f.node.id + "\nname: A\n---\n",
      "---\nname: A\ntype:\n  name: Node\n  id: XYZ\n---\n",
      "---\nname: A\nextra: 1\n---\n",
    ])
      assert.throws(() => identify(Buffer.from(bad)), bad);
    assert.throws(() => identify(Buffer.from([0x2d, 0x2d, 0x2d, 0x0a, 0xff, 0xfe])));
  });
});

describe("resolution", () => {
  it("resolves types and references by name and identity", () => {
    const e = evaluate(payload());
    assert.equal(e.nodes.length, 4);
    assert.equal(e.resolve(f.skill).name, "KAAL Skill");
    assert.deepEqual(e.resolve(f.skill).type, f.definition);
    assert.deepEqual(e.resolve(f.definition).type, f.node);
    assert.equal(e.resolve(f.node).type, undefined);
    assert.throws(() => e.resolve({ name: "KAAL Extension", id: f.skill.id }), /named KAAL Skill/);
    assert.throws(() => e.resolve({ name: "KAAL Skill", id: "0".repeat(64) }), /no admitted Node/);
    assert.deepEqual(e.typedBy(f.definition).map((n) => n.name), ["KAAL Extension", "KAAL Skill"]);
  });

  it("admits a chain of types and rejects what does not resolve", () => {
    const concept = node("Concept", f.definition);
    const conceptId = sha256(concept);
    const files = {
      ...payload(),
      "a/concept.md": Buffer.from(concept),
      "a/instance.md": Buffer.from(node("Instance", { name: "Concept", id: conceptId })),
      "b/wrong-name.md": Buffer.from(node("Wrong", { name: "Not Concept", id: conceptId })),
      "b/unknown.md": Buffer.from(node("Unknown", { name: "Ghost", id: "1".repeat(64) })),
      "b/orphan.md": Buffer.from(node("Orphan", { name: "Unknown", id: sha256(node("Unknown", { name: "Ghost", id: "1".repeat(64) })) })),
      "b/second-genesis.md": Buffer.from(node("Node", undefined, "another genesis\n")),
      "b/malformed.md": Buffer.from("---\nname: Broken\n"),
      "notes.md": Buffer.from("# just prose, not a Node\n"),
    };
    const e = evaluate(files);
    assert.deepEqual(e.nodes.map((n) => n.name), ["Concept", "Instance", "KAAL Definition", "KAAL Extension", "KAAL Skill", "Node"]);
    assert.deepEqual(e.rejected.map((r) => r.path), ["b/malformed.md", "b/orphan.md", "b/second-genesis.md", "b/unknown.md", "b/wrong-name.md"]);
    assert.match(e.rejected.find((r) => r.path === "b/wrong-name.md")!.reason, /is named Concept/);
    assert.match(e.rejected.find((r) => r.path === "b/orphan.md")!.reason, /not admitted/);
  });

  it("allows several Nodes with one name, distinguished by id", () => {
    const one = node("Twin", f.definition, "one\n");
    const two = node("Twin", f.definition, "two\n");
    const e = evaluate({ ...payload(), "1.md": Buffer.from(one), "2.md": Buffer.from(two) });
    assert.equal(e.named("Twin").length, 2);
    assert.equal(e.resolve({ name: "Twin", id: sha256(two) }).paths[0], "2.md");
  });

  it("admits nothing without Core's genesis Node", () => {
    const files = payload();
    delete files["core/Node.md"];
    assert.equal(evaluate(files).nodes.length, 0);
  });
});

describe("bootstrap and verify", () => {
  it("materializes and verifies a fresh Engine, idempotently", () => {
    const dir = join(tmp(), ".kaal");
    assert.equal(bootstrap(dir).length, 5);
    assert.deepEqual(bootstrap(dir), []);
    const v = verify(dir);
    assert.deepEqual(v.problems, []);
    assert.ok(v.ok);
  });

  it("completes a partial Engine and refuses one with other bytes", () => {
    const dir = engine();
    const removed = join(dir, "core", "KAAL-Skill.md");
    writeFileSync(removed, "changed");
    const before = snapshot(dir);
    assert.throws(() => bootstrap(dir), /other bytes/);
    assert.equal(snapshot(dir), before);
  });

  it("reports what is wrong with an Engine", () => {
    const dir = engine();
    writeFileSync(join(dir, "KAAL-KERNEL.md"), "edited");
    writeFileSync(join(dir, "stray.md"), node("Stray", { name: "Nothing", id: "2".repeat(64) }));
    const v = verify(dir);
    assert.equal(v.ok, false);
    assert.equal(v.problems.length, 2);
    assert.ok(v.problems.some((p) => p.includes("Kernel")));
    assert.ok(v.problems.some((p) => p.startsWith("stray.md")));
    assert.equal(verify(join(tmp(), "nowhere")).ok, false);
  });

  it("verifies by identity, not location", () => {
    const dir = engine();
    const moved = join(dir, "elsewhere");
    mkdirSync(moved);
    for (const name of readdirSync(join(dir, "core"))) {
      writeFileSync(join(moved, name.toLowerCase()), readFileSync(join(dir, "core", name)));
    }
    const ok = verify(dir);
    assert.ok(ok.ok, ok.problems.join("\n"));
  });

  it("exports the foundational payload", () => {
    const out = join(tmp(), "export");
    assert.equal(exportPayload(out).length, 5);
    assert.deepEqual(readTree(out), payload());
    assert.throws(() => exportPayload(out), /not an empty directory/);
  });
});

describe("registration", () => {
  const skill = node("Greeting", f.skill, "Greet people warmly.\n");
  const extension = node("Clock", f.extension, "Tell the time.\n");

  it("registers a valid Skill and Extension and enumerates them", () => {
    const dir = engine();
    const s = registerSkill(dir, "kaal-greeting", { "Greeting.md": skill });
    assert.deepEqual(s, { ids: [sha256(skill)], written: true });
    const x = registerExtension(dir, "kaal-clock", { "nested/Clock.md": extension });
    assert.deepEqual(x, { ids: [sha256(extension)], written: true });
    assert.deepEqual(capabilities(dir), {
      skills: [{ name: "Greeting", id: sha256(skill) }],
      extensions: [{ name: "Clock", id: sha256(extension) }],
    });
    assert.equal(readFileSync(join(dir, "skills", "kaal-greeting", "Greeting.md"), "utf8"), skill);
    assert.ok(verify(dir).ok);
  });

  it("registers a contribution whose Nodes type each other", () => {
    const dir = engine();
    const part = node("Greeting Style", f.definition);
    const uses = node("Formal Greeting", { name: "Greeting Style", id: sha256(part) });
    const r = registerSkill(dir, "styled", { "a.md": skill, "b.md": part, "c.md": uses });
    assert.deepEqual(r.ids, [sha256(skill)]);
    assert.equal(loadEngine(dir).resolve({ name: "Formal Greeting", id: sha256(uses) }).name, "Formal Greeting");
  });

  it("treats the identical contribution again as a no-op", () => {
    const dir = engine();
    registerSkill(dir, "greeting", { "Greeting.md": skill });
    const before = snapshot(dir);
    assert.deepEqual(registerSkill(dir, "greeting", { "Greeting.md": skill }), { ids: [sha256(skill)], written: false });
    assert.equal(snapshot(dir), before);
  });

  const invalid: [string, RegExp, () => [string, string, Record<string, string>]][] = [
    ["bad capability name", /not a capability name/, () => ["skill", "Bad_Name", { "a.md": skill }]],
    ["empty contribution", /at least one Node/, () => ["skill", "empty", {}]],
    ["path escaping the capability", /not a path within/, () => ["skill", "escape", { "../a.md": skill }]],
    ["absolute path", /not a path within/, () => ["skill", "abs", { "/a.md": skill }]],
    ["non-Markdown file", /not a Markdown file/, () => ["skill", "script", { "a.md": skill, "run.sh": "echo hi" }]],
    ["file that is not a Node", /is not a Node/, () => ["skill", "prose", { "a.md": skill, "b.md": "# prose\n" }]],
    ["malformed Node", /not in Form/, () => ["skill", "broken", { "a.md": skill, "b.md": "---\nname: B\n" }]],
    ["untyped Node", /declares no type/, () => ["skill", "untyped", { "a.md": skill, "b.md": node("Loose") }]],
    ["unresolved type", /resolves to no Node/, () => ["skill", "ghost", { "a.md": skill, "b.md": node("B", { name: "Ghost", id: "3".repeat(64) }) }]],
    ["type name mismatch", /is named KAAL Skill/, () => ["skill", "misnamed", { "a.md": node("A", { name: "KAAL Extension", id: f.skill.id }) }]],
    ["no Skill-typed Node", /typed by KAAL Skill/, () => ["skill", "nothing", { "a.md": node("A", f.definition) }]],
    ["Extension in a Skill contribution", /carries no KAAL Extension/, () => ["skill", "mixed", { "a.md": skill, "b.md": extension }]],
    ["Skill in an Extension contribution", /carries no KAAL Skill/, () => ["extension", "mixed", { "a.md": extension, "b.md": skill }]],
    ["no Extension-typed Node", /typed by KAAL Extension/, () => ["extension", "nothing", { "a.md": skill }]],
  ];
  for (const [label, reason, make] of invalid) {
    it(`refuses atomically: ${label}`, () => {
      const dir = engine();
      const before = snapshot(dir);
      const [kind, capability, files] = make();
      assert.throws(() => (kind === "skill" ? registerSkill : registerExtension)(dir, capability, files), reason);
      assert.equal(snapshot(dir), before);
      assert.deepEqual(readdirSync(dir).sort(), ["KAAL-KERNEL.md", "core"]);
    });
  }

  it("refuses a capability already registered with other content", () => {
    const dir = engine();
    registerSkill(dir, "greeting", { "Greeting.md": skill });
    const before = snapshot(dir);
    assert.throws(() => registerSkill(dir, "greeting", { "Greeting.md": node("Greeting", f.skill, "Greet people coldly.\n") }), /already registered/);
    assert.throws(() => registerSkill(dir, "greeting", { "Greeting.md": skill, "More.md": node("More", f.skill) }), /already registered/);
    assert.equal(snapshot(dir), before);
  });

  it("refuses to register into something that is not a bootstrapped Engine", () => {
    const dir = tmp();
    assert.throws(() => registerSkill(dir, "greeting", { "Greeting.md": skill }), /not a bootstrapped Engine/);
    assert.deepEqual(readdirSync(dir), []);
  });
});
