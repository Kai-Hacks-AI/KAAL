// The process work <-> review -> seal work -> the three retrospectives -> seal Change, through the
// commands as they are run: where a Change is, what is allowed next, and what is refused.
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
/** The identity of work/ as it now stands, as the state command prints it for a Reviewer to name. */
const workId = (dir: string, change = C) => /^work: ([0-9a-f]{64})$/m.exec(run("state", dir, change).out)![1]!;
/** One review round, as a Reviewer writes it; by default it names the Work as it now stands. */
const round = (dir: string, number: string, result: "findings" | "converged", id = workId(dir)) => {
  mkdirSync(join(dir, C, "review"), { recursive: true });
  writeFileSync(join(dir, C, "review", `${number}.md`), `# Review\n\nWork: ${id}\nResult: ${result}\n\n## Findings\n\n${result === "converged" ? "None." : "A finding."}\n`);
};
const work = (dir: string, files: Record<string, string> = { "a": "a", "b/c": "c" }) => {
  for (const [p, c] of Object.entries(files)) {
    mkdirSync(join(dir, C, "work", p, ".."), { recursive: true });
    writeFileSync(join(dir, C, "work", p), c);
  }
};
const convergedWork = (t: TestContext) => {
  const dir = kaal(t);
  work(dir);
  round(dir, "01", "converged");
  return dir;
};
const sealedWork = (t: TestContext) => {
  const dir = convergedWork(t);
  assert.equal(run("seal-work", dir, C).code, 0);
  return dir;
};

test("a newly allocated Change is open; open Work may evolve and has a deterministic identity", (t) => {
  const dir = kaal(t);
  assert.equal(stage(dir), "WORK OPEN\nnext: the Worker does the work in work/, then it is reviewed");
  work(dir);
  assert.match(stage(dir), /^WORK OPEN\nnext: the Worker completes the work, then it is reviewed: the Reviewer writes review\/01\.md naming work [0-9a-f]{64}$/);
  const before = workId(dir);
  assert.equal(workId(dir), before, "the identity is deterministic");
  writeFileSync(join(dir, C, "work", "a"), "evolved");
  assert.notEqual(workId(dir), before, "open Work may evolve, and its identity follows it");
  assert.equal(run("check", dir).code, 0, "an open Work may evolve");
  assert.equal(run("state", dir, C).code, 0);
});

test("review is rounds: findings keep the Work open, a change after a round calls for another, and convergence is derived", (t) => {
  const dir = kaal(t);
  work(dir);
  round(dir, "01", "findings");
  assert.match(stage(dir), /^WORK OPEN\nnext: the Worker resolves the findings of review\/01\.md in work\/, then it is reviewed again: the Reviewer writes review\/02\.md$/);
  assert.equal(run("seal-work", dir, C).code, 1, "findings stand: the Work is not sealed");
  writeFileSync(join(dir, C, "work", "a"), "resolved");
  assert.match(stage(dir), /^WORK OPEN\nnext: the work changed since review\/01\.md: it is reviewed again, the Reviewer writes review\/02\.md naming work [0-9a-f]{64}$/);
  round(dir, "02", "converged");
  assert.equal(stage(dir), "REVIEW CONVERGED\nnext: the Worker seals work");
  assert.equal(run("state", dir, C).code, 0);
  writeFileSync(join(dir, C, "work", "a"), "changed after convergence");
  assert.match(stage(dir), /^WORK OPEN\nnext: the work changed since review\/02\.md/, "changing the Work after convergence undoes convergence");
  assert.equal(run("seal-work", dir, C).code, 1);
  assert.ok(!existsSync(join(dir, "seals")), "nothing was sealed");
});

test("a round that names other Work does not converge this one", (t) => {
  const dir = kaal(t);
  work(dir);
  round(dir, "01", "converged", "0".repeat(64));
  assert.match(stage(dir), /^WORK OPEN\nnext: the work changed since review\/01\.md/);
  assert.equal(run("seal-work", dir, C).code, 1);
});

