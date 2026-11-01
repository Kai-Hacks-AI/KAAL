// core/C40 proposed outer acceptance. Immutable to its DO. Run separately until that DO.
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const CORE = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const pkg = JSON.parse(readFileSync(join(CORE, "package.json"), "utf8"));
const hostingName = Object.keys(pkg.dependencies).find((name) => /(^|\/)kaal-hosting$/.test(name));
const { execute, read } = await import(hostingName);
const core = await import(pkg.name);
const { sha256 } = await import("@kaihacksai/kaal-foundation/sha256");
const env = { ...process.env };
delete env.NODE_TEST_CONTEXT;
const cli = (args, cwd) => execute(process.execPath, [join(CORE, "dist/cli.js"), ...args], { cwd, env });
const scratch = async (work) => {
  const dir = mkdtempSync(join(tmpdir(), "kaal-core-c40-"));
  try { return await work(dir); } finally { rmSync(dir, { recursive: true, force: true }); }
};
const snapshot = async (dir) => Object.fromEntries(Object.entries(await read(dir)).map(([path, bytes]) => [path, bytes.toString("base64")]));
const names = (catalogue) => Object.fromEntries(Object.entries(catalogue).map(([kind, refs]) => [kind, refs.map((r) => r.name).sort()]));
const skillBytes = (name, type = core.foundation().skill) => Buffer.from(`---\nname: ${name}\ntype:\n  name: ${type.name}\n  id: ${type.id}\n---\n\n# ${name}\n\nA fixture Skill.\n`);

