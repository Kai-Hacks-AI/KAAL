import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { assertSealed, deploy, discoverNodes } from "./setup.js";

test("deploys at root/.kaal by default and under another KAAL directory name", async () => {
  const byDefault = await deploy();
  const named = await deploy({ name: "my-kaal" });
  try {
    assert.equal(basename(byDefault.dir), ".kaal");
    assert.equal(basename(named.dir), "my-kaal");
    assert.ok(existsSync(byDefault.kernelPath) && existsSync(named.kernelPath));
    assert.equal(byDefault.nodes.length, 2);
  } finally {
    byDefault.cleanup();
    named.cleanup();
  }
});

test("refuses a Kernel that does not match its genesis seal", async () => {
  const deployed = await deploy();
  try {
    assert.throws(() => assertSealed(deployed.kernelPath, "0".repeat(64)), /does not match its seal/);
  } finally {
    deployed.cleanup();
  }
});

test("a file is a Node only if its hash is sealed, wherever it lives", async () => {
  const deployed = await deploy();
  try {
    const ids = deployed.nodes.map((n) => n.id);
    mkdirSync(join(deployed.dir, "elsewhere"));
    renameSync(join(deployed.dir, deployed.nodes[0].path), join(deployed.dir, "elsewhere", "moved.md"));
    assert.deepEqual(discoverNodes(deployed.dir).map((n) => n.id).sort(), [...ids].sort());

    writeFileSync(join(deployed.dir, "core", "Stray.md"), "# Stray\n");
    assert.throws(() => discoverNodes(deployed.dir), /neither the Kernel nor a sealed Node/);
    rmSync(join(deployed.dir, "core", "Stray.md"));

    rmSync(join(deployed.dir, "elsewhere", "moved.md"));
    assert.throws(() => discoverNodes(deployed.dir), /matches no deployed file/);
  } finally {
    deployed.cleanup();
  }
});
