// foundation/C15 planned Embedded Case; DO moves unchanged into test/embed/.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import { sha256 } from "@kaihacksai/kaal-foundation/sha256";

const require = createRequire(import.meta.url);
test("foundation/T50 [foundation/F25, foundation/F26]: the public capability data export is Foundation's accepted authoritative Node", () => {
  const bytes = readFileSync(require.resolve("@kaihacksai/kaal-foundation/capability"));
  assert.equal(sha256(bytes), "649fbafb81a8d976b65a4e8c0db7228a194ec515385820d489e4a74041dc27c5");
  assert.match(bytes.toString("utf8"), /^---\nname: Foundation\ntype:\n  name: KAAL Capability\n  id: 56fe97bfa390114264f234bc3198103cb46da306736200af7bc47c0484bcf02e\n---\n/);
});
