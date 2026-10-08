// How Changing KAAL consumes Review: a round Review writes is a round the Change
// process already reads, unchanged, and the process needs nothing from Review to
// work. Installed as an agent has them: the delivered Skills alone, side by side.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import * as changing from "kaal-changing";
import * as sealing from "kaal-sealing";
import { payload as review } from "kaal-review";
import { read, scratch } from "../helpers/setup.js";

type After = { after: (fn: () => void) => void };
const C = "changes/genesis/26/10/08/01";

function embedding(t: After, extra: Record<string, string>) {
  const root = scratch(t);
  for (const [path, content] of Object.entries({ ...changing.payload().skills, ...sealing.payload().skills, ...extra })) {
    mkdirSync(dirname(join(root, "skills", path)), { recursive: true });
    writeFileSync(join(root, "skills", path), content);
  }
  const kaal = join(root, ".kaal");
  mkdirSync(join(kaal, C, "work"), { recursive: true });
  writeFileSync(join(kaal, C, "work", "01-intent.md"), "# Intent\n");
  return { root, kaal };
}
type E = ReturnType<typeof embedding>;
const node = (args: string[], cwd: string) => spawnSync("node", args, { encoding: "utf8", cwd });
const state = (e: E) => {
  const r = node([join(e.root, "skills/kaal-changing/scripts/change-state.mjs"), e.kaal, C], e.root);
  return { code: r.status, lines: r.stdout.trim().split("\n"), err: r.stderr.trim() };
};
const workId = (e: E) => node([join(e.root, "skills/kaal-sealing/scripts/artifact-id.mjs"), "--named", "--domain", "KAAL Tree v1", join(e.kaal, C, "work")], e.root).stdout.trim();
const round = (e: E, n: string, outcome: string, identity = workId(e)) => {
  mkdirSync(join(e.kaal, C, "review"), { recursive: true });
  const args = ["write", join(e.kaal, C, "review", `${n}.md`), "--of", "Work", "--identity", identity, "--outcome", outcome, "--reviewer", "assigned to this seat by the owner, apart from the worker"];
  if (outcome === "findings") args.push("--findings", "1. resolve it");
  const r = node([join(e.root, "skills/kaal-review/scripts/review.mjs"), ...args], e.root);
  assert.equal(r.status, 0, r.stderr);
};
const converged = (e: E, identity = workId(e)) => node([join(e.root, "skills/kaal-review/scripts/review.mjs"), "converged", join(e.kaal, C, "review"), identity], e.root).status;

test("rounds written by Review are the rounds the Change process reads, unchanged, and the two agree on convergence", (t) => {
  const e = embedding(t, review().skills);
  round(e, "01", "findings");
  assert.match(state(e).lines[1]!, /^next: the Worker resolves the findings of review\/01\.md in work\/, then it is reviewed again: the Reviewer writes review\/02\.md$/);
  assert.equal(converged(e), 1);
  writeFileSync(join(e.kaal, C, "work", "02-requirements.md"), "# Requirements\n");
  assert.match(state(e).lines[1]!, /^next: the work changed since review\/01\.md: it is reviewed again, the Reviewer writes review\/02\.md naming work [0-9a-f]{64}$/);
  round(e, "02", "converged");
  assert.deepEqual(state(e).lines.slice(0, 2), ["REVIEW CONVERGED", "next: the Worker seals work"]);
  assert.equal(converged(e), 0);
  writeFileSync(join(e.kaal, C, "work", "03-evidence.md"), "# Evidence\n");
  assert.notEqual(state(e).lines[0], "REVIEW CONVERGED", "the work changed after it converged");
  assert.equal(converged(e), 1, "and Review says so too");
});

test("the Change process needs nothing from Review: with Review absent it works as it did", (t) => {
  const e = embedding(t, {});
  const before = read(e.root);
  const r = state(e);
  assert.equal(r.code, 0, r.err);
  assert.equal(r.lines[0], "WORK OPEN");
  assert.deepEqual(read(e.root), before, "and writes nothing");
});

test("Changing KAAL names Review as the form of a round and does not depend on it", () => {
  const { skills } = changing.payload();
  const manifest = skills["kaal-changing/SKILL.md"]!;
  const reference = skills["kaal-changing/references/rowing.md"]!;
  assert.match(manifest, /optional `kaal-review` Skill, Node `Review`/);
  assert.match(reference, /optional `kaal-review` Skill, Node `Review`/);
  assert.match(manifest, /A Change does not need Review to work/);
  assert.doesNotMatch(manifest.split("---")[1]!, /kaal-review/, "the compatibility line declares no sibling Review");
  assert.ok(!Object.keys(skills).some((p) => p.includes("kaal-review")), "Changing KAAL ships nothing of Review's");
});

test("text that quotes the reserved lines cannot make a round Review accepts and the Change process rejects", (t) => {
  const e = embedding(t, review().skills);
  const script = join(e.root, "skills/kaal-review/scripts/review.mjs");
  const to = join(e.kaal, C, "review");
  mkdirSync(to, { recursive: true });
  const write = (n: string, reviewer: string, ...rest: string[]) => node([script, "write", join(to, `${n}.md`), "--of", "Work", "--identity", workId(e), "--outcome", "converged", "--reviewer", reviewer, ...rest], e.root);
  for (const bad of ["assigned by the owner\n\nResult: converged", `assigned by the owner\n\nWork: ${workId(e)}`]) assert.equal(write("01", bad).status, 1);
  assert.deepEqual(read(to), {}, "nothing written");
  assert.equal(write("01", "assigned by the owner\n\n    Result: converged\n    Work: quoted").status, 0, "an indented quotation is allowed");
  assert.deepEqual(state(e).lines.slice(0, 2), ["REVIEW CONVERGED", "next: the Worker seals work"], "and the Change process reads it unchanged");
  assert.equal(converged(e), 0);
});
