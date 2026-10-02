import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { deploy, isKernel, kernel, name, payload } from "../src/index.js";

test("exports the package name", () => {
  assert.equal(name, "kaal-core");
});

test("kernel identifies itself as a KAAL Kernel", () => {
  assert.deepEqual(kernel(), { kaal: "kernel", format: 1 });
});

test("payload is exactly one file", () => {
  assert.deepEqual(Object.keys(payload()), ["kernel.json"]);
});

test("deploy writes the payload to <root>/.kaal and nothing else", () => {
  const root = mkdtempSync(join(tmpdir(), "kaal-"));
  try {
    assert.equal(isKernel(root), false);
    const dir = deploy(root);
    assert.equal(dir, join(root, ".kaal"));
    assert.deepEqual(readdirSync(root), [".kaal"]);
    assert.deepEqual(readdirSync(dir), ["kernel.json"]);
    assert.equal(readFileSync(join(dir, "kernel.json"), "utf8"), payload()["kernel.json"]);
    assert.equal(isKernel(root), true);
    deploy(root); // idempotent
    assert.equal(isKernel(root), true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("isKernel rejects a .kaal that is not a Kernel", () => {
  const root = mkdtempSync(join(tmpdir(), "kaal-"));
  try {
    deploy(root);
    rmSync(join(root, ".kaal", "kernel.json"));
    assert.equal(isKernel(root), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
