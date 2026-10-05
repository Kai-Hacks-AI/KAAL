// The allocator, through the command as an agent would run it: allocation is
// the one procedure where a deterministic script beats judgement (Skill ->
// Script in BASS), so it must decide exactly what it claims and nothing else.
// The capability is also shown to satisfy the conventions kaal-engineering
// teaches, using that capability's own checker.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { CAPABILITY, PACKAGE, REPO, SCRIPTS, deployKaal, read, scratch } from "../helpers/setup.js";

const run = (script: string, ...args: string[]) => {
  const r = spawnSync("node", [join(SCRIPTS, `${script}.mjs`), ...args], { encoding: "utf8" });
  return { code: r.status, out: r.stdout.trim(), err: r.stderr };
};
const next = (root: string, name = "genesis", date = "2026-10-04") => run("next-change", "--date", date, root, name);

test("the first change of a day is 01, and the directory is created and printed", (t) => {
  const root = scratch(t);
  const r = next(root);
  assert.equal(r.code, 0, r.err);
  assert.equal(r.out, "changes/genesis/26/10/04/01/");
  assert.ok(existsSync(join(root, r.out)));
  assert.deepEqual(Object.keys(read(root)), [], "nothing is written but the directory");
});

test("each allocation takes the next number, so two changes never share one", (t) => {
  const root = scratch(t);
  assert.deepEqual([1, 2, 3].map(() => next(root).out.slice(-3, -1)), ["01", "02", "03"]);
});

test("allocation follows the highest number and never reuses a gap", (t) => {
  const root = scratch(t);
  for (const cc of ["01", "04"]) mkdirSync(join(root, "changes/genesis/26/10/04", cc), { recursive: true });
  assert.equal(next(root).out, "changes/genesis/26/10/04/05/");
  mkdirSync(join(root, "changes/genesis/26/10/04/09"));
  assert.equal(next(root).out, "changes/genesis/26/10/04/10/");
});

test("a day, a name and a date count separately", (t) => {
  const root = scratch(t);
  next(root);
  assert.equal(next(root, "genesis", "2026-10-05").out, "changes/genesis/26/10/05/01/");
  assert.equal(next(root, "other").out, "changes/other/26/10/04/01/");
});

test("only two-digit sequence directories count", (t) => {
  const root = scratch(t);
  for (const d of ["00", "1", "100", "x7", "99.bak"]) mkdirSync(join(root, "changes/genesis/26/10/04", d), { recursive: true });
  assert.equal(next(root).out, "changes/genesis/26/10/04/01/");
});

test("it refuses when 99 is exhausted, and creates nothing more", (t) => {
  const root = scratch(t);
  mkdirSync(join(root, "changes/genesis/26/10/04/99"), { recursive: true });
  const before = readdirSync(join(root, "changes/genesis/26/10/04"));
  const r = next(root);
  assert.equal(r.code, 1);
  assert.match(r.err, /99 is taken/);
  assert.deepEqual(readdirSync(join(root, "changes/genesis/26/10/04")), before);
});

test("it refuses a name or date it cannot place, and usage errors exit 2", (t) => {
  const root = scratch(t);
  for (const name of ["Bad Name", "../x", "a--b", "-a"]) assert.equal(next(root, name).code, 1, name);
  for (const date of ["2026-02-30", "26-10-04", "2026-13-01", "today"]) assert.equal(next(root, "genesis", date).code, 1, date);
  assert.deepEqual(Object.keys(read(root)), []);
  assert.equal(run("next-change").code, 2);
  assert.equal(run("next-change", root).code, 2);
});

test("without --date it dates the change today, in UTC", (t) => {
  const root = scratch(t);
  const [y, m, d] = new Date().toISOString().slice(0, 10).split("-");
  assert.equal(run("next-change", root, "genesis").out, `changes/genesis/${y.slice(2)}/${m}/${d}/01/`);
});

test("the capability passes the conventions Engineering KAAL Skill teaches", () => {
  const checker = join(REPO, "packages", "kaal-engineering", "skills", "kaal-engineering", "scripts", "check-skill.mjs");
  const r = spawnSync("node", [checker, REPO, CAPABILITY], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
});

test("registering is Core's: the shipped contribution passes register-skill --check from kaal-engineering", (t) => {
  const registrar = join(REPO, "packages", "kaal-engineering", "skills", "kaal-engineering", "scripts", "register-skill.mjs");
  const r = spawnSync("node", [registrar, "--check", deployKaal(t), CAPABILITY, join(PACKAGE, "kaal")], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /can register kaal-changing: [0-9a-f]{64}/);
});
