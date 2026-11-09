/*---
tests: [foundation/F20, foundation/F21, foundation/N11, foundation/N12, foundation/A27, foundation/A28]
---*/
// foundation/C11 planned publisher cases: Foundation's ownership claim (plan/ownership/*.md). Immutable
// to DO and CHECK; the DO moves this file unchanged to test/publisher/ and turns it GREEN. Each title
// names the contracts it checks. npm runs as its CLI script under this Node, named by npm_execpath; no
// shell is chosen and no platform is consulted (foundation/N7, #668).
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { sha256 } from "../../05-src/skills/kaal-foundation/scripts/sha256.mjs";

const PACKAGE = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const REPOSITORY = join(PACKAGE, "..", "..");
const LOCATION = "packages/kaal-foundation/";
const NODE = "kaal/Foundation.md";
const PACKED_NODE = `dist/${NODE}`;
const CLAIM = "ownership.kaal.json";
/** Core's reference to KAAL Capability, as its own Node carries it. */
const typeOf = (text) => text.match(/^---\n[\s\S]*?^type:\n {2}name: (.+)\n {2}id: ([0-9a-f]{64})\n[\s\S]*?^---\n/m)?.slice(1, 3);
const nameOf = (text) => text.match(/^---\n(?:[\s\S]*?\n)?name: (.+)\n/)?.[1];

test("foundation/T35 [foundation/F20, foundation/A28]: Foundation is a Capability Node, named Foundation and typed by KAAL Capability under Core's type reference", () => {
  assert.ok(existsSync(join(PACKAGE, NODE)), `${NODE} exists`);
  const text = readFileSync(join(PACKAGE, NODE)).toString("utf8");
  const core = readFileSync(join(REPOSITORY, "packages", "kaal-core", "capability", "Core.md"), "utf8");
  assert.equal(nameOf(text), "Foundation", "the Node is named Foundation");
  assert.deepEqual(typeOf(text), typeOf(core), "typed by KAAL Capability under Core's type reference");
  assert.equal(typeOf(core)?.[0], "KAAL Capability");
});

test("foundation/T75 [foundation/F21, foundation/A27]: the repository's claim names the Foundation Node by its SHA-256 and claims packages/kaal-foundation/", () => {
  const bytes = readFileSync(join(PACKAGE, NODE));
  const claim = JSON.parse(readFileSync(join(PACKAGE, CLAIM), "utf8"));
  assert.deepEqual(claim, { owner: { kind: "capability", name: "Foundation", id: sha256(bytes) }, paths: [LOCATION] });
});

test("foundation/T36 [foundation/N11, foundation/N12]: the authoritative Node ships, the claim never ships, and the claim reaches nothing outside packages/kaal-foundation/", () => {
  const cli = process.env.npm_execpath;
  assert.ok(cli && /\.[cm]?js$/.test(cli), "npm_execpath names npm's CLI script: run these tests through npm");
  const r = spawnSync(process.execPath, [cli, "pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE, encoding: "utf8", env: { ...process.env, NODE_TEST_CONTEXT: undefined } });
  assert.equal(r.status, 0, r.stderr);
  const packed = JSON.parse(r.stdout.slice(r.stdout.indexOf("[")))[0].files.map((f) => f.path);
  const listed = Object.keys(JSON.parse(readFileSync(join(PACKAGE, "dist", "test", "package-check", "verify.json"), "utf8")).files);
  // C15 explicitly amends N11/A11: Node delivery changes; claim exclusion and containment remain.
  assert.deepEqual(packed.filter((p) => p.startsWith("dist/kaal/")), [PACKED_NODE]);
  assert.ok(listed.includes(PACKED_NODE), "the delivered Node is in dist/test/package-check/verify.json");
  for (const path of [CLAIM]) {
    assert.ok(!packed.some((p) => p === path), `${path} is not packed`);
    assert.ok(!listed.includes(path), `${path} is not in dist/test/package-check/verify.json`);
  }
  const claim = JSON.parse(readFileSync(join(PACKAGE, CLAIM), "utf8"));
  for (const path of claim.paths) assert.ok(path.startsWith(LOCATION), `${path} lies in ${LOCATION}`);
  for (const root of ["package.json", "package-lock.json"]) assert.ok(!claim.paths.includes(root), `Foundation does not claim the root ${root}`);
});
