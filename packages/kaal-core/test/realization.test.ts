// core/C13 Code tests for kaal-core/realization: Core's plans applied through Hosting (core/A7),
// with the Capability's record kept as core/C10 planned it (core/F33–core/F37).
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import gfs from "graceful-fs";
import { afterEach, describe, it } from "node:test";
import { installationFormat } from "kaal-core/installation";
import { realizeIn, record as CORE_RECORD } from "kaal-core/realization";

const sha = (bytes: Uint8Array | string) => createHash("sha256").update(bytes).digest("hex");
const VERSION = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version;

const SOURCE = Buffer.from("---\nname: sample\ndescription: Resolve a failing Sample verdict.\n---\n\n# sample\n");
const SKILL = { name: "sample", files: { "SKILL.md": SOURCE, "references/a.md": Buffer.from("A\n") } };
const RECORD = ".kaal/state/sample/installation.json";

const contract = () => ({
  format: installationFormat(),
  capability: "sample",
  version: "0.0.2",
  assets: [
    { name: "hook", source: "assets/pre-push", target: ".githooks/pre-push", kind: "file", surface: "hook" },
    { name: "skill", source: "skills/sample", target: ".agents/skills/sample", kind: "directory" },
  ],
  catalogue: { ".githooks/pre-push": [sha("hook")], ".agents/skills/sample/SKILL.md": [sha(SOURCE)] },
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
    assert.deepEqual(at(root, ".agents/skills/sample/SKILL.md"), SOURCE);
    assert.deepEqual(first.records, [CORE_RECORD]);
    assert.deepEqual(json(root, CORE_RECORD), {
      assets: {
        ".agents/skills/sample/SKILL.md": { sha256: sha(SOURCE), version: VERSION },
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
        ".agents/skills/sample/SKILL.md": { sha256: sha(SOURCE), version: "0.0.2" },
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

  it("leaves a partly registered canonical location to the Capability: it neither completes, repairs, claims nor overwrites it", async () => {
    const own = "---\nname: sample\n---\n\nthe Capability's own bytes\n";
    const root = repo({
      ".kaal/config/core/agents.json": claude,
      ".agents/skills/sample/SKILL.md": own,
      ".agents/skills/sample/extra.md": "unregistered\n",
      [RECORD]: JSON.stringify({ assets: { ".agents/skills/sample/SKILL.md": { sha256: sha(own), version: "0.0.1" } } }),
    });
    const record = at(root, RECORD);
    const done = await realizeIn(root, { skills: [SKILL], contracts: [contract()] });
    assert.ok(!existsSync(join(root, ".agents/skills/sample/references/a.md")), "an absent canonical file is not written");
    assert.equal(at(root, ".agents/skills/sample/SKILL.md").toString(), own, "a registered one is not overwritten");
    assert.equal(at(root, ".agents/skills/sample/extra.md").toString(), "unregistered\n");
    assert.deepEqual(at(root, RECORD), record, "the Capability's record is not changed");
    assert.ok([...done.plan.write.map((w) => w.path), ...done.plan.keep.map((k) => k.path), ...done.plan.prune].every((p) => p.startsWith(".claude/skills/sample/")));
    assert.ok(Object.keys(json(root, CORE_RECORD).assets).every((p) => p.startsWith(".claude/skills/sample/")), "Core claims nothing canonical");
  });

  it("uses the sources it is given without judging them against the catalogue, and registers only the digest of what it wrote", async () => {
    const root = repo();
    const c = { ...contract(), catalogue: { ".githooks/pre-push": [sha("hook")], ".agents/skills/sample/SKILL.md": [sha("some other release")] } };
    await realizeIn(root, { skills: [SKILL], contracts: [c] });
    assert.deepEqual(json(root, RECORD).assets[".agents/skills/sample/SKILL.md"], { sha256: sha(SOURCE), version: "0.0.2" });
  });

  it("keeps a file found at a canonical target, even with catalogued bytes, and registers nothing for it", async () => {
    const root = repo({ ".agents/skills/sample/SKILL.md": SOURCE });
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
        ".agents/skills/sample/SKILL.md": { sha256: sha(SOURCE), version: "0.0.2" },
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
    assert.deepEqual(at(root, ".agents/skills/sample/SKILL.md"), SOURCE);
  });

  it("turns a deployed file into a directory of the same name, and back, each in one reconciliation", async () => {
    const root = repo();
    const FILE = { name: "sample", files: { "SKILL.md": SOURCE, tool: Buffer.from("old\n") } };
    const DIR = { name: "sample", files: { "SKILL.md": SOURCE, "tool/run": Buffer.from("new\n"), "tool/lib/x": Buffer.from("x\n") } };
    await realizeIn(root, { skills: [FILE] });
    const toDir = await realizeIn(root, { skills: [DIR] });
    assert.deepEqual(toDir.plan.prune, [".agents/skills/sample/tool"]);
    assert.equal(at(root, ".agents/skills/sample/tool/run").toString(), "new\n");
    assert.equal(at(root, ".agents/skills/sample/tool/lib/x").toString(), "x\n");
    assert.deepEqual(Object.keys(json(root, CORE_RECORD).assets), [".agents/skills/sample/SKILL.md", ".agents/skills/sample/tool/lib/x", ".agents/skills/sample/tool/run"]);

    const toFile = await realizeIn(root, { skills: [{ name: "sample", files: { "SKILL.md": SOURCE, tool: Buffer.from("back\n") } }] });
    assert.deepEqual(toFile.plan.prune, [".agents/skills/sample/tool/lib/x", ".agents/skills/sample/tool/run"]);
    assert.equal(at(root, ".agents/skills/sample/tool").toString(), "back\n");
    assert.deepEqual(Object.keys(json(root, CORE_RECORD).assets), [".agents/skills/sample/SKILL.md", ".agents/skills/sample/tool"]);
  });

  it("keeps a directory that holds a file Core did not deploy where a file is now needed, and still applies everything else", async () => {
    const root = repo();
    await realizeIn(root, { skills: [{ name: "sample", files: { "SKILL.md": SOURCE, "tool/run": Buffer.from("old\n") } }] });
    writeFileSync(join(root, ".agents/skills/sample/tool/mine"), "mine\n");
    const done = await realizeIn(root, { skills: [{ name: "sample", files: { "SKILL.md": SOURCE, tool: Buffer.from("new\n"), "b.md": Buffer.from("B\n") } }] });
    assert.ok(done.plan.keep.some((k) => k.path === ".agents/skills/sample/tool" && k.reason.includes("tool/mine")));
    assert.equal(at(root, ".agents/skills/sample/tool/mine").toString(), "mine\n");
    assert.ok(!existsSync(join(root, ".agents/skills/sample/tool/run")), "Core's own file is pruned");
    assert.equal(at(root, ".agents/skills/sample/b.md").toString(), "B\n");
  });

  it("changes nothing when an empty directory Core cannot read keeps a directory it would turn into a file", async () => {
    const root = repo();
    await realizeIn(root, { skills: [{ name: "sample", files: { "SKILL.md": SOURCE, "tool/run": Buffer.from("old\n") } }] });
    mkdirSync(join(root, ".agents/skills/sample/tool/empty"));
    const record = at(root, CORE_RECORD);
    await assert.rejects(realizeIn(root, { skills: [{ name: "sample", files: { "SKILL.md": SOURCE, tool: Buffer.from("new\n"), "b.md": Buffer.from("B\n") } }] }), { code: "STALE" });
    assert.equal(at(root, ".agents/skills/sample/tool/run").toString(), "old\n");
    assert.ok(!existsSync(join(root, ".agents/skills/sample/b.md")));
    assert.deepEqual(at(root, CORE_RECORD), record);
  });

  it("replaces a file Core deployed at a now contracted canonical location, and registers the new files in the Capability's record", async () => {
    const root = repo();
    await realizeIn(root, { skills: [{ name: "sample", files: { "SKILL.md": SOURCE, references: Buffer.from("old\n") } }] });
    await realizeIn(root, { skills: [SKILL], contracts: [contract()] });
    assert.equal(at(root, ".agents/skills/sample/references/a.md").toString(), "A\n");
    assert.deepEqual(Object.keys(json(root, RECORD).assets), [".agents/skills/sample/SKILL.md", ".agents/skills/sample/references/a.md"]);
    assert.deepEqual(json(root, CORE_RECORD), { assets: {} });
  });

  it("reports what Hosting could not clean up, and the realization still stands", async () => {
    const root = repo();
    type Rm = (path: string, options: unknown, cb: (e: NodeJS.ErrnoException | null) => void) => void;
    const rm = gfs.rm as unknown as Rm;
    (gfs as unknown as { rm: Rm }).rm = (path, options, cb) =>
      /\.(staging|aside)-/.test(String(path)) ? cb(Object.assign(new Error("EBUSY: refused"), { code: "EBUSY" })) : rm(path, options, cb);
    let done;
    try {
      done = await realizeIn(root, { skills: [SKILL] });
    } finally {
      (gfs as unknown as { rm: Rm }).rm = rm;
    }
    assert.deepEqual(at(root, ".agents/skills/sample/SKILL.md"), SOURCE);
    assert.ok(done.leftovers !== undefined && done.leftovers.length > 0, "the leftovers are reported");
    for (const l of done.leftovers) assert.match(String((l.error as Error).message), /EBUSY/);
    const clean = await realizeIn(repo(), { skills: [SKILL] });
    assert.ok(!("leftovers" in clean), "nothing is reported when nothing is left");
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
