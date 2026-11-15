// The Owner's review of foundation/C7 (#711): manifest generation's --check is mandatory in the
// publisher's verification. The committed test/verify.json must be exactly what
// test/publisher/manifest.mjs writes from npm's pack list, so any change to a shipped file without a
// regenerated manifest fails here (foundation/F11, foundation/A8). Not shipped.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "manifest.mjs");

test("the committed test/verify.json is current: manifest.mjs --check passes", () => {
  const r = spawnSync(process.execPath, [SCRIPT, "--check"], { encoding: "utf8", env: { ...process.env, NODE_TEST_CONTEXT: undefined } });
  assert.equal(r.status, 0, `${r.stdout}${r.stderr}`);
  assert.match(r.stdout, /test\/verify\.json is current/);
});
