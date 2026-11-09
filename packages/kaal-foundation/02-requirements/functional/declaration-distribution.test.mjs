/*---
tests: [foundation/F25, foundation/N16, foundation/A26]
---*/
// foundation/C15 planned publisher probe, not enrolled until accepted DO.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { sha256 } from "../../05-src/skills/kaal-foundation/scripts/sha256.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const NODE = "kaal/Foundation.md";
const ID = "649fbafb81a8d976b65a4e8c0db7228a194ec515385820d489e4a74041dc27c5";
test("foundation/T46 [foundation/F25, foundation/N16, foundation/A26]: the accepted Foundation Node and claim retain their identity and the scoped public capability export ships that same file", () => {
  const m = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  assert.equal(sha256(readFileSync(join(root, NODE))), ID);
  assert.deepEqual(JSON.parse(readFileSync(join(root, "ownership.kaal.json"), "utf8")), {
    owner: { kind: "capability", name: "Foundation", id: ID }, paths: ["packages/kaal-foundation/"],
  });
  assert.equal(m.exports["./capability"], `./dist/${NODE}`, "missing owner-approved public declaration export");
  assert.deepEqual(m.files, ["dist"], "dist/ is the only shipped thing, and it holds the declaration");
  assert.ok(readFileSync(join(root, ".gitattributes"), "utf8").split(/\r?\n/).includes(`${NODE} -text`), "the byte-preserving attribute names the delivered declaration path");
  assert.equal(m.version, "0.0.2");
  assert.equal(m.scripts?.prepack, "node 04-test/engineering-check/build.mjs", "prepack only builds dist/ from the committed sources (foundation/N15)");
  for (const hook of ["prepare", "preinstall", "install", "postinstall"])
    assert.equal(m.scripts?.[hook], undefined, `declaration delivery adds no ${hook} hook`);
});
