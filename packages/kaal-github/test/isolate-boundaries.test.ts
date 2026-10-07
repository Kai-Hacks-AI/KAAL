// The isolation control, over a throwaway repository: which changes may travel together.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync, appendFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { isolateBoundaries } from "../src/controls.js";

const git = (cwd: string, ...args: string[]) => {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
};

const repo = mkdtempSync(join(tmpdir(), "isolate-"));
process.on("exit", () => rmSync(repo, { recursive: true, force: true }));
git(repo, "init", "-q", "-b", "main");
git(repo, "config", "user.email", "t@t");
git(repo, "config", "user.name", "t");
const touch = (f: string) => {
  mkdirSync(dirname(join(repo, f)), { recursive: true });
  appendFileSync(join(repo, f), `${Math.random()}\n`);
};
for (const f of ["packages/kaal-core/a", "engineering/kaal-core/a", ".github/workflows/w", "README", "docs/d"]) writeFileSync(join(repo, (mkdirSync(dirname(join(repo, f)), { recursive: true }), f)), "0\n");
git(repo, "add", "-A");
git(repo, "commit", "-qm", "base");

const CHANGE = ".kaal/changes/genesis/26/10/06/01";
const cases: [boolean, string, string[]][] = [
  [true, "no change", []],
  [true, "ordinary files only", ["README", "docs/d"]],
  [true, "core only", ["packages/kaal-core/a", "engineering/kaal-core/a"]],
  [true, ".github only", [".github/workflows/w"]],
  [false, "core + ordinary", ["packages/kaal-core/a", "README"]],
  [false, ".github + ordinary", [".github/workflows/w", "README"]],
  [false, "core + .github", ["packages/kaal-core/a", ".github/workflows/w"]],
  [false, "new file under .github + ordinary", [".github/new.yml", "docs/d"]],
  [true, "a Change record only", [`${CHANGE}/work/a`, ".kaal/seals/changes/x", ".kaal/seals/trees/x"]],
  [true, "core + its Change record", ["packages/kaal-core/a", `${CHANGE}/work/a`, ".kaal/seals/changes/x"]],
  [true, ".github + its Change record", [".github/workflows/w", `${CHANGE}/retro-work.md`, ".kaal/seals/trees/x"]],
  [false, "core + record + ordinary", ["packages/kaal-core/a", `${CHANGE}/work/a`, "README"]],
  [false, ".github + a Node seal", [".github/workflows/w", ".kaal/seals/node/z"]],
  [false, ".github + other .kaal", [".github/workflows/w", ".kaal/core/x"]],
  [false, "core + .github + record", ["packages/kaal-core/a", ".github/workflows/w", `${CHANGE}/work/a`]],
];

for (const [holds, name, files] of cases) {
  test(`isolate-boundaries: ${name}`, () => {
    git(repo, "checkout", "-q", "-B", "t", "main");
    for (const f of files) touch(f);
    git(repo, "add", "-A");
    git(repo, "commit", "-q", "--allow-empty", "-m", "t");
    const verdict = isolateBoundaries(repo, "main");
    assert.equal(verdict.ok, holds, verdict.messages.join("\n"));
    if (!holds) assert.match(verdict.messages[0], /may change nothing outside it/);
  });
}

test("isolate-boundaries: an unknown target is an error, not a pass", () => {
  assert.throws(() => isolateBoundaries(repo, "no-such-ref"), /cannot compare/);
});
