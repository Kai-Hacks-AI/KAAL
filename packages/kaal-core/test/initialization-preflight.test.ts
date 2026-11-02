// Core/C40 implementation preparation. These are internal algorithm tests, not
// evidence of an approved Foundation declaration transport or completed CLI init.
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { read } from "kaal-hosting";
import { bootstrap, verify } from "../dist/bootstrap.js";
import { catalog } from "../dist/register.js";
import { identify } from "../dist/node.js";
import { payload } from "../dist/payload.js";
import { initializeContributions, planInitialization, type RequiredContribution } from "../dist/initialization.js";

// Exact owner-authored, already delivered bytes. Foundation is deliberately absent:
// these tests do not manufacture its missing mandatory declaration.
const core = readFileSync(fileURLToPath(new URL("../capability/Core.md", import.meta.url)));
const skill = readFileSync(fileURLToPath(new URL("../skills/kaal-core/Core-Skill.md", import.meta.url)));
const hosting = readFileSync(fileURLToPath(new URL("../../extensions/kaal-hosting/payload/Hosting.md", import.meta.url)));
const binding = (owner: string, kind: RequiredContribution["kind"], name: string, bytes: Buffer): RequiredContribution => ({
  owner, kind, name, reference: identify(bytes), files: { "Declaration.md": bytes },
});
const required = () => [binding("Core", "capability", "core", core), binding("Core Skill", "skill", "core", skill), binding("Hosting", "extension", "hosting", hosting)];
const scratch = async (work: (dir: string) => Promise<void>) => {
  const dir = mkdtempSync(join(tmpdir(), "core-preflight-"));
  try { await work(dir); } finally { rmSync(dir, { recursive: true, force: true }); }
};
const snapshot = async (dir: string) => Object.fromEntries(Object.entries(await read(dir)).map(([p, b]) => [p, b.toString("base64")]));

describe("Core initialization preflight (internal C40 preparation)", () => {
  it("plans real owner contributions without changing inputs, and returns independent bytes", () => {
    const contributions = required();
    const before = contributions.map((c) => Buffer.from(c.files["Declaration.md"] as Uint8Array));
    const plan = planInitialization({}, contributions);
    assert.ok(plan);
    assert.ok(plan["capabilities/core/Declaration.md"].equals(core));
    assert.ok(plan["skills/core/Declaration.md"].equals(skill));
    assert.ok(plan["extensions/hosting/Declaration.md"].equals(hosting));
    plan["capabilities/core/Declaration.md"].fill(0);
    contributions.forEach((c, i) => assert.ok(Buffer.from(c.files["Declaration.md"] as Uint8Array).equals(before[i])));
    assert.ok(payload()["core/Node.md"].length > 0);
  });

  it("publishes the whole prospective Engine once; identical reinitialization preserves every byte", async () => scratch(async (dir) => {
    const engine = join(dir, "engine");
    const written = await initializeContributions(engine, required());
    assert.ok(written.includes("capabilities/core/Declaration.md"));
    assert.ok(written.includes("skills/core/Declaration.md"));
    assert.ok(written.includes("extensions/hosting/Declaration.md"));
    const catalogue = await catalog(engine);
    assert.ok(catalogue.capabilities.some((n) => n.name === "Core"));
    assert.ok(catalogue.skills.some((n) => n.name === "Core Skill"));
    assert.ok(catalogue.extensions.some((n) => n.name === "Hosting"));
    assert.equal((await verify(engine)).ok, true);
    assert.ok(!Object.keys(await read(engine)).some((p) => p.startsWith("state/")), "no dependency lifecycle record is claimed");
    const before = await snapshot(dir);
    assert.deepEqual(await initializeContributions(engine, required()), []);
    assert.deepEqual(await snapshot(dir), before);
  }));

  it("refuses a valid bare Engine as incomplete, preserving author guidance and configuration", async () => scratch(async (dir) => {
    const engine = join(dir, "engine");
    await bootstrap(engine);
    writeFileSync(join(engine, "AGENTS.md"), "# Author guidance\n");
    writeFileSync(join(engine, "CLAUDE.md"), "# Author guidance\n");
    mkdirSync(join(engine, "config"));
    writeFileSync(join(engine, "config/consumer.json"), "{}\n");
    const before = await snapshot(dir);
    await assert.rejects(initializeContributions(engine, required()), /incomplete.*explicit.*recover/i);
    assert.deepEqual(await snapshot(dir), before);
    assert.equal((await verify(engine)).ok, true);
  }));

  it("refuses missing, malformed, wrong-type, wrong-kind, conflicting and changed owner data before target writes", async () => {
    const changed = Buffer.concat([hosting, Buffer.from("\nChanged owner bytes.\n")]);
    const wrongType = Buffer.from(hosting.toString().replace(/id: [a-f0-9]{64}/, `id: ${"0".repeat(64)}`));
    const mutations: RequiredContribution[] = [
      { ...required()[2], files: {} },
      { ...required()[2], files: { "Declaration.md": Buffer.from("---\nname: [broken\n---\n") } },
      { ...required()[2], reference: identify(wrongType), files: { "Declaration.md": wrongType } },
      { ...required()[2], kind: "capability" as const },
      { ...required()[0], owner: "Conflicting Core", files: { "Declaration.md": Buffer.concat([core, Buffer.from("\nConflict\n")]) }, reference: identify(Buffer.concat([core, Buffer.from("\nConflict\n")])) },
      { ...required()[2], files: { "Declaration.md": changed } },
    ];
    for (const bad of mutations) for (const empty of [false, true]) await scratch(async (dir) => {
      const engine = join(dir, "engine");
      if (empty) mkdirSync(engine);
      const before = await snapshot(dir);
      await assert.rejects(initializeContributions(engine, [...required(), bad]), new RegExp(bad.owner));
      assert.deepEqual(await snapshot(dir), before);
      assert.deepEqual(readdirSync(dir), empty ? ["engine"] : []);
    });
  });

  it("does not adopt identical declarations at arbitrary paths as registered contributions", async () => scratch(async (dir) => {
    const engine = join(dir, "engine");
    await bootstrap(engine);
    for (const [i, c] of required().entries()) writeFileSync(join(engine, `present-${i}.md`), c.files["Declaration.md"]);
    const before = await snapshot(dir);
    await assert.rejects(initializeContributions(engine, required()), /incomplete/i);
    assert.deepEqual(await snapshot(dir), before);
  }));

  it("refuses invalid existing Engines and non-directories without changing them", async () => scratch(async (dir) => {
    const engine = join(dir, "engine");
    writeFileSync(engine, "consumer data\n");
    const before = await snapshot(dir);
    await assert.rejects(initializeContributions(engine, required()), /not a directory/i);
    assert.deepEqual(await snapshot(dir), before);
    rmSync(engine);
    mkdirSync(engine);
    writeFileSync(join(engine, "consumer.txt"), "consumer data\n");
    const invalid = await snapshot(dir);
    await assert.rejects(initializeContributions(engine, required()), /not a valid Engine/i);
    assert.deepEqual(await snapshot(dir), invalid);
  }));
});
