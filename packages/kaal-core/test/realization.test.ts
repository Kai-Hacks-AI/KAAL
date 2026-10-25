// core/C13 Code tests for kaal-core/realization: Core's plans applied through Hosting (core/A7),
// with the Capability's record kept as core/C10 planned it (core/F33–core/F37).
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, it } from "node:test";
import { renderSkill } from "kaal-core/agent";
import { installationFormat } from "kaal-core/installation";
import { realizeIn, record as CORE_RECORD } from "kaal-core/realization";

const sha = (bytes: Uint8Array | string) => createHash("sha256").update(bytes).digest("hex");
const VERSION = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version;

const SOURCE = Buffer.from("---\nname: sample\n---\n\n# sample\n\n## Description\n\nResolve a failing Sample verdict.\n");
const SKILL = { name: "sample", files: { "SKILL.md": SOURCE, "references/a.md": Buffer.from("A\n") } };
const RENDERED = Buffer.from(renderSkill(SOURCE));
const RECORD = ".kaal/state/sample/installation.json";

const contract = () => ({
  format: installationFormat(),
  capability: "sample",
  version: "0.0.2",
  assets: [
    { name: "hook", source: "assets/pre-push", target: ".githooks/pre-push", kind: "file", surface: "hook" },
    { name: "skill", source: "skills/sample", target: ".agents/skills/sample", kind: "directory" },
  ],
  catalogue: { ".githooks/pre-push": [sha("hook")], ".agents/skills/sample/SKILL.md": [sha(RENDERED)] },
  record: RECORD,
  runtime: { node: 24 },
  provides: [{ skill: "sample" }],
});

const roots: string[] = [];
afterEach(() => {
  for (const r of roots.splice(0)) rmSync(r, { recursive: true, force: true });
});

function repo(files: Record<string, string | Buffer> = {}): string {
  const root = mkdtempSync(join(tmpdir(), "kaal-c13-"));
  roots.push(root);
  for (const [path, bytes] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), bytes);
  }
  return root;
}

const json = (root: string, path: string) => JSON.parse(readFileSync(join(root, path), "utf8"));
const at = (root: string, path: string) => readFileSync(join(root, path));
const claude = '{ "providers": ["claude-code"] }\n';

