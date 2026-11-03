// graph/C16 planned test: one SHA-256 for Graph (plan/foundation-digest/testing.md).
// Immutable to DO and CHECK. graph/T19 is GREEN now and must stay GREEN; graph/C17 turns graph/T20 GREEN.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { identify, sha256 } from "kaal-graph";

const SCRIPTS = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "skills", "kaal-graph", "scripts");
const FOUNDATION = "@kaihacksai/kaal-foundation/sha256";
const specifiers = (text) => [...text.matchAll(/(?:^|\n)\s*(?:import|export)\b[^;]*?from\s*["']([^"']+)["']/g)].map((m) => m[1]);

describe("one SHA-256 for Graph", () => {
  it("graph/T19 [graph/F17]: digests and Node ids are what they were", () => {
    assert.equal(sha256(Buffer.alloc(0)), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    assert.equal(sha256(Buffer.from("abc")), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    const bytes = Buffer.from("---\nname: A\ntype:\n  name: Node\n  id: " + "c".repeat(64) + "\n---\n");
    assert.equal(identify(bytes).id, sha256(bytes));
  });

  it("graph/T20 [graph/F16]: Graph computes no digest of its own", () => {
    for (const file of readdirSync(SCRIPTS).filter((f) => f.endsWith(".mjs"))) {
      assert.ok(!/node:crypto|createHash/.test(readFileSync(join(SCRIPTS, file), "utf8")), `${file} computes a digest itself`);
    }
    const node = readFileSync(join(SCRIPTS, "node.mjs"), "utf8");
    assert.ok(specifiers(node).includes(FOUNDATION), "node.mjs imports sha256 from Foundation");
  });
});
