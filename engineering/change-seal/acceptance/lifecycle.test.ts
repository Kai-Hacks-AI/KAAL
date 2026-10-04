// Open and closed, through the commands as they are run.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { TestContext } from "node:test";

const CLI = new URL("../helpers/cli.js", import.meta.url).pathname;
const run = (...args: string[]) => {
  const r = spawnSync("node", [CLI, ...args], { encoding: "utf8" });
  return { code: r.status, out: r.stdout.trim(), err: r.stderr.trim() };
};
const ONE = "changes/genesis/26/10/04/01";
const TWO = "changes/genesis/26/10/04/02";

function kaal(t: TestContext): string {
  const dir = mkdtempSync(join(tmpdir(), "kaal-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  mkdirSync(join(dir, ONE), { recursive: true });
  writeFileSync(join(dir, ONE, "retro.md"), "# Retro\n");
  return dir;
}

test("a Change is open until sealed, then closed, with no status written anywhere", (t) => {
  const dir = kaal(t);
  assert.equal(run("closed", dir).out, "");
  const id = run("seal", dir, ONE).out;
  assert.match(id, /^[0-9a-f]{64}$/);
  assert.equal(run("closed", dir).out, `${ONE} ${id}`);
  assert.deepEqual(readdirSync(join(dir, ONE)), ["retro.md"], "the seal is outside the tree");
  assert.equal(run("check", dir).code, 0);
  assert.equal(run("seal", dir, ONE).out, id, "sealing again changes nothing");
});

test("any alteration of a sealed Change reopens nothing silently: it is reported", (t) => {
  const mutations: Record<string, (dir: string) => void> = {
    "edit retro.md": (d) => writeFileSync(join(d, ONE, "retro.md"), "changed"),
    "add a file": (d) => writeFileSync(join(d, ONE, "foo.md"), "x"),
    "delete retro.md": (d) => rmSync(join(d, ONE, "retro.md")),
    "rename retro.md": (d) => renameSync(join(d, ONE, "retro.md"), join(d, ONE, "foo.md")),
    "move into a subdirectory": (d) => {
      mkdirSync(join(d, ONE, "sub"));
      renameSync(join(d, ONE, "retro.md"), join(d, ONE, "sub/retro.md"));
    },
    "delete the Change": (d) => rmSync(join(d, ONE), { recursive: true }),
  };
  for (const [what, mutate] of Object.entries(mutations)) {
    const dir = kaal(t);
    run("seal", dir, ONE);
    mutate(dir);
    assert.equal(run("closed", dir).out, "", `${what}: no longer closed`);
    assert.equal(run("check", dir).code, 1, `${what}: reported`);
  }
});

test("sealing is per Change: a new Change is open and the sealed one is untouched", (t) => {
  const dir = kaal(t);
  const id = run("seal", dir, ONE).out;
  mkdirSync(join(dir, TWO));
  writeFileSync(join(dir, TWO, "work.md"), "draft");
  assert.equal(run("closed", dir).out, `${ONE} ${id}`);
  assert.equal(run("check", dir).code, 0);
  writeFileSync(join(dir, TWO, "work.md"), "draft 2");
  assert.equal(run("check", dir).code, 0, "an open Change may evolve");
});

test("a seal sits beside Node seals without disturbing them, and only Change directories seal", (t) => {
  const dir = kaal(t);
  mkdirSync(join(dir, "seals"));
  writeFileSync(join(dir, "seals", "a".repeat(64)), "");
  const id = run("seal", dir, ONE).out;
  assert.ok(existsSync(join(dir, "seals", "changes", id)));
  assert.deepEqual(readdirSync(join(dir, "seals")).sort(), ["a".repeat(64), "changes"]);
  assert.equal(run("seal", dir, "changes/genesis").code, 1);
  assert.equal(run("seal", dir, "core").code, 1);
});

test("an open Change with an unsupported object cannot be sealed", (t) => {
  const dir = kaal(t);
  mkdirSync(join(dir, ONE, "hollow"));
  assert.equal(run("seal", dir, ONE).code, 1);
  assert.deepEqual(readdirSync(dir).includes("seals"), false, "nothing was written");
});

test("identical copies elsewhere read as closed: the address is not identity", (t) => {
  const dir = kaal(t);
  run("seal", dir, ONE);
  cpSync(join(dir, ONE), join(dir, TWO), { recursive: true });
  assert.equal(run("closed", dir).out.split("\n").length, 2);
});

test("this repository's genesis Change 01 is closed, and every Change seal still matches a Change", () => {
  const repo = new URL("../../../.kaal", import.meta.url).pathname;
  const closed = run("closed", repo).out.split("\n");
  assert.ok(closed.some((l) => l.startsWith("changes/genesis/26/10/04/01 ")), "01 is sealed");
  assert.equal(run("check", repo).code, 0);
});
