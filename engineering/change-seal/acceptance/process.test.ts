// The process work -> seal work -> retro -> seal Change, through the commands as
// they are run: where a Change is, what is allowed next, and what is refused.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { TestContext } from "node:test";

const CLI = new URL("../helpers/cli.js", import.meta.url).pathname;
const run = (...args: string[]) => {
  const r = spawnSync("node", [CLI, ...args], { encoding: "utf8" });
  return { code: r.status, out: r.stdout.trim(), err: r.stderr.trim() };
};
const C = "changes/genesis/26/10/05/01";
const stage = (dir: string, change = C) => run("state", dir, change).out.split("\n").slice(0, 2).join("\n");

function kaal(t: TestContext): string {
  const dir = mkdtempSync(join(tmpdir(), "kaal-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  mkdirSync(join(dir, C), { recursive: true });
  return dir;
}
const work = (dir: string, files: Record<string, string> = { "a": "a", "b/c": "c" }) => {
  for (const [p, c] of Object.entries(files)) {
    mkdirSync(join(dir, C, "work", p, ".."), { recursive: true });
    writeFileSync(join(dir, C, "work", p), c);
  }
};
const sealedWork = (t: TestContext) => {
  const dir = kaal(t);
  work(dir);
  assert.equal(run("seal-work", dir, C).code, 0);
  return dir;
};

test("a newly allocated Change is open; open Work may evolve and has a deterministic identity", (t) => {
  const dir = kaal(t);
  assert.equal(stage(dir), "WORK OPEN\nnext: do the work in work/, then seal it");
  work(dir);
  assert.equal(stage(dir), "WORK OPEN\nnext: complete and seal work");
  writeFileSync(join(dir, C, "work", "a"), "evolved");
  assert.equal(run("check", dir).code, 0, "an open Work may evolve");
  assert.equal(run("state", dir, C).code, 0);
});

test("sealing Work freezes its exact tree by identity, and the seal sits outside it", (t) => {
  const dir = sealedWork(t);
  assert.equal(stage(dir), "WORK SEALED\nnext: write retro.md");
  assert.equal(readdirSync(join(dir, "seals", "trees")).length, 1);
  assert.deepEqual(readdirSync(join(dir, C)), ["work"]);
  assert.equal(run("check", dir).code, 0);
});

test("any mutation of sealed Work is detected, and cannot be laundered by sealing again", (t) => {
  const mutations: Record<string, (d: string) => void> = {
    "edit inside": (d) => writeFileSync(join(d, C, "work", "a"), "x"),
    "add inside": (d) => writeFileSync(join(d, C, "work", "new"), "x"),
    "delete inside": (d) => rmSync(join(d, C, "work", "a")),
    "rename inside": (d) => renameSync(join(d, C, "work", "a"), join(d, C, "work", "z")),
    "move into a subdirectory": (d) => {
      mkdirSync(join(d, C, "work", "s"));
      renameSync(join(d, C, "work", "a"), join(d, C, "work", "s", "a"));
    },
  };
  for (const [what, mutate] of Object.entries(mutations)) {
    const dir = sealedWork(t);
    mutate(dir);
    assert.equal(run("check", dir).code, 1, `${what}: reported`);
    const state = run("state", dir, C);
    assert.equal(state.out.split("\n")[0], "WORK OPEN", `${what}: no longer sealed`);
    assert.equal(state.code, 1, `${what}: with a problem`);
    assert.equal(run("seal-work", dir, C).code, 1, `${what}: sealing again is refused`);
  }
});

test("Work's outer location is not identity: the whole work/ moved unchanged still matches its seal", (t) => {
  const dir = sealedWork(t);
  const other = "changes/genesis/26/10/05/02";
  mkdirSync(join(dir, other));
  renameSync(join(dir, C, "work"), join(dir, other, "work"));
  assert.equal(run("check", dir).code, 0);
  assert.equal(stage(dir, other), "WORK SEALED\nnext: write retro.md");
});

test("work/ renamed, even whole, is not the sealed Work: its name is part of its identity", (t) => {
  const dir = sealedWork(t);
  renameSync(join(dir, C, "work"), join(dir, C, "evidence"));
  assert.equal(run("check", dir).code, 1);
  assert.equal(stage(dir).split("\n")[0], "WORK OPEN");
});

test("retro is not a valid step before Work is sealed, and sealing Work after it is refused", (t) => {
  const dir = kaal(t);
  work(dir);
  writeFileSync(join(dir, C, "retro.md"), "# Retro\n");
  const state = run("state", dir, C);
  assert.equal(state.out.split("\n")[0], "WORK OPEN");
  assert.match(state.out, /next: remove retro\.md, then complete and seal work/);
  assert.match(state.out, /problem: retro\.md exists before the Work is sealed/);
  assert.equal(state.code, 1);
  assert.equal(run("seal-work", dir, C).code, 1);
  assert.equal(run("close", dir, C).code, 1);
  assert.ok(!existsSync(join(dir, "seals")), "nothing was written");
});

test("once Work is sealed, retro is next, and adding it leaves the Work seal valid", (t) => {
  const dir = sealedWork(t);
  assert.equal(run("close", dir, C).code, 1, "a Change with no retro cannot be sealed");
  writeFileSync(join(dir, C, "retro.md"), "# Retro\n");
  assert.equal(stage(dir), "RETRO PRESENT\nnext: seal Change");
  assert.equal(run("check", dir).code, 0, "the Work seal still matches");
  assert.equal(run("seal-work", dir, C).code, 1, "work is no longer open");
});

test("closing seals Work + retro into the Change's identity, once", (t) => {
  const dir = sealedWork(t);
  writeFileSync(join(dir, C, "retro.md"), "# Retro\n");
  const id = run("close", dir, C).out;
  assert.match(id, /^[0-9a-f]{64}$/);
  assert.equal(stage(dir), "CHANGE CLOSED\nnext: none");
  assert.equal(run("closed", dir).out, `${C} ${id}`);
  assert.equal(run("close", dir, C).out, id, "closing again changes nothing");
  assert.equal(run("check", dir).code, 0);
  writeFileSync(join(dir, C, "work", "a"), "tampered");
  assert.equal(run("closed", dir).out, "", "the Change identity covers the Work");
  writeFileSync(join(dir, C, "work", "a"), "a");
  rmSync(join(dir, "seals", "trees"), { recursive: true });
  assert.equal(run("check", dir).code, 1, "a closed Change whose Work seal is gone is reported");
});

test("the existing Change seal command is the unchanged primitive, and Node seals are untouched", (t) => {
  const dir = kaal(t);
  writeFileSync(join(dir, C, "retro.md"), "# Retro\n");
  mkdirSync(join(dir, "seals"));
  writeFileSync(join(dir, "seals", "a".repeat(64)), "");
  assert.match(run("seal", dir, C).out, /^[0-9a-f]{64}$/);
  assert.deepEqual(readdirSync(join(dir, "seals")).sort(), ["a".repeat(64), "changes"]);
});

test("this repository's genesis Change 01 predates Work, is closed, and is not rewritten by the new process", () => {
  const repo = new URL("../../../../.kaal", import.meta.url).pathname;
  const one = "changes/genesis/26/10/04/01";
  assert.equal(run("state", repo, one).out.split("\n")[0], "CHANGE CLOSED");
  assert.equal(readFileSync(join(repo, one, "retro.md"), "utf8").startsWith("#"), true);
  assert.deepEqual(readdirSync(join(repo, one)), ["retro.md"]);
  assert.equal(run("check", repo).code, 0);
});

test("a Work needs files: an empty work/ has no identity and cannot be sealed", (t) => {
  const dir = kaal(t);
  mkdirSync(join(dir, C, "work"));
  assert.equal(run("seal-work", dir, C).code, 1);
});