describe("Core initialization and consumer completion (core/C40)", () => {
  it("core/T98 [core/F89, core/A45]: Core ships its own Skill and an admitted Skill Node", async () => {
    const skill = "skills/kaal-core/SKILL.md";
    const node = "skills/kaal-core/Core-Skill.md";
    assert.ok(existsSync(join(CORE, skill)), "Core delivers its own Agent Skill");
    assert.ok(existsSync(join(CORE, node)), "Core delivers its own Skill Node");
    const bytes = readFileSync(join(CORE, node));
    const evaluated = core.evaluate({ ...core.payload(), "Core-Skill.md": bytes });
    assert.deepEqual(evaluated.rejected, []);
    assert.ok(evaluated.nodes.some((n) => n.id === sha256(bytes) && n.name === "Core Skill" && n.type?.id === core.foundation().skill.id));
    const packed = await execute("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: CORE, env });
    assert.equal(packed.status, 0, packed.stdout + packed.stderr);
    const files = JSON.parse(packed.stdout.slice(packed.stdout.indexOf("[")))[0].files.map((f) => f.path);
    for (const path of [skill, node]) assert.ok(files.includes(path), `${path} actually ships`);
  });

  it("core/T99 [core/F90, core/A45]: delivered agent navigation identifies Core's installed Skill", () => {
    const agents = readFileSync(join(CORE, "payload/AGENTS.md"), "utf8");
    assert.ok(agents.includes("@kaihacksai/kaal-core"), "navigation identifies the installed package");
    assert.ok(agents.includes("skills/kaal-core/SKILL.md"), "navigation identifies its Skill");
  });

  it("core/T100 [core/F91, core/F92, core/A46]: explicit init admits the mandatory owner contributions and repeating it writes nothing", async () => scratch(async (dir) => {
    const initialized = await cli(["init"], dir);
    assert.equal(initialized.status, 0, initialized.stdout + initialized.stderr);
    const engine = join(dir, ".kaal");
    const catalogue = names(await core.catalog(engine));
    for (const name of ["Core", "Foundation"]) assert.ok(catalogue.capabilities.includes(name), `${name} is admitted as its owner's Capability`);
    assert.ok(catalogue.extensions.includes("Hosting"), "Hosting retains its owner's Extension kind");
    assert.ok(catalogue.skills.includes("Core Skill"), "Core's own Skill is admitted");
    assert.equal((await core.verify(engine)).ok, true);
    const before = await snapshot(dir);
    const again = await cli(["init"], dir);
    assert.equal(again.status, 0, again.stdout + again.stderr);
    assert.deepEqual(await snapshot(dir), before);
  }));

  it("core/T101 [core/F92, core/N24]: init refuses an existing bare Engine as incomplete, while ordinary verification still holds and no bytes change", async () => scratch(async (dir) => {
    const engine = join(dir, ".kaal");
    await core.bootstrap(engine);
    assert.equal((await core.verify(engine)).ok, true);
    const before = await snapshot(dir);
    const initialized = await cli(["init"], dir);
    assert.notEqual(initialized.status, 0, "an existing Engine without the mandatory registrations is incomplete initialization");
    assert.match(initialized.stdout + initialized.stderr, /incomplete/i);
    assert.deepEqual(await snapshot(dir), before);
    assert.equal((await core.verify(engine)).ok, true, "generic verification is not redefined as initialization");
  }));

  it("core/T102 [core/F93]: presence outside the Engine is not admission; explicit registration admits the same Skill", async () => scratch(async (dir) => {
    const engine = join(dir, "engine");
    await core.bootstrap(engine);
    const bytes = skillBytes("Present Skill");
    const outside = join(dir, ".agents/skills/present");
    mkdirSync(outside, { recursive: true });
    writeFileSync(join(outside, "Present.md"), bytes);
    assert.ok(!names(await core.catalog(engine)).skills.includes("Present Skill"));
    await core.register(engine, "skill", "present", { "Present.md": bytes });
    assert.ok(names(await core.catalog(engine)).skills.includes("Present Skill"));
    assert.ok(readFileSync(join(outside, "Present.md")).equals(bytes));
  }));

  it("core/T103 [core/F93, core/N24]: rejected registration changes nothing and never becomes admitted", async () => scratch(async (dir) => {
    const engine = join(dir, "engine");
    await core.bootstrap(engine);
    const before = await snapshot(dir);
    const bad = skillBytes("Rejected Skill", { name: "Unknown", id: "0".repeat(64) });
    await assert.rejects(core.register(engine, "skill", "rejected", { "Rejected.md": bad }));
    assert.deepEqual(await snapshot(dir), before);
    assert.ok(!names(await core.catalog(engine)).skills.includes("Rejected Skill"));
  }));

  it("core/T104 [core/N25, core/A49]: read-only CLI operations against an external Engine change neither target nor controller", async () => scratch(async (dir) => {
    const target = join(dir, "target/engine");
    const controller = join(dir, "controller");
    mkdirSync(controller);
    await core.bootstrap(target);
    const before = await snapshot(dir);
    for (const args of [["list"], ["verify"], ["resolve", "Node"]]) {
      const result = await cli([...args, "--engine", target], controller);
      assert.equal(result.status, 0, result.stdout + result.stderr);
    }
    assert.deepEqual(await snapshot(dir), before);
    assert.ok(!existsSync(join(controller, ".kaal")));
  }));

  it("core/T105 [core/F95, core/A48]: comprehensive source testing declares the entire existing release boundary", () => {
    assert.equal(pkg.scripts["test:release"], "node --test test/plan/release.test.mjs", "release acceptance is a declared suite, without selective case filtering");
  });

  it("core/T106 [core/F94, core/A47]: the healthy consumer verifier ends in one normalized candidate-specific report with observed cases", async () => {
    const verified = await execute(process.execPath, [join(CORE, "test/verify.mjs")], { cwd: CORE, env });
    assert.equal(verified.status, 0, verified.stdout + verified.stderr);
    const last = verified.stdout.trim().split(/\r?\n/).at(-1);
    assert.match(last, /^kaal-core-verification \{/);
    const report = JSON.parse(last.slice("kaal-core-verification ".length));
    assert.equal(report.result, "verified");
    assert.equal(report.exit, 0);
    assert.equal(report.candidate.name, pkg.name);
    assert.equal(report.candidate.version, pkg.version);
    assert.equal(report.candidate.manifest, sha256(readFileSync(join(CORE, "test/verify.json"))));
    assert.ok(Array.isArray(report.cases) && report.cases.length > 0, "case outcomes, not counts alone");
    assert.ok(report.cases.every((c) => typeof c.name === "string" && c.name.length > 0 && c.outcome === "pass"));
    assert.equal(new Set(report.cases.map((c) => c.name)).size, report.cases.length);
    assert.deepEqual(report.causes, []);
  });
});
