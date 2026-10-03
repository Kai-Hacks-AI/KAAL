import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename } from "node:path";
import { assertSealed, deployKernel } from "./setup.js";

test("deploys the Kernel at root/.kaal/core/KERNEL.md by default", async () => {
  const deployed = await deployKernel();
  try {
    assert.equal(basename(deployed.dir), ".kaal");
    assert.ok(deployed.kernelPath.endsWith("/.kaal/core/KERNEL.md"));
    assert.ok(existsSync(deployed.kernelPath));
    assert.ok(deployed.sealPath.endsWith("/.kaal/seals/core/KERNEL.md.sha256"));
    assert.deepEqual(readdirSync(deployed.dir).sort(), ["core", "seals"]);
  } finally {
    deployed.cleanup();
  }
});

test("can deploy under another KAAL directory name", async () => {
  const deployed = await deployKernel({ name: "my-kaal" });
  try {
    assert.equal(basename(deployed.dir), "my-kaal");
    assert.ok(existsSync(deployed.kernelPath));
  } finally {
    deployed.cleanup();
  }
});

test("refuses a deployed Kernel that does not match the seal", async () => {
  const deployed = await deployKernel();
  try {
    const seal = "0".repeat(64);
    assert.throws(() => assertSealed(deployed.kernelPath, seal), /does not match its seal/);
  } finally {
    deployed.cleanup();
  }
});

test("the deployed Kernel is Node 1 with the KNIFE chapters, and its seal is detached evidence", async () => {
  const deployed = await deployKernel();
  try {
    assert.deepEqual(
      deployed.chapters.map((c) => [c.level, c.title]),
      [[1, "Kernel"], [2, "Node"], [2, "Immutability"], [2, "Form"], [2, "Edge"]],
    );
    assert.match(deployed.chapter("Form").markdown, /`edges`/);
    assertSealed(deployed.kernelPath, readFileSync(deployed.sealPath, "utf8").trim());
  } finally {
    deployed.cleanup();
  }
});
