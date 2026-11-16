// Case release/T517 (release/C37): the judge CLI reports Developing with exit 0, 1 and 2
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { SRC, tmpTree, edit } from "./helper.mjs";

export const id = "release/T517";
export const tests = ["release/C37"];
export const title = "node judge.mjs <root> Developing exits 0 on the agreed tree, 1 on a changed dispatcher and 2 when the sources cannot be read";
export async function run() {
  const cli = join(SRC, "stages/judge.mjs");
  const run = (dir) => spawnSync(process.execPath, [cli, dir, "Developing"], { encoding: "utf8" });
  const ok = tmpTree();
  try { assert.equal(run(ok.dir).status, 0); } finally { ok.done(); }
  const bad = tmpTree((d) => edit(d, ".githooks/pre-push", "#!/bin/sh\nexit 0\n"));
  try { assert.equal(run(bad.dir).status, 1); } finally { bad.done(); }
  const none = tmpTree((d) => edit(d, "engineering/release-management/05-src/stages/stages.json", "{"));
  try { assert.equal(run(none.dir).status, 2); } finally { none.done(); }
}
