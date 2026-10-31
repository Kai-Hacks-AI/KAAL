// core/C4 Code tests for kaal-core/installation and kaal-core/agent, beside the planned outer tests in test/plan/.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, it } from "node:test";
import { realize } from "kaal-core/agent";
import { installationConformance } from "kaal-core/conformance";
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

  it("never prunes an instruction file, even one its record holds", () => {
    const path = ".agents/skills/s/AGENTS.md";
    const plan = realize({ skills: [], providers: [], record: { [path]: "a".repeat(64) }, present: { [path]: "a".repeat(64) } });
    assert.deepEqual(plan.prune, []);
    assert.deepEqual(plan.keep.map((k) => k.path), [path]);
  });

  it("reports a target blocked by a file it must keep, and writes nothing beneath it", () => {
    const skill = { name: "s", files: { "SKILL.md": Buffer.from("---\nname: s\n---\n\n## Description\n\nD.\n"), "references/a.md": Buffer.from("A\n") } };
    const theirs = ".agents/skills/s/references";
    const plan = realize({ skills: [skill], providers: [], record: {}, present: { [theirs]: "b".repeat(64) } });
    assert.deepEqual(plan.write.map((w) => w.path), [".agents/skills/s/SKILL.md"]);
    assert.ok(plan.keep.some((k) => k.path === `${theirs}/a.md` && k.reason.includes(theirs)));
    assert.equal(plan.record[`${theirs}/a.md`], undefined);
    const pruned = realize({ skills: [skill], providers: [], record: { [theirs]: "b".repeat(64) }, present: { [theirs]: "b".repeat(64) } });
    assert.deepEqual(pruned.prune, [theirs], "an unmodified file Core deployed is pruned, and no longer blocks");
    assert.ok(pruned.write.some((w) => w.path === `${theirs}/a.md`));
  });

  it("refuses a Skill name or file path that would place a deployment outside its Skill", () => {
    const files = { "SKILL.md": Buffer.from("---\nname: s\n---\n\n## Description\n\nD.\n") };
    for (const skills of [[{ name: "s", files: { ...files, "AGENTS.md": Buffer.from("x") } }], [{ name: "s", files: { ...files, "docs/CLAUDE.md": Buffer.from("x") } }], [{ name: "../s", files }], [{ name: "s", files: { ...files, "../x.md": Buffer.from("x") } }], [{ name: "s", files }, { name: "s", files }]])
      assert.throws(() => realize({ skills, providers: [], record: {}, present: {} }), TypeError);
  });
});

describe("kaal-core/conformance", () => {
  const contract = {
    format: installationFormat(),
    capability: "elsewhere",
    version: "1.0.0",
    assets: [
      { name: "docs", source: "docs", target: "elsewhere", kind: "directory" },
      { name: "probe", source: "probe.md", target: "conformance-probe-0/conformance-probe.md", kind: "file" },
    ],
    catalogue: { "elsewhere/guide.md": ["a".repeat(64)], "conformance-probe-0/conformance-probe.md": ["b".repeat(64)] },
    record: ".kaal/state/elsewhere/installation.json",
    runtime: { node: 24 },
    provides: [],
  };

  it("probes the catalogue with a path no asset owns, whatever targets the instance declares", () => {
    assert.deepEqual(checkContract(contract), []);
    assert.deepEqual(installationConformance(contract).map((r) => [r.id, r.holds, r.failures]), [
      ["core/T10", true, []],
      ["core/T11", true, []],
      ["core/T12", true, []],
      ["core/T13", true, []],
    ]);
  });

  it("fails core/T12 under a check that accepts invalid digests, with every other catalogue entry kept", () => {
    const lax = (c: unknown) => checkContract(c).filter((f) => f.rule !== "sha256");
    const t12 = installationConformance(contract, lax).find((r) => r.id === "core/T12");
    assert.deepEqual(t12, { id: "core/T12", holds: false, failures: ["catalogue digest: not refused"] });
  });
});
