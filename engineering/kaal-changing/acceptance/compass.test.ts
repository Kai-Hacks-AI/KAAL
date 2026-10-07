// The process compass, run as an agent runs it where KAAL is embedded: from the
// delivered Skills alone, in a directory that holds no repository, no engineering
// and no root package.json. What is installed is exactly what the two packages
// ship, kaal-changing and the kaal-sealing Skill beside it; identities and seals
// are made only with Sealing's own scripts. The compass writes nothing.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import * as changing from "kaal-changing";
import * as sealing from "kaal-sealing";
import { REPO, read, scratch } from "../helpers/setup.js";

type After = { after: (fn: () => void) => void };
const C = "changes/genesis/26/10/07/01";

/** An embedding: a host skills/ directory holding the shipped Skills, and a KAAL directory beside it. Nothing else. */
function embedding(t: After, skills: Record<string, string> = { ...changing.payload().skills, ...sealing.payload().skills }) {
  const root = scratch(t);
  for (const [path, content] of Object.entries(skills)) {
    mkdirSync(dirname(join(root, "skills", path)), { recursive: true });
    writeFileSync(join(root, "skills", path), content);
  }
  const kaal = join(root, ".kaal");
  mkdirSync(join(kaal, C, "work"), { recursive: true });
  writeFileSync(join(kaal, C, "work", "01-intent.md"), "# Intent\n");
  return { root, kaal, script: join(root, "skills/kaal-changing/scripts/change-state.mjs"), sealing: join(root, "skills/kaal-sealing/scripts") };
}
type Embedding = ReturnType<typeof embedding>;

const run = (e: Embedding, ...args: string[]) => {
  const r = spawnSync("node", [e.script, ...args], { encoding: "utf8", cwd: e.root });
  return { code: r.status, lines: r.stdout.trim().split("\n"), err: r.stderr.trim() };
};
const state = (e: Embedding) => run(e, e.kaal, C);
/** Identities and seals as an agent obtains them: from Sealing's scripts. */
const id = (e: Embedding, ...args: string[]) => spawnSync("node", [join(e.sealing, "artifact-id.mjs"), ...args], { encoding: "utf8" }).stdout.trim();
const seal = (e: Embedding, dir: string, sealId: string) => spawnSync("node", [join(e.sealing, "seal.mjs"), "write", join(e.kaal, dir), sealId], { encoding: "utf8" });
const workId = (e: Embedding) => id(e, "--named", "--domain", "KAAL Tree v1", join(e.kaal, C, "work"));
const round = (e: Embedding, n: string, result: string, work = workId(e)) => {
  mkdirSync(join(e.kaal, C, "review"), { recursive: true });
  writeFileSync(join(e.kaal, C, "review", `${n}.md`), `# Review\n\nWork: ${work}\nResult: ${result}\n`);
};

test("where it is installed beside kaal-sealing and nothing else, it says where the Change is, whose act is next, and the Work identity a round names", (t) => {
  const e = embedding(t);
  const r = state(e);
  assert.equal(r.code, 0, r.err);
  assert.deepEqual(r.lines, ["WORK OPEN", `next: the Worker completes the work, then it is reviewed: the Reviewer writes review/01.md naming work ${workId(e)}`, `work: ${workId(e)}`]);
  assert.deepEqual(readdirSync(e.root).sort(), [".kaal", "skills"], "no repository, engineering or package.json is involved");
});

