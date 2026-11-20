// Case release/T518 (release/C37): the installed .githooks tree of this repository passes the Developing judgement
// RED until the WIRE of this Change installs the local script; that WIRE renames this file to T518.test.mjs.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { SRC, ROOT } from "./helper.mjs";

export const id = "release/T518";
export const tests = ["release/C37"];
export const title = "the installed .githooks tree passes verify Stages (Developing): the dispatcher, the legacy hook, the README and the local script are exactly the declared files";
export async function run() {
  const r = spawnSync(process.execPath, [join(SRC, "stages/judge.mjs"), ROOT, "Developing"], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
}
