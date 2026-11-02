// Additional independent discriminators for the internal preflight. Each bad
// owner replaces the valid binding, so a prefix conflict cannot mask admission.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { read } from "kaal-hosting";
import { identify } from "../dist/node.js";
import { initializeContributions, planInitialization, type RequiredContribution } from "../dist/initialization.js";

const bytes = readFileSync(fileURLToPath(new URL("../../extensions/kaal-hosting/payload/Hosting.md", import.meta.url)));
const valid = (): RequiredContribution => ({ owner: "Hosting", kind: "extension", name: "hosting", reference: identify(bytes), files: { "Hosting.md": bytes } });
const scratch = async (work: (dir: string) => Promise<void>) => {
  const dir = mkdtempSync(join(tmpdir(), "core-bindings-"));
  try { await work(dir); } finally { rmSync(dir, { recursive: true, force: true }); }
};

describe("Core owner-binding refusal discriminators (internal C40 preparation)", () => {
  it("rejects each invalid owner at its own discriminator before a missing or empty target changes", async () => {
    const wrongType = Buffer.from(bytes.toString().replace(/id: [a-f0-9]{64}/, `id: ${"0".repeat(64)}`));
    const mutations: [RequiredContribution, RegExp][] = [
      [{ ...valid(), files: {} }, /Hosting:.*at least one Node/],
      [{ ...valid(), files: { "Hosting.md": Buffer.from("not a Node\n") } }, /Hosting:.*not a Node/],
      [{ ...valid(), reference: identify(wrongType), files: { "Hosting.md": wrongType } }, /Hosting:.*not admitted/],
      [{ ...valid(), kind: "capability" }, /Hosting:.*typed by KAAL Capability/],
      [{ ...valid(), files: { "Hosting.md": Buffer.concat([bytes, Buffer.from("\nChanged.\n")]) } }, /Hosting:.*required Hosting.*not admitted/],
      [{ ...valid(), reference: { ...valid().reference, name: "Wrong Name" } }, /Hosting:.*name does not match/],
    ];
    for (const [contribution, reason] of mutations) for (const empty of [false, true]) await scratch(async (dir) => {
      const engine = join(dir, "engine");
      if (empty) mkdirSync(engine);
      await assert.rejects(initializeContributions(engine, [contribution]), reason);
      assert.deepEqual(readdirSync(dir), empty ? ["engine"] : []);
      if (empty) assert.deepEqual(readdirSync(engine), []);
    });
    assert.throws(() => planInitialization({}, []), /no required owner contributions/);
  });

  it("retains Hosting's portable-path publication refusal without leaving a partial Engine", async () => {
    for (const empty of [false, true]) await scratch(async (dir) => {
      const engine = join(dir, "engine");
      if (empty) mkdirSync(engine);
      await assert.rejects(initializeContributions(engine, [{ ...valid(), files: { "CON.md": bytes } }]));
      assert.deepEqual(readdirSync(dir), empty ? ["engine"] : []);
      if (empty) assert.deepEqual(readdirSync(engine), []);
    });
  });

  it("keeps author changes and configuration on complete no-op, but refuses extra contribution content", async () => scratch(async (dir) => {
    const engine = join(dir, "engine");
    await initializeContributions(engine, [valid()]);
    writeFileSync(join(engine, "AGENTS.md"), "# Consumer guidance\n");
    writeFileSync(join(engine, "CLAUDE.md"), "# Consumer guidance\n");
    writeFileSync(join(engine, "consumer.json"), "{}\n");
    const snapshot = async () => Object.fromEntries(Object.entries(await read(dir)).map(([p, b]) => [p, b.toString("base64")]));
    const before = await snapshot();
    assert.deepEqual(await initializeContributions(engine, [valid()]), []);
    assert.deepEqual(await snapshot(), before);
    writeFileSync(join(engine, "extensions/hosting/extra.txt"), "consumer data\n");
    const conflict = await snapshot();
    await assert.rejects(initializeContributions(engine, [valid()]), /incomplete/);
    assert.deepEqual(await snapshot(), conflict);
  }));
});
