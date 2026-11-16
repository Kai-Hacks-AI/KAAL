// Case release/T515 (release/C37): the local script runs the same Developing judgement before a push
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SRC, tmpTree, edit } from "./helper.mjs";

export const id = "release/T515";
export const tests = ["release/C37"];
export const title = "the local script is a POSIX sh source that runs the Developing judgement of the same judge on its repository: exit 0 on the agreed tree, non-zero on a changed dispatcher, and non-zero when it cannot judge";
export async function run() {
  const script = join(SRC, "wiring/hooks/verify-stages-developing");
  const text = readFileSync(script, "utf8");
  assert.ok(text.startsWith("#!/bin/sh\n"), "POSIX sh");
  assert.ok(/judge\.mjs/.test(text) && /Developing/.test(text), "runs the one judge for Developing");
  const hook = (dir) => spawnSync("sh", [join(dir, "engineering/release-management/05-src/wiring/hooks/verify-stages-developing")], { cwd: dir, encoding: "utf8", env: { ...process.env, KAAL_ROOT: dir } });
  const ok = tmpTree();
  try { assert.equal(hook(ok.dir).status, 0, "the agreed tree passes"); } finally { ok.done(); }
  const bad = tmpTree((d) => edit(d, ".githooks/pre-push", "#!/bin/sh\nexit 0\n"));
  try { assert.notEqual(hook(bad.dir).status, 0, "a changed dispatcher fails"); } finally { bad.done(); }
  const none = tmpTree((d) => edit(d, "engineering/release-management/05-src/stages/stages.json", "{"));
  try { assert.notEqual(hook(none.dir).status, 0, "it fails closed when it cannot judge"); } finally { none.done(); }
}
