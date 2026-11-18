// Case engineering/T1030 (engineering/C17): the command line reports and exits
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DIR, REPO, fixture, reg, one, tree } from "./helper.mjs";
export const id = "engineering/T1030";
export const tests = ["engineering/C17"];
export const title = "the command line exits 1 and names each violation for a PR list, exits 0 for a clean one, and --all reports every place of the repository without writing anything";
export async function run() {
  const cli = join(DIR, "check.mjs");
  assert.ok(existsSync(cli), `the registration check is absent: ${cli.replace(REPO + "/", "")}`);
  const root = fixture({ "packages/kaal-a/a.mjs": "", "packages/kaal-b/b.mjs": "", "packages/kaal-b/kaal-guard.json": reg(one) });
  const list = join(fixture({ "l.txt": "packages/kaal-a/a.mjs\n" }), "l.txt");
  const ok = join(fixture({ "l.txt": "packages/kaal-b/b.mjs\n" }), "l.txt");
  const run = (...a) => spawnSync(process.execPath, [cli, ...a], { cwd: root, encoding: "utf8" });
  const bad = run("--changed", list);
  assert.equal(bad.status, 1, "a violation does not exit 1");
  assert.match(bad.stdout, /missing.*packages\/kaal-a/, "the violation is not named");
  assert.equal(run("--changed", ok).status, 0, "a clean change does not exit 0");
  const before = tree(root);
  const all = run("--all");
  assert.equal(all.status, 1);
  assert.match(all.stdout, /packages\/kaal-a/);
  assert.doesNotMatch(all.stdout, /packages\/kaal-b\b.*missing/);
  assert.deepEqual(tree(root), before, "--all wrote into the tree");
}
