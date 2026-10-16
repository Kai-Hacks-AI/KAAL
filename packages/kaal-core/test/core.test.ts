import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
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
  kernel: "6122198d786686964863a8c81237fb30d0a2e29c1efe7473c366c7c20791b20b",
  node: "c9097c4ff01faeb44847b89e21319f0dc4adfd4945437af071141995e31b4663",
  definition: "a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2",
  skill: "4e01b2d4da8bbaea7c73eb1a02a4f5e898f7a4154a0186c16cedfd1ef9a53933",
  extension: "f72271c291ef6f15a7bea234111616e5213af57160daa11d0db1045e83267a94",
};

function node(name: string, type?: Ref, body = `# ${name}\n`): string {
  return `---\nname: ${name}\n${type ? `type:\n  name: ${type.name}\n  id: ${type.id}\n` : ""}---\n\n${body}`;
}

function tmp(): string {
  return mkdtempSync(join(tmpdir(), "kaal-core-test-"));
}

async function engine(): Promise<string> {
  const dir = join(tmp(), ".kaal");
  await bootstrap(dir);
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

/**
 * Move every file of an Engine to another directory and filename, keeping its
 * exact bytes and dropping the packaged `core/`, `skills/` and `extensions/`
 * layout. Returns the moves, in path order.
 */
function rearrange(dir: string): { from: string; to: string }[] {
  const moves = Object.keys(readTree(dir))
    .sort()
    .map((from, i) => ({ from, to: `moved/${String.fromCharCode(97 + (i % 3))}/${i}.${from.endsWith(".md") ? "md" : "txt"}` }));
  for (const { from, to } of moves) {
    mkdirSync(dirname(join(dir, to)), { recursive: true });
    renameSync(join(dir, from), join(dir, to));
  }
  for (const top of ["core", "skills", "extensions"]) rmSync(join(dir, top), { recursive: true, force: true });
  return moves;
}

describe("identity", () => {
  it("is the SHA-256 of exact bytes, and the foundation is deterministic", async () => {
    assert.deepEqual(
      { kernel: f.kernel, node: f.node.id, definition: f.definition.id, skill: f.skill.id, extension: f.extension.id },
      PINNED,
    );
    for (const [path, bytes] of Object.entries(payload())) if (path.startsWith("core/")) assert.equal(identify(bytes).id, sha256(bytes));
  });

  it("carries exactly five foundational documents and the Engine's AGENTS.md, neither the Kernel nor AGENTS.md a Node", async () => {
    const files = payload();
    assert.deepEqual(Object.keys(files).sort(), ["AGENTS.md", "KAAL-KERNEL.md", "core/KAAL-Definition.md", "core/KAAL-Extension.md", "core/KAAL-Skill.md", "core/Node.md"]);
    assert.throws(() => identify(files["KAAL-KERNEL.md"]));
    assert.throws(() => identify(files["AGENTS.md"]));
    assert.equal(evaluate(files).nodes.length, 4);
  });

  it("does not depend on filename or location", async () => {
    const bytes = Buffer.from(node("Thing", f.definition));
    const a = evaluate({ ...payload(), "x/a.md": bytes });
    const b = evaluate({ ...payload(), "deep/er/b.md": bytes });
    assert.equal(a.named("Thing")[0].id, b.named("Thing")[0].id);
  });

  it("changes with any byte", async () => {
    assert.notEqual(identify(Buffer.from(node("A", f.node))).id, identify(Buffer.from(node("A", f.node) + " ")).id);
  });

  it("reads the Form strictly", async () => {
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
  it("resolves types and references by name and identity", async () => {
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

  it("admits a chain of types and rejects what does not resolve", async () => {
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

  it("allows several Nodes with one name, distinguished by id", async () => {
    const one = node("Twin", f.definition, "one\n");
    const two = node("Twin", f.definition, "two\n");
    const e = evaluate({ ...payload(), "1.md": Buffer.from(one), "2.md": Buffer.from(two) });
    assert.equal(e.named("Twin").length, 2);
    assert.equal(e.resolve({ name: "Twin", id: sha256(two) }).paths[0], "2.md");
  });

  it("admits nothing without Core's genesis Node", async () => {
    const files = payload();
    delete files["core/Node.md"];
    assert.equal(evaluate(files).nodes.length, 0);
  });
});

describe("bootstrap and verify", () => {
  it("materializes and verifies a fresh Engine, idempotently", async () => {
    const dir = join(tmp(), ".kaal");
    assert.equal((await bootstrap(dir)).length, 6);
    assert.deepEqual(await bootstrap(dir), []);
    const v = await verify(dir);
    assert.deepEqual(v.problems, []);
    assert.ok(v.ok);
  });

  it("leaves a valid but rearranged Engine untouched", async () => {
    const dir = await engine();
    rearrange(dir);
    assert.ok((await verify(dir)).ok, (await verify(dir)).problems.join("\n"));
    const before = snapshot(dir);
    assert.deepEqual(await bootstrap(dir), []);
    assert.equal(snapshot(dir), before);
    assert.ok(!existsSync(join(dir, "core")), "no packaged layout was added back");
  });

  it("refuses an existing directory that is not a valid Engine, writing nothing", async () => {
    const changed = await engine();
    writeFileSync(join(changed, "core", "KAAL-Skill.md"), "changed");
    const partial = await engine();
    rmSync(join(partial, "core", "KAAL-Extension.md"));
    const unrelated = join(tmp(), ".kaal");
    mkdirSync(unrelated);
    writeFileSync(join(unrelated, "notes.txt"), "someone else's directory");
    for (const dir of [changed, partial, unrelated]) {
      const before = snapshot(dir);
      await assert.rejects(() => bootstrap(dir), /not a valid Engine; nothing was written/);
      assert.equal(snapshot(dir), before);
    }
  });

  it("bootstraps an empty existing directory in place, never removing or replacing it", async () => {
    const dir = join(tmp(), ".kaal");
    mkdirSync(dir);
    const cwd = process.cwd();
    process.chdir(dir);
    try {
      assert.equal((await bootstrap(".")).length, 6);
      assert.deepEqual(Object.keys(readTree(".")).sort(), Object.keys(payload()).sort(), "the current directory still holds the Engine");
    } finally {
      process.chdir(cwd);
    }
    assert.ok((await verify(dir)).ok);
  });

  it("reports what is wrong with an Engine", async () => {
    const dir = await engine();
    writeFileSync(join(dir, "KAAL-KERNEL.md"), "edited");
    writeFileSync(join(dir, "stray.md"), node("Stray", { name: "Nothing", id: "2".repeat(64) }));
    const v = await verify(dir);
    assert.equal(v.ok, false);
    assert.equal(v.problems.length, 2);
    assert.ok(v.problems.some((p) => p.includes("Kernel")));
    assert.ok(v.problems.some((p) => p.startsWith("stray.md")));
    assert.equal((await verify(join(tmp(), "nowhere"))).ok, false);
    const file = join(tmp(), "a-file");
    writeFileSync(file, "not a directory");
    const v2 = await verify(file);
    assert.equal(v2.ok, false);
    assert.equal(v2.engine.nodes.length, 0);
  });

  it("keeps identity, type resolution and discovery when Node files are moved and renamed", async () => {
    const dir = await engine();
    const skill = node("Greeting", f.skill, "Greet people warmly.\n");
    const extension = node("Clock", f.extension, "Tell the time.\n");
    await registerSkill(dir, "greeting", { "Greeting.md": skill });
    await registerExtension(dir, "clock", { "Clock.md": extension });
    const before = (await loadEngine(dir)).nodes.map(({ id, name, type }) => ({ id, name, type }));
    const caps = await capabilities(dir);
    const moves = rearrange(dir);
    assert.ok(moves.length >= 7);
    for (const { from, to } of moves) assert.ok(!existsSync(join(dir, from)) && existsSync(join(dir, to)), `${from} -> ${to}`);
    const after = await loadEngine(dir);
    assert.deepEqual(after.nodes.map(({ id, name, type }) => ({ id, name, type })), before);
    assert.deepEqual(after.resolve(f.skill).paths, [moves.find((m) => m.from === "core/KAAL-Skill.md")!.to]);
    assert.deepEqual(after.resolve({ name: "Greeting", id: sha256(skill) }).type, f.skill);
    assert.deepEqual(await capabilities(dir), caps);
    assert.ok((await verify(dir)).ok, (await verify(dir)).problems.join("\n"));
  });

  it("reserves no name inside an Engine: Hosting stages beside it, so every file is scanned", async () => {
    const greeting = node("Greeting", f.skill, "Greet people warmly.\n");
    const moved = await engine();
    writeFileSync(join(moved, ".staging-greeting.md"), greeting);
    assert.deepEqual((await capabilities(moved)).skills, [{ name: "Greeting", id: sha256(greeting) }]);
    const left = await engine();
    mkdirSync(join(left, ".staging-left"));
    writeFileSync(join(left, ".staging-left", "Broken.md"), "---\nname: Broken\n");
    assert.deepEqual((await verify(left)).problems, [".staging-left/Broken.md: not in Form: a Node begins with frontmatter of `name` and optionally `type` (`name`, `id`), LF line endings"]);
    const dir = await engine();
    await registerSkill(dir, "greeting", { "Greeting.md": greeting });
    assert.deepEqual(readdirSync(dirname(dir)), [".kaal"], "nothing is left beside the Engine");
    assert.deepEqual(readdirSync(dir).sort(), ["AGENTS.md", "KAAL-KERNEL.md", "core", "skills"], "nothing is left inside it");
  });

  it("exports the foundational payload", async () => {
    const out = join(tmp(), "export");
    assert.equal((await exportPayload(out)).length, 6);
    assert.deepEqual(readTree(out), payload());
    await assert.rejects(() => exportPayload(out), /not an empty directory/);
  });
});

describe("registration", () => {
  const skill = node("Greeting", f.skill, "Greet people warmly.\n");
  const extension = node("Clock", f.extension, "Tell the time.\n");

  it("registers a valid Skill and Extension and enumerates them", async () => {
    const dir = await engine();
    const s = await registerSkill(dir, "kaal-greeting", { "Greeting.md": skill });
    assert.deepEqual(s, { ids: [sha256(skill)], written: true });
    const x = await registerExtension(dir, "kaal-clock", { "nested/Clock.md": extension });
    assert.deepEqual(x, { ids: [sha256(extension)], written: true });
    assert.deepEqual(await capabilities(dir), {
      skills: [{ name: "Greeting", id: sha256(skill) }],
      extensions: [{ name: "Clock", id: sha256(extension) }],
    });
    assert.equal(readFileSync(join(dir, "skills", "kaal-greeting", "Greeting.md"), "utf8"), skill);
    assert.ok((await verify(dir)).ok);
  });

  it("registers a contribution whose Nodes type each other", async () => {
    const dir = await engine();
    const part = node("Greeting Style", f.definition);
    const uses = node("Formal Greeting", { name: "Greeting Style", id: sha256(part) });
    const r = await registerSkill(dir, "styled", { "a.md": skill, "b.md": part, "c.md": uses });
    assert.deepEqual(r.ids, [sha256(skill)]);
    assert.equal((await loadEngine(dir)).resolve({ name: "Formal Greeting", id: sha256(uses) }).name, "Formal Greeting");
  });

  it("treats the identical contribution again as a no-op", async () => {
    const dir = await engine();
    await registerSkill(dir, "greeting", { "Greeting.md": skill });
    const before = snapshot(dir);
    assert.deepEqual(await registerSkill(dir, "greeting", { "Greeting.md": skill }), { ids: [sha256(skill)], written: false });
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
    it(`refuses atomically: ${label}`, async () => {
      const dir = await engine();
      const before = snapshot(dir);
      const [kind, capability, files] = make();
      await assert.rejects(() => (kind === "skill" ? registerSkill : registerExtension)(dir, capability, files), reason);
      assert.equal(snapshot(dir), before);
      assert.deepEqual(readdirSync(dir).sort(), ["AGENTS.md", "KAAL-KERNEL.md", "core"]);
    });
  }

  it("admits contribution files named like staging directories", async () => {
    const dir = await engine();
    const notes = node("Greeting Notes", f.definition);
    const files = { ".staging-greeting.md": skill, "docs/.staging-v1.md": notes };
    assert.deepEqual(await registerSkill(dir, "greeting", files), { ids: [sha256(skill)], written: true });
    assert.deepEqual((await capabilities(dir)).skills, [{ name: "Greeting", id: sha256(skill) }]);
    assert.ok((await verify(dir)).ok, (await verify(dir)).problems.join("\n"));
  });

  it("registers into a rearranged Engine, found by identity alone", async () => {
    const dir = await engine();
    rearrange(dir);
    assert.deepEqual((await registerSkill(dir, "greeting", { "Greeting.md": skill })).ids, [sha256(skill)]);
    assert.deepEqual((await capabilities(dir)).skills, [{ name: "Greeting", id: sha256(skill) }]);
  });

  it("resolves across contributions by identity, and never acquires what is missing", async () => {
    const style = node("Greeting Style", f.definition);
    const uses = node("Formal Greeting", { name: "Greeting Style", id: sha256(style) });
    const later = { "Formal.md": node("Formal", f.skill), "Uses.md": uses };
    const dir = await engine();
    const before = snapshot(dir);
    await assert.rejects(() => registerSkill(dir, "formal", later), /Uses\.md is not admitted: type Greeting Style .* resolves to no Node/);
    assert.equal(snapshot(dir), before);
    await registerSkill(dir, "styles", { "Style.md": style, "Greeting.md": skill });
    assert.deepEqual((await registerSkill(dir, "formal", later)).written, true);
  });

  it("treats delivery metadata as no part of a contribution", async () => {
    const dir = await engine();
    const before = snapshot(dir);
    const manifest = JSON.stringify({ name: "kaal-greeting", dependencies: { "kaal-styles": "1.0.0" } });
    await assert.rejects(() => registerSkill(dir, "greeting", { "Greeting.md": skill, "package.json": manifest }), /package\.json is not a Markdown file/);
    assert.equal(snapshot(dir), before);
  });

  it("removes its staging and writes nothing when the final write fails", async () => {
    const dir = await engine();
    writeFileSync(join(dir, "skills"), "a file where the skills directory would go");
    const before = snapshot(dir);
    await assert.rejects(() => registerSkill(dir, "greeting", { "Greeting.md": skill }));
    assert.equal(snapshot(dir), before);
    assert.deepEqual(readdirSync(dir).sort(), ["AGENTS.md", "KAAL-KERNEL.md", "core", "skills"]);
  });

  it("refuses a capability already registered with other content", async () => {
    const dir = await engine();
    await registerSkill(dir, "greeting", { "Greeting.md": skill });
    const before = snapshot(dir);
    await assert.rejects(() => registerSkill(dir, "greeting", { "Greeting.md": node("Greeting", f.skill, "Greet people coldly.\n") }), /already registered/);
    await assert.rejects(() => registerSkill(dir, "greeting", { "Greeting.md": skill, "More.md": node("More", f.skill) }), /already registered/);
    assert.equal(snapshot(dir), before);
  });

  it("refuses to register into something that is not a bootstrapped Engine", async () => {
    const dir = tmp();
    await assert.rejects(() => registerSkill(dir, "greeting", { "Greeting.md": skill }), /not a valid Engine/);
    assert.deepEqual(readdirSync(dir), []);
  });

  it("refuses to register into an Engine that does not verify, though its foundation is admitted", async () => {
    const noKernel = await engine();
    rmSync(join(noKernel, "KAAL-KERNEL.md"));
    const malformed = await engine();
    writeFileSync(join(malformed, "broken.md"), "---\nname: Broken\n");
    for (const dir of [noKernel, malformed]) {
      const before = snapshot(dir);
      await assert.rejects(() => registerSkill(dir, "greeting", { "Greeting.md": skill }), /not a valid Engine; nothing was written/);
      assert.equal(snapshot(dir), before);
    }
  });
});

describe("host boundary", () => {
  const skill = node("Greeting", f.skill, "Greet people warmly.\n");
  const SRC = fileURLToPath(new URL("../src/", import.meta.url));

  it("leaves every host mechanic to Hosting: no Core source touches the file system", () => {
    const sources = readdirSync(SRC).filter((p) => p.endsWith(".ts"));
    assert.ok(sources.length >= 7);
    for (const p of sources) assert.doesNotMatch(readFileSync(join(SRC, p), "utf8"), /from "(node:)?fs(\/promises)?"|require\(/, p);
  });

  it("depends at runtime on kaal-hosting alone", () => {
    const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
    assert.deepEqual(pkg.dependencies, { "kaal-hosting": "0.0.1" });
  });

  // In memory, so every case is checked on every host, whatever its file system can hold.
  const unportable: [string, Record<string, string>, string, RegExp][] = [
    ["case", { "Greeting.md": skill, "greeting.md": skill }, "COLLISION", /Greeting\.md and .*greeting\.md|greeting\.md and .*Greeting\.md/],
    ["Unicode normalization", { "Greeting.md": skill, "Caf\u00e9.md": skill, "Cafe\u0301.md": skill }, "COLLISION", /same name where case or Unicode/],
    ["a name Windows cannot hold", { "Greeting.md": skill, "CON.md": skill }, "INVALID_PATH", /not a portable name/],
  ];
  for (const [label, files, code, message] of unportable) {
    it(`refuses through Hosting, writing nothing: ${label}`, async () => {
      const dir = await engine();
      const before = snapshot(dir);
      await assert.rejects(() => registerSkill(dir, "greeting", files), (e: Error & { code?: string }) => e.name === "HostingError" && e.code === code && message.test(e.message));
      assert.equal(snapshot(dir), before);
      assert.deepEqual(readdirSync(dirname(dir)), [".kaal"], "nothing is left beside the Engine");
    });
  }
});
