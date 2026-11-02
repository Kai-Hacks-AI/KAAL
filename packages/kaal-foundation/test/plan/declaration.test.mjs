// foundation/C15 planned publisher probe, not enrolled until accepted DO.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { sha256 } from "../../lib/sha256.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const NODE = "capability/Foundation.md";
const ID = "649fbafb81a8d976b65a4e8c0db7228a194ec515385820d489e4a74041dc27c5";
test("foundation/T46 [foundation/F25, foundation/N16]: the accepted Foundation Node and claim retain their identity and the scoped public capability export ships that same file", () => {
  const m = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  assert.equal(sha256(readFileSync(join(root, NODE))), ID);
  assert.deepEqual(JSON.parse(readFileSync(join(root, "ownership.kaal.json"), "utf8")), {
    owner: { kind: "capability", name: "Foundation", id: ID }, paths: ["packages/kaal-foundation/"],
  });
  assert.equal(m.exports["./capability"], `./${NODE}`, "missing owner-approved public declaration export");
  assert.ok(m.files.includes(NODE), "the authoritative declaration is delivered explicitly");
  assert.equal(m.version, "0.0.2");
  for (const hook of ["prepack", "prepare", "preinstall", "install", "postinstall"])
    assert.equal(m.scripts?.[hook], undefined, `declaration delivery adds no ${hook} hook`);
});
