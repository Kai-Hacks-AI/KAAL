// core/C10 planned outer tests: the Installation record and cross-installer interoperability.
// Immutable to DO and CHECK; core/C13 turns them GREEN. Each title names the contracts it checks
// (plan/record/*.md). They use kaal-core's public interface only.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

/** kaal-core/installation with the record functions, or the reason the tests are blocked before any behavioural assertion. */
async function installation() {
  let m;
  try {
    m = await import("kaal-core/installation");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-core exports no ./installation (${e.code ?? e.message})`);
  }
  for (const name of ["checkRecord", "register"]) {
    if (typeof m[name] !== "function") assert.fail(`blocked before behavioural assertion: kaal-core/installation exports no ${name}`);
  }
  return m;
}

const sha = (text) => createHash("sha256").update(text).digest("hex");
const keys = (findings) => findings.map((f) => f.key);
/** Whether a finding names `member`, or a member inside it, such as `assets.0.surface` inside `assets`. */
const names = (findings, member) => keys(findings).some((k) => k === member || k.startsWith(`${member}.`));

function contract(format) {
  return {
    format,
    capability: "sample",
    version: "0.0.2",
    assets: [
      { name: "hook", source: "assets/pre-push", target: ".githooks/pre-push", kind: "file", executable: true, surface: "hook" },
      { name: "skill", source: "skills/sample", target: ".agents/skills/sample", kind: "directory" },
    ],
    catalogue: { ".githooks/pre-push": [sha("hook 0.0.2")], ".agents/skills/sample/SKILL.md": [sha("skill 0.0.2")] },
    record: ".kaal/state/sample/installation.json",
    runtime: { node: 24 },
    provides: [{ skill: "sample" }],
  };
}

const SKILL_MD = ".agents/skills/sample/SKILL.md";
const REF = ".agents/skills/sample/references/a.md";

const entry = (text, version) => ({ sha256: sha(text), version });

function record() {
  return {
    activated: ["hook"],
    assets: { ".githooks/pre-push": entry("hook 0.0.1", "0.0.1"), [SKILL_MD]: entry("skill 0.0.1", "0.0.1") },
  };
}

const SOURCE = Buffer.from("---\nname: sample\n---\n\n# sample\n\n## Description\n\nResolve a failing Sample verdict: read the check, rerun it, fix the cause.\n");
const SKILL = { name: "sample", files: { "SKILL.md": SOURCE, "references/a.md": Buffer.from("A\n") } };
const paths = (entries) => entries.map((e) => (typeof e === "string" ? e : e.path)).sort();

describe("Installation record (core/C10)", () => {
  it("core/T32 [core/F33, core/F38]: a record with assets and the Capability's own members has no findings", async () => {
    const { checkRecord } = await installation();
    assert.deepEqual(checkRecord(record()), []);
    assert.deepEqual(checkRecord({ assets: {} }), []);
  });

  it("core/T33 [core/F33, core/F38]: a malformed record is refused, and the finding names the member", async () => {
    const { checkRecord } = await installation();
    const { assets, ...noAssets } = record();
    const cases = [
      [noAssets, "assets"],
      [{ assets: { [SKILL_MD]: { sha256: sha("x") } } }, "assets"],
      [{ assets: { [SKILL_MD]: { version: "0.0.1" } } }, "assets"],
      [{ assets: { [SKILL_MD]: { sha256: "not a digest", version: "0.0.1" } } }, "assets"],
      [{ assets: { [SKILL_MD]: { ...entry("x", "0.0.1"), extra: 1 } } }, "assets"],
      [{ assets: { "/etc/passwd": entry("x", "0.0.1") } }, "assets"],
      [{ assets: { "../outside": entry("x", "0.0.1") } }, "assets"],
    ];
    for (const [value, member] of cases) assert.ok(names(checkRecord(value), member), `${JSON.stringify(value)} names ${member}`);
    assert.notDeepEqual(checkRecord([]), []);
  });

  it("core/T34 [core/F34]: register adds what Core wrote with the contract's version, creates a missing record, and keeps every other entry and member", async () => {
    const { register, installationFormat } = await installation();
    const c = contract(installationFormat());
    const written = { [SKILL_MD]: sha("skill 0.0.2"), [REF]: sha("A\n") };
    assert.deepEqual(register({ contract: c, record: undefined, written }), {
      assets: { [SKILL_MD]: entry("skill 0.0.2", "0.0.2"), [REF]: entry("A\n", "0.0.2") },
    });
    const before = record();
    const next = register({ contract: c, record: before, written });
    assert.deepEqual(before, record(), "the input record is not changed");
    assert.deepEqual(next.activated, ["hook"]);
    assert.deepEqual(next.assets[".githooks/pre-push"], entry("hook 0.0.1", "0.0.1"));
    assert.deepEqual(next.assets[SKILL_MD], entry("skill 0.0.2", "0.0.2"));
    assert.deepEqual(next.assets[REF], entry("A\n", "0.0.2"));
    assert.deepEqual(Object.keys(next).sort(), ["activated", "assets"], "Core adds no member of its own");
  });

  it("core/T35 [core/F35]: register never registers a path Core did not write, or a path that is no asset of the contract", async () => {
    const { register, installationFormat } = await installation();
    const c = contract(installationFormat());
    const next = register({ contract: c, record: undefined, written: { [SKILL_MD]: sha("skill 0.0.2"), ".claude/skills/sample/SKILL.md": sha("x"), "README.md": sha("y") } });
    assert.deepEqual(Object.keys(next.assets), [SKILL_MD]);
    assert.ok(!(REF in next.assets), "a file Core did not write is not registered");
  });
});

describe("Cross-installer realization (core/C10)", () => {
  it("core/T36 [core/F36]: for a contracted Skill, Core's own record holds only provider deployments", async () => {
    await installation();
    const { realize } = await import("kaal-core/agent");
    const fresh = realize({ skills: [SKILL], providers: ["claude-code"], record: {}, present: {}, contracted: [{ skill: "sample", registered: false }] });
    assert.ok(paths(fresh.write).includes(SKILL_MD), "an unregistered canonical asset is written");
    assert.deepEqual(Object.keys(fresh.record).filter((p) => !p.startsWith(".claude/skills/sample/")), []);
    const present = { [SKILL_MD]: sha("skill 0.0.1") };
    const owned = realize({ skills: [SKILL], providers: ["claude-code"], record: {}, present, contracted: [{ skill: "sample", registered: true }] });
    assert.ok(paths(owned.write).every((p) => p.startsWith(".claude/skills/sample/")), "a registered canonical asset is not rewritten");
    assert.ok(![...paths(owned.prune), ...paths(owned.keep)].includes(SKILL_MD), "Core plans nothing for the Capability's own file");
    assert.deepEqual(Object.keys(owned.record).filter((p) => !p.startsWith(".claude/skills/sample/")), []);
  });

  it("core/T37 [core/F37]: a surface-gated asset is accepted by checkContract and never appears in a plan", async () => {
    const { checkContract, installationFormat, register } = await installation();
    const c = contract(installationFormat());
    assert.deepEqual(checkContract(c), []);
    assert.ok(names(checkContract({ ...c, assets: [{ ...c.assets[0], surface: 7 }, c.assets[1]] }), "assets.0.surface"));
    const next = register({ contract: c, record: undefined, written: { ".githooks/pre-push": sha("hook 0.0.2"), [SKILL_MD]: sha("skill 0.0.2") } });
    assert.ok(!(".githooks/pre-push" in next.assets), "Core never registers a surface-gated asset");
  });

  it("core/T38 [core/N10]: the same inputs give the same record, and the record functions import no host module", async () => {
    const { register, installationFormat } = await installation();
    const input = () => ({ contract: contract(installationFormat()), record: record(), written: { [SKILL_MD]: sha("skill 0.0.2") } });
    assert.deepEqual(register(input()), register(input()));
    const source = readFileSync(new URL(import.meta.resolve("kaal-core/installation")), "utf8");
    assert.ok(!/from\s+["'](node:|@kaihacksai\/kaal-hosting)/.test(source), "kaal-core/installation imports no host module");
  });
});