test("it follows the whole process to closed, each stage naming its role, from artifacts and seals alone", (t) => {
  const e = embedding(t);
  round(e, "01", "findings");
  assert.match(state(e).lines[1]!, /^next: the Worker resolves the findings of review\/01\.md in work\/, then it is reviewed again: the Reviewer writes review\/02\.md$/);
  writeFileSync(join(e.kaal, C, "work", "02-requirements.md"), "# Requirements\n");
  assert.match(state(e).lines[1]!, /^next: the work changed since review\/01\.md: it is reviewed again, the Reviewer writes review\/02\.md naming work [0-9a-f]{64}$/);
  round(e, "02", "converged");
  assert.deepEqual(state(e).lines.slice(0, 2), ["REVIEW CONVERGED", "next: the Worker seals work"]);
  seal(e, "seals/trees", workId(e));
  assert.deepEqual(state(e).lines, ["WORK SEALED", "next: the Worker writes retro-work.md (the Work's seat), first", `work: ${workId(e)}`]);
  writeFileSync(join(e.kaal, C, "retro-work.md"), "# Retro\n");
  assert.equal(state(e).lines[0], "RETRO-WORK PRESENT");
  assert.match(state(e).lines[1]!, /^next: the Owner judges the sealed Work against the Intent, a judgment that is no artifact, then writes retro-owner\.md/);
  writeFileSync(join(e.kaal, C, "retro-owner.md"), "# Retro\n");
  assert.match(state(e).lines[1]!, /^next: the Reviewer writes retro-review\.md/);
  writeFileSync(join(e.kaal, C, "retro-review.md"), "# Retro\n");
  assert.deepEqual(state(e).lines.slice(0, 2), ["RETROS PRESENT", "next: the Reviewer seals Change"]);
  seal(e, "seals/changes", id(e, "--domain", "KAAL Change v1", join(e.kaal, C)));
  const closed = state(e);
  assert.deepEqual(closed.lines, ["CHANGE CLOSED", "next: none"]);
  assert.equal(closed.code, 0);
});

test("a problem and a tampered seal are reported as they are, with a non-zero exit and the restore instruction", (t) => {
  const e = embedding(t);
  round(e, "01", "converged");
  seal(e, "seals/trees", workId(e));
  writeFileSync(join(e.kaal, C, "work", "01-intent.md"), "# Intent, edited after the seal\n");
  const r = state(e);
  assert.equal(r.code, 1);
  assert.match(r.lines[1]!, /^next: restore the altered or removed sealed record, as it was sealed; nothing else is valid until then$/);
  assert.ok(r.lines.some((l) => /^problem: seals\/trees\/[0-9a-f]{64} matches no work\/: sealed work was altered or removed$/.test(l)));
});

test("it writes nothing, in the KAAL directory or anywhere else", (t) => {
  const e = embedding(t);
  round(e, "01", "converged");
  const before = read(e.root);
  state(e);
  state(e);
  assert.deepEqual(read(e.root), before);
});

test("an unknown address, a missing argument and a missing Sealing are refused, each saying why", (t) => {
  const e = embedding(t);
  const unknown = run(e, e.kaal, "changes/genesis/26/10/07/09");
  assert.equal(unknown.code, 1);
  assert.match(unknown.err, /is not a Change directory/);
  assert.equal(run(e, e.kaal).code, 2);

  const without = embedding(t, changing.payload().skills);
  const refused = state(without);
  assert.equal(refused.code, 1);
  assert.match(refused.err, /kaal-sealing is not installed beside kaal-changing/);
  assert.deepEqual(refused.lines, [""], "it prints no state it could not establish");
});

test("a Change closed before review and before Work existed is judged by its own seal, as in this repository", (t) => {
  const e = embedding(t);
  rmSync(join(e.kaal, C), { recursive: true });
  const closed = "changes/genesis/26/10/05/01";
  cpSync(join(REPO, ".kaal", closed), join(e.kaal, closed), { recursive: true });
  seal(e, "seals/changes", id(e, "--domain", "KAAL Change v1", join(e.kaal, closed)));
  seal(e, "seals/trees", id(e, "--named", "--domain", "KAAL Tree v1", join(e.kaal, closed, "work")));
  assert.ok(readdirSync(join(REPO, ".kaal", "seals", "changes")).includes(id(e, "--domain", "KAAL Change v1", join(e.kaal, closed))), "it is sealed in this repository as it is here");
  const r = run(e, e.kaal, closed);
  assert.deepEqual(r.lines, ["CHANGE CLOSED", "next: none"], r.err);
});

test("the compass speaks of no host and carries no sealing of its own", () => {
  const source = readFileSync(join(REPO, "packages/kaal-changing/skills/kaal-changing/scripts/change-state.mjs"), "utf8").replace(/^(#!.*\n)?(\/\/.*\n)+/, "");
  for (const word of [/github/i, /pull request/i, /\bPRs?\b/, /\bbranch/i, /\bCI\b/, /ruleset/i, /createHash|writeFileSync|mkdirSync|rmSync/]) assert.doesNotMatch(source, word);
});