describe("Hosting application (core/C13)", () => {
  it("deploys a Skill no contract delivers, records it in Core's record with Core's version, and a second run changes nothing", async () => {
    const root = repo();
    const first = await realizeIn(root, { skills: [SKILL] });
    assert.deepEqual(at(root, ".agents/skills/sample/SKILL.md"), RENDERED);
    assert.deepEqual(first.records, [CORE_RECORD]);
    assert.deepEqual(json(root, CORE_RECORD), {
      assets: {
        ".agents/skills/sample/SKILL.md": { sha256: sha(RENDERED), version: VERSION },
        ".agents/skills/sample/references/a.md": { sha256: sha("A\n"), version: VERSION },
      },
    });
    const again = await realizeIn(root, { skills: [SKILL] });
    assert.deepEqual(again.records, []);
    assert.ok(again.outcomes.every((o) => o.outcome === "unchanged"));
    assert.ok(again.outcomes.some((o) => o.path === CORE_RECORD), "Core's record is guarded even when it does not change");
  });

  it("registers the canonical asset it writes in the Capability's record, keeps the Capability's members, and records only provider deployments as Core's", async () => {
    const root = repo({ ".kaal/config/core/agents.json": claude, [RECORD]: JSON.stringify({ activated: ["hook"], assets: {} }) });
    const done = await realizeIn(root, { skills: [SKILL], contracts: [contract()] });
    assert.deepEqual(done.records, [CORE_RECORD, RECORD].sort());
    assert.deepEqual(json(root, RECORD), {
      activated: ["hook"],
      assets: {
        ".agents/skills/sample/SKILL.md": { sha256: sha(RENDERED), version: "0.0.2" },
        ".agents/skills/sample/references/a.md": { sha256: sha("A\n"), version: "0.0.2" },
      },
    });
    assert.deepEqual(Object.keys(json(root, CORE_RECORD).assets), [".claude/skills/sample/SKILL.md", ".claude/skills/sample/references/a.md"]);
    assert.ok(!existsSync(join(root, ".githooks/pre-push")), "a surface-gated asset is never realized");
  });

  it("leaves a canonical asset the Capability's record already registers to the Capability, and only deploys for providers", async () => {
    const own = "---\nname: sample\n---\n\nthe Capability's own bytes\n";
    const root = repo({
      ".kaal/config/core/agents.json": claude,
      ".agents/skills/sample/SKILL.md": own,
      [RECORD]: JSON.stringify({ assets: { ".agents/skills/sample/SKILL.md": { sha256: sha(own), version: "0.0.1" } } }),
    });
    const before = at(root, RECORD);
    const done = await realizeIn(root, { skills: [SKILL], contracts: [contract()] });
    assert.equal(at(root, ".agents/skills/sample/SKILL.md").toString(), own);
    assert.deepEqual(at(root, RECORD), before, "the Capability's record is not touched");
    assert.deepEqual(done.records, [CORE_RECORD]);
    assert.ok(done.plan.write.every((w) => w.path.startsWith(".claude/skills/sample/")));
  });

  it("keeps a file found at a canonical target, even with catalogued bytes, and registers nothing for it", async () => {
    const root = repo({ ".agents/skills/sample/SKILL.md": RENDERED });
    const done = await realizeIn(root, { skills: [SKILL], contracts: [contract()] });
    assert.ok(done.plan.keep.some((k) => k.path === ".agents/skills/sample/SKILL.md"));
    assert.deepEqual(Object.keys(json(root, RECORD).assets), [".agents/skills/sample/references/a.md"]);
  });

  it("prunes an unmodified deployment that is no longer needed, and keeps a modified one", async () => {
    const root = repo({ ".kaal/config/core/agents.json": claude });
    await realizeIn(root, { skills: [SKILL] });
    writeFileSync(join(root, ".kaal/config/core/agents.json"), '{ "providers": [] }\n');
    writeFileSync(join(root, ".claude/skills/sample/references/a.md"), "changed\n");
    const done = await realizeIn(root, { skills: [SKILL] });
    assert.deepEqual(done.plan.prune, [".claude/skills/sample/SKILL.md"]);
    assert.ok(!existsSync(join(root, ".claude/skills/sample/SKILL.md")));
    assert.equal(at(root, ".claude/skills/sample/references/a.md").toString(), "changed\n");
    assert.ok(".claude/skills/sample/references/a.md" in json(root, CORE_RECORD).assets);
  });

  it("passes a canonical deployment Core made before a contract delivered the Skill to the Capability's record", async () => {
    const root = repo();
    await realizeIn(root, { skills: [SKILL] });
    const done = await realizeIn(root, { skills: [SKILL], contracts: [contract()] });
    assert.deepEqual(done.plan.write, [], "nothing is rewritten");
    assert.deepEqual(json(root, RECORD), {
      assets: {
        ".agents/skills/sample/SKILL.md": { sha256: sha(RENDERED), version: "0.0.2" },
        ".agents/skills/sample/references/a.md": { sha256: sha("A\n"), version: "0.0.2" },
      },
    });
    assert.deepEqual(json(root, CORE_RECORD), { assets: {} }, "Core's record no longer holds them");
  });

  it("keeps an empty directory at a file target and still applies everything else", async () => {
    const root = repo();
    mkdirSync(join(root, ".agents/skills/sample/references/a.md"), { recursive: true });
    const done = await realizeIn(root, { skills: [SKILL] });
    assert.ok(done.plan.keep.some((k) => k.path === ".agents/skills/sample/references/a.md"));
    assert.deepEqual(at(root, ".agents/skills/sample/SKILL.md"), RENDERED);
  });

  it("upgrades a deployed file to a directory of the same name, and back", async () => {
    const root = repo();
    await realizeIn(root, { skills: [{ name: "sample", files: { "SKILL.md": SOURCE, tool: Buffer.from("old\n") } }] });
    await realizeIn(root, { skills: [{ name: "sample", files: { "SKILL.md": SOURCE, "tool/run": Buffer.from("new\n") } }] });
    assert.equal(at(root, ".agents/skills/sample/tool/run").toString(), "new\n");
    await realizeIn(root, { skills: [{ name: "sample", files: { "SKILL.md": SOURCE, tool: Buffer.from("back\n") } }] });
    assert.equal(at(root, ".agents/skills/sample/tool").toString(), "back\n");
    assert.deepEqual(Object.keys(json(root, CORE_RECORD).assets), [".agents/skills/sample/SKILL.md", ".agents/skills/sample/tool"]);
  });

  it("refuses a record that does not conform and changes nothing", async () => {
    const root = repo({ [RECORD]: JSON.stringify({ assets: { "../outside": { sha256: sha("x"), version: "0.0.1" } } }) });
    await assert.rejects(realizeIn(root, { skills: [SKILL], contracts: [contract()] }), /is not an installation record/);
    assert.ok(!existsSync(join(root, ".agents")));
  });

  it("refuses a contract that delivers a Skill it has no canonical directory asset for", async () => {
    const root = repo();
    const c = { ...contract(), assets: [contract().assets[0]], catalogue: { ".githooks/pre-push": [sha("hook")] } };
    await assert.rejects(realizeIn(root, { skills: [SKILL], contracts: [c] }), /has no directory asset at \.agents\/skills\/sample/);
    assert.ok(!existsSync(join(root, ".agents")));
  });
});
