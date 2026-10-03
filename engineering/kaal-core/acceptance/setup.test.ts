import { test } from "node:test";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, renameSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { assertSealed, deploy } from "./setup.js";

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

test("Nodes are recognised by Form, wherever they live; files without a valid Form, including type-less files that are not the sealed genesis and pairs that appoint themselves, are not Nodes", async () => {
  const deployed = await deploy();
  try {
    const ids = deployed.nodes.map((n) => n.id).sort();
    mkdirSync(join(deployed.dir, "elsewhere"));
    renameSync(join(deployed.dir, deployed.nodes[0].path), join(deployed.dir, "elsewhere", "moved.md"));
    writeFileSync(join(deployed.dir, "core", "Stray.md"), "# Stray\n\nNot a Node.\n");
    writeFileSync(join(deployed.dir, "core", "Impostor.md"), "---\nname: Node\n---\n\nNot the genesis Node.\n");
    const fake = "---\nname: FakeGenesis\n---\n\nSelf-appointed.\n";
    const fakeId = createHash("sha256").update(fake).digest("hex");
    writeFileSync(join(deployed.dir, "core", "FakeGenesis.md"), fake);
    writeFileSync(join(deployed.dir, "core", "FakeTyped.md"), `---\nname: Fake\ntype:\n  name: FakeGenesis\n  id: ${fakeId}\n---\n`);
    writeFileSync(join(deployed.dir, "core", "Typeless.md"), "---\nname: Stray\n---\n\n# Stray\n");
    writeFileSync(join(deployed.dir, "core", "Odd.md"), "---\nname: Node\ntype : nope\n---\n");
    writeFileSync(join(deployed.dir, "core", "Malformed.md"), "---\nname: Stray\ntype:\n  name: Node\n  id: nope\n---\n");
    assert.deepEqual(deployed.discover().map((n) => n.id).sort(), ids);
  } finally {
    deployed.cleanup();
  }
});
