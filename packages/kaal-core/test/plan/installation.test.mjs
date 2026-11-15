// core/C3 planned outer tests: Installation Contract and Agent Realization. Immutable to
// DO and CHECK; core/C4 turns them GREEN. Each title names the contracts it checks
// (plan/installation/*.md). They use kaal-core's public interface only. core/T10-core/T13
// are Core's conformance Test Cases, which Engineering also runs against each instance.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

/** A kaal-core subpath, or the reason the tests are blocked before any behavioural assertion. */
async function subpath(name) {
  try {
    return await import(`kaal-core/${name}`);
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-core exports no ./${name} (${e.code ?? e.message})`);
  }
}

const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const keys = (findings) => findings.map((f) => f.key);

function contract(format) {
  return {
    format,
    capability: "sample",
    version: "0.0.2",
    assets: [
      { name: "hook", source: "assets/pre-push", target: ".githooks/pre-push", kind: "file", executable: true },
      { name: "skill", source: "skills/sample", target: ".agents/skills/sample", kind: "directory" },
    ],
    catalogue: { ".githooks/pre-push": [sha("hook 0.0.2")], ".agents/skills/sample/SKILL.md": [sha("skill 0.0.2")] },
    record: ".kaal/state/sample/installation.json",
    runtime: { node: 24 },
    provides: [{ skill: "sample" }],
  };
}

const SOURCE = Buffer.from("---\nname: sample\n---\n\n# sample\n\n## Description\n\nResolve a failing Sample verdict: read the check, rerun it, fix the cause.\n\n## Steps\n\nRun the check again.\n");
const SKILL = { name: "sample", files: { "SKILL.md": SOURCE, "references/a.md": Buffer.from("A\n") } };
const CANON = ".agents/skills/sample/";
const paths = (entries) => entries.map((e) => (typeof e === "string" ? e : e.path)).sort();

describe("Installation Contract (core/C3)", () => {
  it("core/T10 [core/F9, core/F10, core/F11, core/F12, core/F13]: a minimal conforming contract has no findings", async () => {
    const { checkContract, installationFormat } = await subpath("installation");
    const format = installationFormat();
    assert.deepEqual(Object.keys(format).sort(), ["id", "name"]);
    assert.equal(format.name, "Installation Contract");
    assert.deepEqual(checkContract(contract(format)), []);
  });

  it("core/T11 [core/F15]: an unknown or missing member, or a value of the wrong kind, is refused and named", async () => {
    const { checkContract, installationFormat } = await subpath("installation");
    const base = contract(installationFormat());
    const { record, ...noRecord } = base;
    const cases = [
      [{ ...base, extra: 1 }, "extra"],
      [noRecord, "record"],
      [{ ...base, version: 2 }, "version"],
      [{ ...base, format: { name: "Installation Contract", id: "0".repeat(64) } }, "format"],
      [{ ...base, assets: [{ ...base.assets[0], kind: "link" }, base.assets[1]] }, "assets.0.kind"],
      [{ ...base, assets: [base.assets[0], { ...base.assets[1], rules: "overwrite" }] }, "assets.1.rules"],
    ];
    for (const [c, key] of cases) assert.ok(keys(checkContract(c)).includes(key), `${key}: ${JSON.stringify(keys(checkContract(c)))}`);
  });

  it("core/T12 [core/F10, core/F11]: a target that is not repository-relative, a catalogue entry for no asset, or a digest that is not SHA-256, is refused", async () => {
    const { checkContract, installationFormat } = await subpath("installation");
    const base = contract(installationFormat());
    for (const target of ["/abs/pre-push", "../pre-push", "C:/pre-push", ".githooks\\pre-push"]) {
      assert.ok(keys(checkContract({ ...base, assets: [{ ...base.assets[0], target }, base.assets[1]] })).includes("assets.0.target"), target);
    }
    assert.ok(keys(checkContract({ ...base, catalogue: { ...base.catalogue, "elsewhere/x.md": [sha("x")] } })).some((k) => k.startsWith("catalogue")));
    assert.ok(keys(checkContract({ ...base, catalogue: { ".githooks/pre-push": ["abc"] } })).some((k) => k.startsWith("catalogue")));
  });

  it("core/T13 [core/F14]: provides naming a location instead of a Skill is refused", async () => {
    const { checkContract, installationFormat } = await subpath("installation");
    const base = contract(installationFormat());
    for (const provides of [[{ skill: ".claude/skills/sample" }], [{ path: ".agents/skills/sample" }]]) {
      assert.ok(keys(checkContract({ ...base, provides })).some((k) => k.startsWith("provides")), JSON.stringify(provides));
    }
  });
});

describe("Agent Realization (core/C3)", () => {
  it("core/T14 [core/F16]: providers are declared in .kaal/config/core/agents.json, and with none declared a Skill is deployed only to .agents/skills/<name>/", async () => {
    const { declaration, realize } = await subpath("agent");
    assert.equal(declaration, ".kaal/config/core/agents.json");
    const plan = realize({ skills: [SKILL], providers: [], record: {}, present: {} });
    assert.deepEqual(paths(plan.write), [`${CANON}SKILL.md`, `${CANON}references/a.md`]);
    assert.deepEqual([plan.keep, plan.prune, plan.unknown], [[], [], []]);
  });

  it("core/T15 [core/F17]: declaring Claude Code adds a Core-generated copy at .claude/skills/<name>/, from the same source", async () => {
    const { realize } = await subpath("agent");
    const plan = realize({ skills: [SKILL], providers: ["claude-code"], record: {}, present: {} });
    assert.deepEqual(paths(plan.write), [`${CANON}SKILL.md`, `${CANON}references/a.md`, ".claude/skills/sample/SKILL.md", ".claude/skills/sample/references/a.md"].sort());
    const bytes = Object.fromEntries(plan.write.map((w) => [w.path, Buffer.from(w.bytes).toString("utf8")]));
    assert.equal(bytes[".claude/skills/sample/SKILL.md"], bytes[`${CANON}SKILL.md`]);
  });

  it("core/T16 [core/F17]: a provider the placement table does not know is unknown, and no path is planned for it", async () => {
    const { realize } = await subpath("agent");
    const plan = realize({ skills: [SKILL], providers: ["acme-agent"], record: {}, present: {} });
    assert.deepEqual(plan.unknown, ["acme-agent"]);
    assert.ok(paths(plan.write).every((p) => p.startsWith(CANON)));
  });

  it("core/T17 [core/F18, core/F22]: upgrade rewrites unmodified files, keeps and reports modified ones, and prunes only what Core deployed", async () => {
    const { realize } = await subpath("agent");
    const old = Buffer.from(SOURCE.toString("utf8").replace("rerun it", "run it"));
    const p = (f) => `${CANON}${f}`;
    const record = { [p("SKILL.md")]: sha(old), [p("references/a.md")]: sha("A\n"), [p("references/old.md")]: sha("O\n"), [p("references/edited.md")]: sha("E\n") };
    const present = { ...record, [p("references/a.md")]: sha("changed\n"), [p("references/edited.md")]: sha("edited\n"), [p("references/mine.md")]: sha("M\n"), [p("references/b.md")]: sha("theirs\n") };
    const skill = { name: "sample", files: { ...SKILL.files, "references/new.md": Buffer.from("N\n"), "references/b.md": Buffer.from("B\n") } };
    const plan = realize({ skills: [skill], providers: [], record, present });
    assert.deepEqual(paths(plan.write), [p("SKILL.md"), p("references/new.md")].sort());
    assert.deepEqual(paths(plan.keep), [p("references/a.md"), p("references/b.md"), p("references/edited.md")].sort());
    assert.deepEqual(paths(plan.prune), [p("references/old.md")]);
    assert.ok(plan.keep.every((k) => typeof k.reason === "string" && k.reason.length > 0));
  });

  it("core/T18 [core/F20]: no plan writes an instruction file, and a pointer names the canonical path and is never circular", async () => {
    const { realize } = await subpath("agent");
    for (const providers of [[], ["claude-code"], ["codex"], ["copilot"], ["acme-agent"]]) {
      const plan = realize({ skills: [SKILL], providers, record: {}, present: {} });
      for (const path of [...paths(plan.write), ...paths(plan.prune)]) {
        assert.ok(/^\.(agents|claude)\/skills\/sample\//.test(path), `${providers}: ${path}`);
        assert.ok(!/(^|\/)(AGENTS|CLAUDE)\.md$/.test(path), path);
      }
      for (const pointer of plan.pointers) {
        assert.equal(pointer.target, `${CANON}SKILL.md`);
        assert.ok(!pointer.target.startsWith(".claude/"));
      }
    }
  });

  it("core/T20 [core/N4]: the same inputs give the same plan", async () => {
    const { realize } = await subpath("agent");
    const input = () => ({ skills: [SKILL], providers: ["claude-code", "codex"], record: {}, present: {} });
    assert.deepEqual(realize(input()), realize(input()));
  });
});

describe("Installation boundaries (core/C3)", () => {
  it("core/T21 [core/N4, core/A5, core/A6]: kaal-core/installation and kaal-core/agent import no host module", async () => {
    await subpath("installation");
    await subpath("agent");
    const seen = new Set();
    const host = [];
    const visit = (url) => {
      if (seen.has(url)) return;
      seen.add(url);
      const source = readFileSync(new URL(url), "utf8");
      const imports = /\bfrom\s+["']([^"']+)["']|\bimport\s*\(\s*["']([^"']+)["']\s*\)|\bimport\s+["']([^"']+)["']/g;
      for (const [, staticSpec, dynamicSpec, bareSpec] of source.matchAll(imports)) {
        const spec = staticSpec ?? dynamicSpec ?? bareSpec;
        if (spec.startsWith("node:") || spec === "@kaihacksai/kaal-hosting" || spec.startsWith("@kaihacksai/kaal-hosting/")) host.push(spec);
        else if (spec.startsWith(".")) visit(new URL(spec, url).href);
        else visit(import.meta.resolve(spec, url));
      }
    };
    visit(import.meta.resolve("kaal-core/installation"));
    visit(import.meta.resolve("kaal-core/agent"));
    assert.deepEqual(host, []);
  });

  it("core/T22 [core/N6, core/F18]: Core claims only what it deployed, and keeps a consumer's own file at a supplier location", async () => {
    const { realize } = await subpath("agent");
    const own = ".claude/skills/sample/SKILL.md";
    const other = ".claude/skills/theirs/SKILL.md";
    const present = { [own]: sha("the consumer's own\n"), [other]: sha("another of theirs\n") };
    const plan = realize({ skills: [SKILL], providers: ["claude-code"], record: {}, present });
    assert.ok(!paths(plan.write).includes(own), "a consumer's file is never written over");
    assert.ok(paths(plan.keep).includes(own), "a consumer's file at a deployment target is kept and reported");
    assert.ok(plan.keep.every((k) => typeof k.reason === "string" && k.reason.length > 0));
    assert.ok(![...paths(plan.write), ...paths(plan.prune), ...paths(plan.keep)].includes(other), "Core plans nothing for a file it never deployed");
    assert.deepEqual(plan.prune, []);
  });
});
