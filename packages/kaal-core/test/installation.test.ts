// core/C4 Code tests for kaal-core/installation and kaal-core/agent, beside the planned outer tests in test/plan/.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, it } from "node:test";
import { realize, renderSkill } from "kaal-core/agent";
import { checkContract, installationFormat } from "kaal-core/installation";
import { evaluate, foundation, payload } from "kaal-core";

const sha = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");

describe("Installation Contract and Agent Realization Definitions", () => {
  it("installationFormat() names the carried Installation Contract Definition by its exact bytes", () => {
    assert.deepEqual(installationFormat(), { name: "Installation Contract", id: sha(payload()["core/Installation-Contract.md"]) });
  });

  it("both Definitions are admitted, each typed by KAAL Definition", () => {
    const engine = evaluate(payload());
    for (const name of ["Installation Contract", "Agent Realization"]) {
      const node = engine.nodes.find((n) => n.name === name);
      assert.deepEqual(node?.type, foundation().definition, name);
    }
    assert.deepEqual(engine.rejected, []);
  });
});

describe("kaal-core/installation", () => {
  it("requires a catalogue entry for every file asset and for each directory asset", () => {
    const contract = {
      format: installationFormat(),
      capability: "sample",
      version: "0.0.2",
      assets: [
        { name: "hook", source: "assets/pre-push", target: ".githooks/pre-push", kind: "file" },
        { name: "skill", source: "skills/sample", target: ".agents/skills/sample", kind: "directory" },
      ],
      catalogue: {},
      record: ".kaal/state/sample/installation.json",
      runtime: { node: 24 },
      provides: [],
    };
    assert.deepEqual(checkContract(contract), [
      { key: "catalogue..githooks/pre-push", rule: "missing" },
      { key: "catalogue..agents/skills/sample", rule: "missing" },
    ]);
  });
});

describe("kaal-core/agent", () => {
  it("records the SHA-256 the host computes for every file it writes, at every padding boundary", () => {
    const files: Record<string, Uint8Array> = { "SKILL.md": Buffer.from("---\nname: s\n---\n\n## Description\n\nD.\n") };
    for (const size of [0, 1, 55, 56, 63, 64, 65, 119, 120, 1000, 70_000]) files[`f${size}`] = Uint8Array.from({ length: size }, (_, i) => (i * 31 + size) & 0xff);
    const plan = realize({ skills: [{ name: "s", files }], providers: [], record: {}, present: {} });
    assert.equal(plan.write.length, Object.keys(files).length);
    for (const w of plan.write) assert.equal(plan.record[w.path], sha(w.bytes), w.path);
  });

  it("renders a multi-line Description verbatim, keeps subsections in the body, and drops every other frontmatter key", () => {
    const source = Buffer.from("---\nname: s\nowner: guard/C1\n---\n\n## Description\n\nFirst line.\nSecond: line.\n\n### Detail\n\nMore.\n\n## Steps\n\nGo.\n");
    const text = Buffer.from(renderSkill(source)).toString("utf8");
    assert.ok(text.startsWith('---\nname: "s"\ndescription: "First line.\\nSecond: line.\\n\\n### Detail\\n\\nMore."\n---\n'), text);
    assert.ok(text.endsWith("## Steps\n\nGo.\n"));
    assert.throws(() => renderSkill(Buffer.from("---\nowner: x\n---\n\n## Description\n\nD.\n")), /name/);
  });

  it("never prunes an instruction file, even one its record holds", () => {
    const path = ".agents/skills/s/AGENTS.md";
    const plan = realize({ skills: [], providers: [], record: { [path]: "a".repeat(64) }, present: { [path]: "a".repeat(64) } });
    assert.deepEqual(plan.prune, []);
    assert.deepEqual(plan.keep.map((k) => k.path), [path]);
  });

  it("refuses a Skill name or file path that would place a deployment outside its Skill", () => {
    const files = { "SKILL.md": Buffer.from("---\nname: s\n---\n\n## Description\n\nD.\n") };
    for (const skills of [[{ name: "s", files: { ...files, "AGENTS.md": Buffer.from("x") } }], [{ name: "s", files: { ...files, "docs/CLAUDE.md": Buffer.from("x") } }], [{ name: "../s", files }], [{ name: "s", files: { ...files, "../x.md": Buffer.from("x") } }], [{ name: "s", files }, { name: "s", files }]])
      assert.throws(() => realize({ skills, providers: [], record: {}, present: {} }), TypeError);
  });
});