test("only the latest round decides: a later round with findings reopens what an earlier one converged", (t) => {
  const dir = kaal(t);
  work(dir);
  round(dir, "01", "converged");
  round(dir, "02", "findings");
  assert.match(stage(dir), /^WORK OPEN\nnext: the Worker resolves the findings of review\/02\.md/);
  assert.equal(run("seal-work", dir, C).code, 1);
});

test("review rounds must be well formed, numbered without a gap, and alone in review/", (t) => {
  const bad: Record<string, (d: string) => void> = {
    "no Work line": (d) => writeFileSync(join(d, C, "review", "01.md"), "# Review\n\nResult: converged\n"),
    "no Result line": (d) => writeFileSync(join(d, C, "review", "01.md"), `# Review\n\nWork: ${workId(d)}\n`),
    "an unknown result": (d) => writeFileSync(join(d, C, "review", "01.md"), `# Review\n\nWork: ${workId(d)}\nResult: approved\n`),
    "an identity that is not one": (d) => writeFileSync(join(d, C, "review", "01.md"), "# Review\n\nWork: abc\nResult: converged\n"),
    "two Result lines": (d) => writeFileSync(join(d, C, "review", "01.md"), `# Review\n\nWork: ${workId(d)}\nResult: converged\nResult: findings\n`),
    "a gap in the numbering": (d) => {
      rmSync(join(d, C, "review", "01.md"));
      round(d, "02", "converged");
    },
    "a file that is not a round": (d) => writeFileSync(join(d, C, "review", "notes.md"), "x"),
  };
  for (const [what, make] of Object.entries(bad)) {
    const dir = kaal(t);
    work(dir);
    round(dir, "01", "converged");
    make(dir);
    const state = run("state", dir, C);
    assert.equal(state.code, 1, `${what}: reported`);
    assert.match(state.out, /problem: review\//, what);
    assert.equal(run("seal-work", dir, C).code, 1, `${what}: not sealed`);
  }
});

test("sealing Work freezes its exact tree by identity, and the seal sits outside it", (t) => {
  const dir = sealedWork(t);
  assert.match(stage(dir), /^WORK SEALED\nnext: the Worker writes retro-work\.md \(the Work's seat\), first$/);
  assert.equal(readdirSync(join(dir, "seals", "trees")).length, 1);
  assert.deepEqual(readdirSync(join(dir, C)).sort(), ["review", "work"]);
  assert.equal(run("check", dir).code, 0);
  assert.equal(run("state", dir, C).code, 0, "a converged round names exactly the sealed Work");
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
    assert.match(state.out, /\nnext: restore the altered or removed sealed record/, `${what}: next says to restore, not to proceed`);
    assert.equal(run("seal-work", dir, C).code, 1, `${what}: sealing again is refused, review having named other Work`);
  }
});

test("Work is sealed only on a converged review of exactly it: sealed without one is a problem, and a late round with findings is too", (t) => {
  const dir = kaal(t);
  work(dir);
  assert.equal(run("seal-work", dir, C).code, 1, "no review: refused");
  // The primitive in changes.ts has no regard for the process; the evaluator says what is wrong with what it leaves.
  const sealed = convergedWork(t);
  assert.equal(run("seal-work", sealed, C).code, 0);
  round(sealed, "02", "findings", workId(sealed));
  const state = run("state", sealed, C);
  assert.equal(state.code, 1);
  assert.match(state.out, /problem: work\/ is sealed without a converged review of exactly it/);
  assert.equal(run("close", sealed, C).code, 1);
});

test("Work's outer location is not identity: the whole work/ moved unchanged still matches its seal", (t) => {
  const dir = sealedWork(t);
  const other = "changes/genesis/26/10/05/02";
  mkdirSync(join(dir, other));
  renameSync(join(dir, C, "work"), join(dir, other, "work"));
  assert.equal(run("check", dir).code, 0);
  assert.match(stage(dir, other), /^WORK SEALED\n/);
});

test("work/ renamed, even whole, is not the sealed Work: its name is part of its identity", (t) => {
  const dir = sealedWork(t);
  renameSync(join(dir, C, "work"), join(dir, C, "evidence"));
  assert.equal(run("check", dir).code, 1);
  assert.equal(stage(dir).split("\n")[0], "WORK OPEN");
});

test("a retrospective is not a valid step before Work is sealed, and sealing Work after one is refused", (t) => {
  for (const name of ["retro-work.md", "retro-review.md", "retro-owner.md", "retro-observe.md", "retro.md"]) {
    const dir = convergedWork(t);
    retro(dir, name);
    const state = run("state", dir, C);
    assert.equal(state.out.split("\n")[0], "REVIEW CONVERGED");
    assert.match(state.out, new RegExp(`next: remove ${name.replace(".", "\\.")}, then the Worker seals work`));
    assert.equal(state.code, 1, name);
    assert.equal(run("seal-work", dir, C).code, 1);
    assert.equal(run("close", dir, C).code, 1);
    assert.ok(!existsSync(join(dir, "seals")), "nothing was written");
  }
});

test("once Work is sealed, the retrospectives follow in order, Worker then Owner then Reviewer, and none disturbs the Work seal", (t) => {
  const dir = sealedWork(t);
  assert.equal(run("close", dir, C).code, 1, "a Change with no retro cannot be sealed");
  const steps = [
    ["retro-work.md", "RETRO-WORK PRESENT\nnext: the Owner judges the sealed Work against the Intent, a judgment that is no artifact, then writes retro-owner.md (the Owner's seat)"],
    ["retro-owner.md", "RETRO-OWNER PRESENT\nnext: the Reviewer writes retro-review.md (the review's seat), last, with the Worker's and the Owner's retrospectives to hand"],
    ["retro-review.md", "RETROS PRESENT\nnext: the Reviewer seals Change"],
  ] as const;
  for (const [name, expected] of steps) {
    retro(dir, name);
    assert.equal(stage(dir), expected);
    assert.equal(run("check", dir).code, 0, "the Work seal still matches");
    if (name !== "retro-review.md") assert.equal(run("close", dir, C).code, 1, "fewer than three retrospectives do not close a Change");
  }
  assert.equal(run("seal-work", dir, C).code, 1, "work is no longer open");
  assert.equal(run("close", dir, C).code, 0);
});

test("a retrospective written before the one it follows is out of order, and a Change with one cannot be closed", (t) => {
  const outOfOrder: [string[], RegExp][] = [
    [["retro-owner.md"], /problem: retro-owner\.md exists before retro-work\.md/],
    [["retro-review.md"], /problem: retro-review\.md exists before retro-work\.md/],
    [["retro-work.md", "retro-review.md"], /problem: retro-review\.md exists before retro-owner\.md/],
    [["retro-owner.md", "retro-review.md"], /problem: retro-owner\.md exists before retro-work\.md/],
  ];
  for (const [names, problem] of outOfOrder) {
    const dir = sealedWork(t);
    retro(dir, ...names);
    const state = run("state", dir, C);
    assert.match(state.out, problem, names.join());
    assert.equal(state.code, 1, names.join());
    assert.equal(run("close", dir, C).code, 1, names.join());
  }
  const dir = sealedWork(t);
  retro(dir, "retro-owner.md");
  assert.match(stage(dir), /^WORK SEALED\nnext: the Worker writes retro-work\.md/, "the next step is the first missing one in order");
});

test("each of the three retrospectives is needed to close, and the Owner's is not the others'", (t) => {
  const names = ["retro-work.md", "retro-owner.md", "retro-review.md"];
  for (const [k, missing] of names.entries()) {
    const dir = sealedWork(t);
    retro(dir, ...names.filter((n) => n !== missing));
    assert.equal(run("close", dir, C).code, 1, `without ${missing}`);
    if (k === names.length - 1) assert.match(stage(dir), /^RETRO-OWNER PRESENT\nnext: the Reviewer writes retro-review\.md/, missing);
  }
});

test("retro.md, the single historical retrospective, is not a step of an open Change and does not stand in for the three", (t) => {
  const dir = sealedWork(t);
  retro(dir, "retro.md");
  const state = run("state", dir, C);
  assert.match(state.out, /^WORK SEALED\nnext: remove retro\.md, then write retro-work\.md, retro-owner\.md and retro-review\.md, in that order/);
  assert.match(state.out, /problem: retro\.md is the historical form, valid only in a closed Change/);
  assert.equal(state.code, 1);
  assert.equal(run("close", dir, C).code, 1);
  retro(dir, "retro-work.md", "retro-review.md", "retro-owner.md");
  assert.equal(run("close", dir, C).code, 1, "retro.md beside the three is still refused");
});

test("retro-observe.md, the outer perspective as it was once named, is historical: reported in an open Change, never standing in for the Owner's retro-owner.md", (t) => {
  const dir = sealedWork(t);
  retro(dir, "retro-work.md", "retro-observe.md");
  const state = run("state", dir, C);
  assert.match(state.out, /^WORK SEALED\nnext: remove retro-observe\.md, then write retro-work\.md, retro-owner\.md and retro-review\.md, in that order/);
  assert.match(state.out, /problem: retro-observe\.md is the historical form, valid only in a closed Change/);
  assert.equal(state.code, 1);
  assert.equal(run("close", dir, C).code, 1);
  retro(dir, "retro-owner.md");
  assert.equal(run("close", dir, C).code, 1, "retro-observe.md beside the three is still refused");
});

test("closing seals Work, review and the three retros into the Change's identity, once", (t) => {
  const dir = sealedWork(t);
  retro(dir, "retro-work.md", "retro-review.md", "retro-owner.md");
  const id = run("close", dir, C).out;
  assert.match(id, /^[0-9a-f]{64}$/);
  assert.equal(stage(dir), "CHANGE CLOSED\nnext: none");
  assert.equal(run("closed", dir).out, `${C} ${id}`);
  assert.equal(run("close", dir, C).out, id, "closing again changes nothing");
  assert.equal(run("check", dir).code, 0);
  assert.equal(readdirSync(join(dir, "seals")).join(), "changes,trees", "no retro or round seal exists, only the Work and Change seals");
  writeFileSync(join(dir, C, "retro-review.md"), "revised");
  assert.equal(run("closed", dir).out, "", "the Change identity covers the reviewer's retro");
  writeFileSync(join(dir, C, "retro-review.md"), "# Retro\n");
  writeFileSync(join(dir, C, "retro-owner.md"), "revised");
  assert.equal(run("closed", dir).out, "", "the Change identity covers the Owner's retro");
  writeFileSync(join(dir, C, "retro-owner.md"), "# Retro\n");
  writeFileSync(join(dir, C, "review", "01.md"), "revised");
  assert.equal(run("closed", dir).out, "", "the Change identity covers the review");
  round(dir, "01", "converged", workId(dir));
  writeFileSync(join(dir, C, "work", "a"), "tampered");
  assert.equal(run("closed", dir).out, "", "the Change identity covers the Work");
  writeFileSync(join(dir, C, "work", "a"), "a");
  rmSync(join(dir, "seals", "trees"), { recursive: true });
  assert.equal(run("check", dir).code, 1, "a closed Change whose Work seal is gone is reported");
});

test("a sealed Change removed whole damages sealed history: state says to restore and fails, and keeps an address nothing sealed an error in the same KAAL", (t) => {
  const dir = sealedWork(t);
  retro(dir, "retro-work.md", "retro-review.md", "retro-owner.md");
  assert.equal(run("close", dir, C).code, 0);
  rmSync(join(dir, C), { recursive: true });
  for (const address of [C, "changes/genesis/26/10/05/02"]) {
    const state = run("state", dir, address);
    assert.equal(state.code, 1, address);
    assert.match(state.out, new RegExp(`^SEALED HISTORY DAMAGED\\nnext: ${address} cannot be resolved while sealed history is damaged: restore the altered or removed sealed record`), address);
    assert.match(state.out, /problem: seals\/changes\/[0-9a-f]{64} matches no Change/, address);
    assert.match(state.out, new RegExp(`problem: ${address} is not a Change directory`), `${address}: the address error is kept, not hidden`);
    assert.doesNotMatch(state.out, /MISSING/, "no claim that this Change was the one removed");
  }
  const clean = run("state", kaal(t), "changes/genesis/26/10/05/02");
  assert.equal(clean.code, 1);
  assert.match(clean.err, /is not a Change directory/);
  assert.equal(clean.out, "", "a KAAL with no sealed record damaged still just errors");
});

test("the existing Change seal command is the unchanged primitive, and Node seals are untouched", (t) => {
  const dir = kaal(t);
  writeFileSync(join(dir, C, "retro.md"), "# Retro\n");
  mkdirSync(join(dir, "seals"));
  writeFileSync(join(dir, "seals", "a".repeat(64)), "");
  assert.match(run("seal", dir, C).out, /^[0-9a-f]{64}$/);
  assert.deepEqual(readdirSync(join(dir, "seals")).sort(), ["a".repeat(64), "changes"]);
});

test("a closed Change keeps whatever historical form it was sealed in, with no review at all or fewer retrospectives, and is judged by its own seal", (t) => {
  for (const names of [["retro.md"], ["retro-work.md", "retro-observe.md"]]) {
    const dir = sealedWork(t);
    rmSync(join(dir, C, "review"), { recursive: true });
    retro(dir, ...names);
    assert.match(run("state", dir, C).out, /problem: work\/ is sealed without a converged review/, "open, it is reported");
    assert.match(run("seal", dir, C).out, /^[0-9a-f]{64}$/, "sealed as the historical Changes were: the bare primitive");
    assert.equal(stage(dir), "CHANGE CLOSED\nnext: none", names.join());
    assert.equal(run("state", dir, C).code, 0);
    assert.equal(run("check", dir).code, 0);
  }
});

test("this repository's Change 05/01 closed with the single retro.md and stays valid as it is", () => {
  const repo = new URL("../../../../.kaal", import.meta.url).pathname;
  const c = "changes/genesis/26/10/05/01";
  assert.equal(run("state", repo, c).out, "CHANGE CLOSED\nnext: none");
  assert.deepEqual(readdirSync(join(repo, c)).sort(), ["retro.md", "work"]);
});

test("this repository's Change 05/02 closed with retro-work.md and retro-observe.md, before review was a step, and stays valid as it is", () => {
  const repo = new URL("../../../../.kaal", import.meta.url).pathname;
  const c = "changes/genesis/26/10/05/02";
  assert.equal(run("state", repo, c).out, "CHANGE CLOSED\nnext: none");
  assert.deepEqual(readdirSync(join(repo, c)).sort(), ["retro-observe.md", "retro-work.md", "work"]);
});

test("this repository's Change 06/01 closed with retro-work.md and retro-observe.md, before review was a step, and stays valid as it is", () => {
  const repo = new URL("../../../../.kaal", import.meta.url).pathname;
  const c = "changes/genesis/26/10/06/01";
  assert.equal(run("state", repo, c).out, "CHANGE CLOSED\nnext: none");
  assert.deepEqual(readdirSync(join(repo, c)).sort(), ["retro-observe.md", "retro-work.md", "work"]);
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

test("the evaluator and its messages speak of no host", () => {
  const source = readFileSync(new URL("../../../../engineering/change-seal/helpers/process.ts", import.meta.url), "utf8").replace(/^\/\/ This is the one evaluator[\s\S]*?\n(?=\/\/ Changing)/m, "");
  for (const word of [/github/i, /pull request/i, /\bPRs?\b/, /\bbranch/i, /\bCI\b/, /ruleset/i]) assert.doesNotMatch(source, word);
});
