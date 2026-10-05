// The process work -> seal work -> retro-work -> retro-observe -> seal Change, through the commands as
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
const retro = (dir: string, ...names: string[]) => names.forEach((n) => writeFileSync(join(dir, C, n), "# Retro\n"));
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
  assert.equal(stage(dir), "WORK SEALED\nnext: write retro-work.md");
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
  assert.equal(stage(dir, other), "WORK SEALED\nnext: write retro-work.md");
});

test("work/ renamed, even whole, is not the sealed Work: its name is part of its identity", (t) => {
  const dir = sealedWork(t);
  renameSync(join(dir, C, "work"), join(dir, C, "evidence"));
  assert.equal(run("check", dir).code, 1);
  assert.equal(stage(dir).split("\n")[0], "WORK OPEN");
});

test("a retrospective is not a valid step before Work is sealed, and sealing Work after one is refused", (t) => {
  for (const name of ["retro-work.md", "retro-observe.md", "retro.md"]) {
    const dir = kaal(t);
    work(dir);
    retro(dir, name);
    const state = run("state", dir, C);
    assert.equal(state.out.split("\n")[0], "WORK OPEN");
    assert.match(state.out, new RegExp(`next: remove ${name.replace(".", "\\.")}, then complete and seal work`));
    assert.equal(state.code, 1, name);
    assert.equal(run("seal-work", dir, C).code, 1);
    assert.equal(run("close", dir, C).code, 1);
    assert.ok(!existsSync(join(dir, "seals")), "nothing was written");
  }
});

test("once Work is sealed, the worker's retro is next, then the observer's, and neither disturbs the Work seal", (t) => {
  const dir = sealedWork(t);
  assert.equal(run("close", dir, C).code, 1, "a Change with no retro cannot be sealed");
  retro(dir, "retro-work.md");
  assert.match(stage(dir), /^RETRO-WORK PRESENT\nnext: the observer reads the Work and retro-work\.md, then writes retro-observe\.md$/);
  assert.equal(run("close", dir, C).code, 1, "the worker's retro alone does not close a Change");
  assert.equal(run("check", dir).code, 0, "the Work seal still matches");
  retro(dir, "retro-observe.md");
  assert.equal(stage(dir), "RETRO-OBSERVE PRESENT\nnext: seal Change");
  assert.equal(run("check", dir).code, 0);
  assert.equal(run("seal-work", dir, C).code, 1, "work is no longer open");
});

test("the observer's retro without the worker's is not a valid step", (t) => {
  const dir = sealedWork(t);
  retro(dir, "retro-observe.md");
  const state = run("state", dir, C);
  assert.equal(state.out.split("\n")[0], "WORK SEALED");
  assert.match(state.out, /problem: retro-observe\.md exists without retro-work\.md/);
  assert.equal(state.code, 1);
  assert.equal(run("close", dir, C).code, 1);
});

test("the historical retro.md is not a step of an open Change, and does not stand in for the two", (t) => {
  const dir = sealedWork(t);
  retro(dir, "retro.md");
  const state = run("state", dir, C);
  assert.match(state.out, /^WORK SEALED\nnext: remove retro\.md, then write retro-work\.md/);
  assert.match(state.out, /problem: retro\.md is the historical form, valid only in a closed Change/);
  assert.equal(state.code, 1);
  assert.equal(run("close", dir, C).code, 1);
  retro(dir, "retro-work.md", "retro-observe.md");
  assert.equal(run("close", dir, C).code, 1, "retro.md beside the two is still refused");
});

test("closing seals Work + both retros into the Change's identity, once", (t) => {
  const dir = sealedWork(t);
  retro(dir, "retro-work.md", "retro-observe.md");
  const id = run("close", dir, C).out;
  assert.match(id, /^[0-9a-f]{64}$/);
  assert.equal(stage(dir), "CHANGE CLOSED\nnext: none");
  assert.equal(run("closed", dir).out, `${C} ${id}`);
  assert.equal(run("close", dir, C).out, id, "closing again changes nothing");
  assert.equal(run("check", dir).code, 0);
  assert.equal(readdirSync(join(dir, "seals")).join(), "changes,trees", "no retro seal exists, only the Work and Change seals");
  writeFileSync(join(dir, C, "retro-observe.md"), "revised");
  assert.equal(run("closed", dir).out, "", "the Change identity covers the observer's retro");
  writeFileSync(join(dir, C, "retro-observe.md"), "# Retro\n");
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

test("a closed Change keeps the historical single retro.md and is judged by its own seal, whatever the form", (t) => {
  const dir = sealedWork(t);
  retro(dir, "retro.md");
  assert.match(run("seal", dir, C).out, /^[0-9a-f]{64}$/, "sealed as the historical Changes were: the bare primitive");
  assert.equal(stage(dir), "CHANGE CLOSED\nnext: none");
  assert.equal(run("check", dir).code, 0);
  assert.equal(run("state", dir, C).code, 0);
});

test("this repository's Change 05/01 closed with the single retro.md and stays valid as it is", () => {
  const repo = new URL("../../../../.kaal", import.meta.url).pathname;
  const c = "changes/genesis/26/10/05/01";
  assert.equal(run("state", repo, c).out, "CHANGE CLOSED\nnext: none");
  assert.deepEqual(readdirSync(join(repo, c)).sort(), ["retro.md", "work"]);
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
