// Admission into the lineage, through the command as it is run: what one candidate may introduce
// against a baseline, and each refusal. Fixtures are hand-written KAAL directories.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { TestContext } from "node:test";

const CLI = new URL("../helpers/cli.js", import.meta.url).pathname;
const run = (...args: string[]) => {
  const r = spawnSync("node", [CLI, ...args], { encoding: "utf8" });
  return { code: r.status, out: r.stdout.trim(), err: r.stderr.trim() };
};
const A = "changes/genesis/26/10/06/01";
const B = "changes/genesis/26/10/06/02";

const kaal = (t: TestContext): string => {
  const dir = mkdtempSync(join(tmpdir(), "kaal-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
};
const file = (dir: string, path: string, text: string) => {
  mkdirSync(join(dir, path, ".."), { recursive: true });
  writeFileSync(join(dir, path), text);
};
/** Take a Change through the process to its end, or only part of the way. */
const change = (dir: string, c: string, upTo: "work" | "converged" | "sealed work" | "retro-work" | "retro-owner" | "closed" = "closed") => {
  file(dir, `${c}/work/audit.md`, `evidence of ${c}\n`);
  if (upTo === "work") return;
  const id = /^work: ([0-9a-f]{64})$/m.exec(run("state", dir, c).out)![1];
  file(dir, `${c}/review/01.md`, `# Review\n\nWork: ${id}\nResult: converged\n\n## Findings\n\nNone.\n`);
  if (upTo === "converged") return;
  assert.equal(run("seal-work", dir, c).code, 0);
  if (upTo === "sealed work") return;
  file(dir, `${c}/retro-work.md`, "# Retro\n");
  if (upTo === "retro-work") return;
  file(dir, `${c}/retro-review.md`, "# Retro\n");
  file(dir, `${c}/retro-owner.md`, "# Retro\n");
  if (upTo === "retro-owner") return;
  assert.equal(run("close", dir, c).code, 0);
};
const empty = (t: TestContext) => kaal(t);
/** A baseline holding one closed Change, and a candidate that starts as its copy. */
const pair = (t: TestContext) => {
  const baseline = kaal(t);
  change(baseline, A);
  const candidate = kaal(t);
  cpSync(baseline, candidate, { recursive: true });
  return { baseline, candidate };
};
const admit = (baseline: string, candidate: string) => run("admit", baseline, candidate);

test("one new closed Change is admitted, and it is found by content", (t) => {
  const { baseline, candidate } = pair(t);
  change(candidate, B);
  const r = admit(baseline, candidate);
  assert.equal(r.code, 0, r.err);
  assert.equal(r.out, `admitted: ${B}`);
});

test("the first Change into an empty baseline is admitted", (t) => {
  const candidate = kaal(t);
  change(candidate, A);
  assert.equal(admit(empty(t), candidate).code, 0);
});

test("a candidate with no new Change is refused", (t) => {
  const { baseline, candidate } = pair(t);
  const r = admit(baseline, candidate);
  assert.equal(r.code, 1);
  assert.match(r.err, /introduces no new Change/);
  assert.equal(admit(baseline, baseline).code, 1, "nothing to admit at all");
});

test("a closed Change moved whole is not new, so it is not an admission either", (t) => {
  const { baseline, candidate } = pair(t);
  mkdirSync(join(candidate, "changes/genesis/26/10/06/03/.."), { recursive: true });
  renameSync(join(candidate, A), join(candidate, "changes/genesis/26/10/06/03"));
  const r = admit(baseline, candidate);
  assert.equal(r.code, 1);
  assert.equal(r.err, "the candidate introduces no new Change: everything that joins the lineage is a Change");
});

test("more than one new Change is refused, even when both are closed", (t) => {
  const { baseline, candidate } = pair(t);
  change(candidate, B);
  change(candidate, "changes/genesis/26/10/06/03");
  const r = admit(baseline, candidate);
  assert.equal(r.code, 1);
  assert.match(r.err, /introduces 2 new Changes/);
});

test("a new Change that is not closed is refused at every stage, naming the stage and the next step", (t) => {
  const stages = { work: /WORK OPEN/, converged: /REVIEW CONVERGED/, "sealed work": /WORK SEALED/, "retro-work": /WORK SEALED/, "retro-owner": /RETROS PRESENT/ } as const;
  for (const [upTo, expected] of Object.entries(stages)) {
    const { baseline, candidate } = pair(t);
    change(candidate, B, upTo as keyof typeof stages);
    const r = admit(baseline, candidate);
    assert.equal(r.code, 1, upTo);
    assert.match(r.err, expected, upTo);
    assert.match(r.err, /not closed: /, upTo);
  }
});

test("a new Change with a retrospective before its Work is sealed is refused", (t) => {
  const { baseline, candidate } = pair(t);
  change(candidate, B, "work");
  file(candidate, `${B}/retro-work.md`, "# Retro\n");
  const r = admit(baseline, candidate);
  assert.equal(r.code, 1);
  assert.match(r.err, /before the Work is sealed/);
});

test("a Change closed in the baseline must stay closed, whatever else is admitted", (t) => {
  const mutations: Record<string, (d: string) => void> = {
    "edit inside": (d) => writeFileSync(join(d, A, "work", "audit.md"), "x"),
    "delete the Change": (d) => rmSync(join(d, A), { recursive: true }),
    "add inside": (d) => file(d, `${A}/extra.md`, "x"),
  };
  for (const [what, mutate] of Object.entries(mutations)) {
    const { baseline, candidate } = pair(t);
    change(candidate, B);
    mutate(candidate);
    const r = admit(baseline, candidate);
    assert.equal(r.code, 1, what);
    assert.match(r.err, /closed in the baseline/, what);
  }
});

test("Changes that were in the baseline and are not closed are not judged by the predicate", (t) => {
  const baseline = kaal(t);
  change(baseline, A);
  change(baseline, B, "work");
  const candidate = kaal(t);
  cpSync(baseline, candidate, { recursive: true });
  file(candidate, `${B}/work/audit.md`, "evolved in the candidate\n");
  change(candidate, "changes/genesis/26/10/06/03");
  const r = admit(baseline, candidate);
  assert.equal(r.code, 0, r.err);
  assert.equal(r.out, "admitted: changes/genesis/26/10/06/03");
});

test("usage is refused with exit 2", () => {
  assert.equal(run("admit").code, 2);
  assert.equal(run("admit", "only-one").code, 2);
});
