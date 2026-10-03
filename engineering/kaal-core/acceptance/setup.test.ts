import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";
import { assertSealed, deployKernel } from "./setup.js";

test("deploys the Kernel at root/.kaal/core/KERNEL.md by default", async () => {
  const deployed = await deployKernel();
  try {
    assert.equal(basename(deployed.dir), ".kaal");
    assert.deepEqual(readdirSync(deployed.root), [".kaal"]);
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
    assert.deepEqual(readdirSync(deployed.root), ["my-kaal"]);
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
    writeFileSync(deployed.kernelPath, "tampered\n");
    assert.throws(() => assertSealed(deployed.kernelPath, seal), /does not match/);
  } finally {
    deployed.cleanup();
  }
});

test("the deployed seal is detached evidence: it matches the Node's bytes and is no chapter", async () => {
  const deployed = await deployKernel();
  try {
    const seal = readFileSync(deployed.sealPath, "utf8");
    assert.match(seal, /^[0-9a-f]{64}\n$/);
    assertSealed(deployed.kernelPath, seal.trim());
    assert.ok(!readFileSync(deployed.kernelPath, "utf8").includes(seal.trim()));
  } finally {
    deployed.cleanup();
  }
});

test("exposes the sealed Kernel by its Markdown chapters, losslessly", async () => {
  const deployed = await deployKernel();
  try {
    const bytes = readFileSync(deployed.kernelPath, "utf8");
    assert.ok(deployed.chapters.length > 0);
    assert.equal(deployed.chapters.map((c) => c.markdown).join(""), bytes);
    for (const c of deployed.chapters) {
      assert.ok(c.title !== "" && bytes.split("\n").includes(`${"#".repeat(c.level)} ${c.title}`));
      assert.equal(deployed.chapter(c.title), c);
    }
    assert.throws(() => deployed.chapter("No such chapter"), /no chapter/);
  } finally {
    deployed.cleanup();
  }
});
