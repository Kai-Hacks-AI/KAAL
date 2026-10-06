// The controls that ask KAAL, over throwaway repositories holding a copy of
// this repository's real `.kaal`: real closed Changes, real seals, the real
// Kernel. A failing candidate is made by a real edit of that copy.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, rmSync, appendFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { KAAL_ROOT } from "../src/kaal.js";
import { containChange, preserveSealedChanges, preserveSeals } from "../src/controls.js";

const run = (cwd: string, cmd: string, ...args: string[]) => {
  const r = spawnSync(cmd, args, { cwd, encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout;
};
const closed = run(KAAL_ROOT, "node", "engineering/change-seal/dist/helpers/cli.js", "closed", ".kaal")
  .split("\n").filter(Boolean).map((l) => l.split(" ") as [string, string]);
const [firstPath, firstId] = closed[0];
const [lastPath, lastId] = closed[closed.length - 1];

/** The real `.kaal`, less any Change still open in this checkout: only closed Changes are real records. */
function copyKaal(dest: string): void {
  cpSync(join(KAAL_ROOT, ".kaal"), dest, { recursive: true });
  const open = run(KAAL_ROOT, "find", ".kaal/changes", "-mindepth", "5", "-maxdepth", "5", "-type", "d").split("\n").filter(Boolean)
    .map((p) => p.replace(/^\.kaal\//, "")).filter((p) => !closed.some(([c]) => c === p));
  for (const p of open) rmSync(join(dest, p), { recursive: true });
  // the work seals of those open Changes go with them, as KAAL itself names them
  for (;;) {
    const r = spawnSync("node", ["engineering/change-seal/dist/helpers/cli.js", "check", dest], { cwd: KAAL_ROOT, encoding: "utf8" });
    const orphan = /seals\/trees\/([0-9a-f]{64}) matches no work\//.exec(r.stderr + r.stdout);
    if (!orphan) break;
    rmSync(join(dest, "seals", "trees", orphan[1]));
  }
}

let scratch: string;
const dirs: string[] = [];
before(() => { scratch = mkdtempSync(join(tmpdir(), "controls-")); });
after(() => rmSync(scratch, { recursive: true, force: true }));

/** A repository whose `main` holds the real `.kaal` less what `without` removes, and whose branch `t` holds all of it, then `edit`. */
function repo(without: (kaal: string) => void, edit: (kaal: string) => void = () => {}): string {
  const dir = join(scratch, `r${dirs.length}`);
  dirs.push(dir);
  copyKaal(join(dir, ".kaal"));
  run(dir, "git", "init", "-q", "-b", "main");
  run(dir, "git", "config", "user.email", "t@t");
  run(dir, "git", "config", "user.name", "t");
  writeFileSync(join(dir, "README"), "x\n");
  without(join(dir, ".kaal"));
  run(dir, "git", "add", "-A");
  run(dir, "git", "commit", "-qm", "base");
  run(dir, "git", "checkout", "-q", "-b", "t");
  copyKaal(join(dir, ".kaal"));
  edit(join(dir, ".kaal"));
  run(dir, "git", "add", "-A");
  run(dir, "git", "commit", "-q", "--allow-empty", "-m", "t");
  return dir;
}
const dropLast = (kaal: string) => {
  rmSync(join(kaal, lastPath), { recursive: true });
  rmSync(join(kaal, "seals", "changes", lastId));
};

test("contain-change: one new closed Change is contained", () => {
  const v = containChange(repo(dropLast), "main");
  assert.ok(v.ok, v.messages.join("\n"));
});
test("contain-change: no new Change is not contained", () => {
  const v = containChange(repo(() => {}), "main");
  assert.equal(v.ok, false);
});
test("contain-change: a new Change that is not closed is not contained", () => {
  const v = containChange(repo(dropLast, (kaal) => rmSync(join(kaal, "seals", "changes", lastId))), "main");
  assert.equal(v.ok, false);
});
test("contain-change: a new Change whose record was altered is not contained", () => {
  const v = containChange(repo(dropLast, (kaal) => appendFileSync(join(kaal, lastPath, "retro.md"), "\nx\n")), "main");
  assert.equal(v.ok, false);
});

test("preserve-sealed-changes: an unchanged closed Change is preserved", () => {
  assert.ok(preserveSealedChanges(repo(() => {}), "main").ok);
});
test("preserve-sealed-changes: a mutated closed Change is not preserved", () => {
  const v = preserveSealedChanges(repo(() => {}, (kaal) => appendFileSync(join(kaal, firstPath, "retro.md"), "\nx\n")), "main");
  assert.equal(v.ok, false);
  assert.match(v.messages.join("\n"), new RegExp(firstId.slice(0, 8)));
});
test("preserve-sealed-changes: a whole closed Change moved is preserved", () => {
  const v = preserveSealedChanges(repo(() => {}, (kaal) => {
    cpSync(join(kaal, firstPath), join(kaal, "changes", "genesis", "26", "10", "04", "09"), { recursive: true });
    rmSync(join(kaal, firstPath), { recursive: true });
  }), "main");
  assert.ok(v.ok, v.messages.join("\n"));
});
test("preserve-sealed-changes: a closed Change removed is not preserved", () => {
  const v = preserveSealedChanges(repo(() => {}, (kaal) => rmSync(join(kaal, firstPath), { recursive: true })), "main");
  assert.equal(v.ok, false);
});

test("preserve-seals: nothing removed is preserved", () => {
  assert.ok(preserveSeals(repo(() => {}), "main").ok);
});
test("preserve-seals: a Node seal removed is not preserved", () => {
  const v = preserveSeals(repo(() => {}, (kaal) => {
    const seal = readdirSync(join(kaal, "seals")).find((n) => /^[0-9a-f]{64}$/.test(n))!;
    rmSync(join(kaal, "seals", seal));
  }), "main");
  assert.equal(v.ok, false);
  assert.match(v.messages.join("\n"), /is in the baseline, but it is not a seal/);
});
test("preserve-seals: the Kernel altered is not preserved", () => {
  const v = preserveSeals(repo(() => {}, (kaal) => appendFileSync(join(kaal, "core", "KERNEL.md"), "\n")), "main");
  assert.equal(v.ok, false);
  assert.match(v.messages.join("\n"), /KERNEL/);
});
test("preserve-seals: a seal added is preserved", () => {
  const v = preserveSeals(repo(() => {}, (kaal) => writeFileSync(join(kaal, "seals", "f".repeat(64)), "")), "main");
  assert.ok(v.ok, v.messages.join("\n"));
});
test("a baseline with no .kaal baselines nothing", () => {
  const dir = repo((kaal) => rmSync(kaal, { recursive: true }));
  assert.ok(preserveSeals(dir, "main").ok);
});
