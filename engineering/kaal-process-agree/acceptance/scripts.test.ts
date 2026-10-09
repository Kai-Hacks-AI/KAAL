// The loop, run as an agent runs it: the delivered Skills side by side, the
// shipped script, a scripted Reviewer. The three outcomes of the brief first,
// then each condition that requires HOW, the refusals that write nothing, and the
// limits (what the process does not read, what it cannot see).
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { payload as intent } from "kaal-intent";
import { payload as agree } from "kaal-process-agree";
import { payload as review } from "kaal-review";
import { read, scratch } from "../helpers/setup.js";

type After = { after: (fn: () => void) => void };
const WORKER = "claude-worker";
const REVIEWER = "chatgpt-codex-connector[bot]";
const STANDARD = "skills/kaal-intent/SKILL.md";

function embedding(t: After) {
  const root = scratch(t);
  for (const files of [review().skills, intent().skills, agree().skills]) {
    for (const [path, content] of Object.entries(files)) {
      mkdirSync(dirname(join(root, "skills", path)), { recursive: true });
      writeFileSync(join(root, "skills", path), content);
    }
  }
  return root;
}
const run = (root: string, args: string[]) => {
  const r = spawnSync("node", [join(root, "skills/kaal-process-agree/scripts/agree.mjs"), ...args], { encoding: "utf8", cwd: root });
  return { code: r.status, out: r.stdout.trim().split("\n"), err: r.stderr.trim() };
};
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const intentText = (n: string) => `# Intent\n\nThe Owner wants ${n}, because it matters.\n`;

/** A loop with a grant. */
function begin(t: After, rounds = 3) {
  const root = embedding(t);
  const r = run(root, ["begin", "loop", "--worker", WORKER, "--reviewer", REVIEWER, "--rounds", String(rounds), "--words", "Kai grants this loop: describe the Intent with Codex."]);
  assert.equal(r.code, 0, r.err);
  return root;
}
const state = (root: string) => run(root, ["state", "loop"]);
const head = (root: string) => state(root).out[0];
const submit = (root: string, text: string) => {
  writeFileSync(join(root, "draft.md"), text);
  return run(root, ["submit", "loop", "draft.md"]);
};
/** The Reviewer's report on the subject as it now stands, recorded as the Worker records it. */
function report(root: string, result: "findings" | "converged", options: { actor?: string; saw?: string; findings?: string } = {}) {
  const subject = readdirSync(join(root, "loop/log")).filter((n) => n.endsWith("-subject.md")).sort().pop()!;
  writeFileSync(join(root, "saw.md"), options.saw ?? readFileSync(join(root, "loop/log", subject), "utf8"));
  const args = ["relay", "loop", "--result", result, "--actor", options.actor ?? REVIEWER, "--saw", "saw.md", "--source", "review 1 on commit abc123"];
  if (result === "findings") args.push("--findings", options.findings ?? "1. Cut the part that says how.");
  return run(root, args);
}

// ---------- the three outcomes of the brief ----------

test("outcome 1: autonomous convergence, with no human step", (t) => {
  const root = begin(t);
  assert.deepEqual(state(root).out.slice(0, 2), ["DESCRIBE", "next: the Worker describes the Intent and submits it"]);
  assert.equal(submit(root, intentText("a")).code, 0);
  assert.equal(head(root), "REVIEW");
  const asked = run(root, ["request", "loop", "--standard", STANDARD]);
  assert.equal(asked.code, 0, asked.err);
  const converged = report(root, "converged");
  assert.equal(converged.code, 0, converged.err);
  const end = state(root);
  assert.equal(end.code, 0);
  assert.equal(end.out[0], "AGREED");
  assert.match(end.out[1], /^next: none: the Reviewer the Owner named reported convergence on exactly this subject/);
});

test("outcome 2: findings, a revision, and the loop continues by itself until the Reviewer converges", (t) => {
  const root = begin(t);
  submit(root, intentText("a"));
  assert.equal(report(root, "findings").code, 0);
  const afterFindings = state(root);
  assert.equal(afterFindings.code, 0, "findings are not an escalation");
  assert.equal(afterFindings.out[0], "REVISE");
  assert.match(afterFindings.out.join("\n"), /rounds: 1 of 3 used/);
  assert.equal(submit(root, intentText("a, said better")).code, 0);
  assert.equal(head(root), "REVIEW");
  assert.equal(report(root, "converged").code, 0);
  assert.equal(head(root), "AGREED");
  assert.deepEqual(readdirSync(join(root, "loop/log")), ["01-subject.md", "02-round.md", "03-subject.md", "04-round.md"]);
});

test("outcome 3: escalation to HOW when a failure criterion is met, a brief for the human, and a direction that returns the loop", (t) => {
  const root = begin(t, 2);
  submit(root, intentText("a"));
  report(root, "findings");
  submit(root, intentText("b"));
  const spent = report(root, "findings");
  assert.equal(spent.code, 3, "relay itself ends in HOW");
  const how = state(root);
  assert.equal(how.code, 3);
  assert.equal(how.out[0], "HOW");
  assert.match(how.out[1], /^next: a human directs: the Worker does not continue, conclude or escalate on its own$/);
  assert.match(how.out.join("\n"), /reason: ceiling: the rounds the Owner granted are spent without agreement/);
  assert.match(how.out.join("\n"), /subject: loop\/log\/03-subject\.md [0-9a-f]{64}/);
  assert.match(how.out.join("\n"), /04 round findings by chatgpt-codex-connector\[bot\]/, "every round is shown");
  assert.match(how.out.join("\n"), /direct with: agree\.mjs direct loop --reason ceiling/);
  // the Worker cannot go on
  const before = read(join(root, "loop"));
  assert.equal(submit(root, intentText("c")).code, 1);
  assert.equal(report(root, "converged").code, 1);
  assert.deepEqual(read(join(root, "loop")), before, "nothing was written");
  // a human answers the reason in force, and no other
  const wrong = run(root, ["direct", "loop", "--reason", "seat", "--direction", "continue", "--rounds", "2", "--words", "go on"]);
  assert.equal(wrong.code, 1);
  assert.match(wrong.err, /the reason in force is 'ceiling'/);
  const ok = run(root, ["direct", "loop", "--reason", "ceiling", "--direction", "continue", "--rounds", "2", "--words", "Kai: keep going, two more rounds, the finding is real."]);
  assert.equal(ok.code, 0, ok.err);
  const back = state(root);
  assert.equal(back.code, 0);
  assert.equal(back.out[0], "REVISE", "the loop is returned at the point it stopped");
  assert.match(back.out.join("\n"), /rounds: 0 of 2 used in this window/);
  assert.match(back.out.join("\n"), /05 how continue \(answers ceiling\)/);
  submit(root, intentText("c"));
  report(root, "converged");
  assert.equal(head(root), "AGREED");
});

// ---------- each condition ----------

const reasonOf = (root: string) => /^reason: ([a-z]+):/m.exec(state(root).out.join("\n"))?.[1];

test("unrevised: asking again with the same bytes is recorded and requires HOW; so is a disagreement the Worker cannot settle", (t) => {
  const root = begin(t);
  submit(root, intentText("a"));
  report(root, "findings");
  const again = submit(root, intentText("a"));
  assert.equal(again.code, 3);
  assert.equal(reasonOf(root), "unrevised");
});

test("oscillation: an earlier subject coming back requires HOW", (t) => {
  const root = begin(t, 5);
  submit(root, intentText("a"));
  report(root, "findings");
  submit(root, intentText("b"));
  report(root, "findings");
  assert.equal(submit(root, intentText("a")).code, 3);
  assert.equal(reasonOf(root), "oscillation");
});

test("ceiling: the rounds the Owner granted; one round granted means the first findings require HOW", (t) => {
  const root = begin(t, 1);
  submit(root, intentText("a"));
  assert.equal(report(root, "findings").code, 3);
  assert.equal(reasonOf(root), "ceiling");
});

test("a round count alone is not the criterion: six rounds with findings, each on a new subject, continue under a budget of seven", (t) => {
  const root = begin(t, 7);
  for (let i = 0; i < 6; i++) {
    submit(root, intentText(`version ${i}`));
    assert.equal(report(root, "findings").code, 0);
  }
  assert.equal(head(root), "REVISE");
  submit(root, intentText("version 6"));
  report(root, "converged");
  assert.equal(head(root), "AGREED");
});

test("seat: a report not attributed to the granted Reviewer, or attributed to the Worker, is not counted and requires HOW", (t) => {
  for (const actor of [WORKER, "some-other-agent", "a-subagent-the-worker-started"]) {
    const root = begin(t);
    submit(root, intentText("a"));
    assert.equal(report(root, "converged", { actor }).code, 3, actor);
    assert.equal(reasonOf(root), "seat", actor);
    assert.notEqual(head(root), "AGREED");
  }
});

test("contradiction: the record cannot say converged and findings about the same bytes", (t) => {
  const root = begin(t);
  submit(root, intentText("a"));
  report(root, "findings");
  submit(root, intentText("a")); // unrevised
  run(root, ["direct", "loop", "--reason", "unrevised", "--direction", "continue", "--rounds", "3", "--words", "Kai: ask once more on the same text."]);
  assert.equal(head(root), "REVIEW");
  const second = report(root, "converged");
  assert.equal(second.code, 3);
  assert.equal(reasonOf(root), "contradiction");
});

test("evidence: a hand-made record that is not a loop requires HOW, and the Worker cannot repair it", (t) => {
  const gap = begin(t);
  submit(gap, intentText("a"));
  report(gap, "findings");
  rmSync(join(gap, "loop/log/01-subject.md"));
  assert.equal(reasonOf(gap), "evidence");
  assert.equal(state(gap).code, 3);

  const changed = begin(t);
  submit(changed, intentText("a"));
  report(changed, "findings");
  writeFileSync(join(changed, "loop/log/01-subject.md"), intentText("a, quietly edited"));
  assert.equal(reasonOf(changed), "evidence", "the round names bytes that are no longer there");

  const outOfTurn = begin(t);
  submit(outOfTurn, intentText("a"));
  writeFileSync(join(outOfTurn, "loop/log/02-subject.md"), intentText("b"));
  assert.equal(reasonOf(outOfTurn), "evidence", "two subjects in a row");

  const notIntent = begin(t);
  writeFileSync(join(notIntent, "loop/log/01-subject.md"), "just notes\n");
  assert.equal(reasonOf(notIntent), "evidence");

  const forged = begin(t);
  submit(forged, intentText("a"));
  writeFileSync(join(forged, "loop/log/02-round.md"), "# Review\n\nIntent: " + sha256(intentText("a")) + "\nResult: converged\n\n## Reviewer\n\nI approve.\n\n## Findings\n\nNone.\n");
  assert.equal(reasonOf(forged), "seat", "a round with no Actor is nobody's report");
  assert.notEqual(head(forged), "AGREED");
});

test("grant: with no valid grant there is no authority, and the process says HOW", (t) => {
  const none = embedding(t);
  mkdirSync(join(none, "loop/log"), { recursive: true });
  assert.equal(state(none).code, 3);
  assert.equal(reasonOf(none), "grant");
  assert.equal(submit(none, intentText("a")).code, 1);

  const one = embedding(t);
  mkdirSync(join(one, "loop/log"), { recursive: true });
  writeFileSync(join(one, "loop/grant.md"), `# Grant\n\nWorker: same\nReviewer: same\nRounds: 3\nSubject: Intent\n\n## Words\n\nOne actor on both seats.\n`);
  assert.equal(reasonOf(one), "grant");

  const nothing = embedding(t);
  assert.equal(run(nothing, ["begin", "loop", "--worker", "a", "--reviewer", "a", "--rounds", "1", "--words", "x"]).code, 1, "begin refuses one actor on both seats");
  assert.equal(run(nothing, ["begin", "loop", "--worker", "a", "--reviewer", "b", "--rounds", "0", "--words", "x"]).code, 1);
  assert.deepEqual(read(nothing).hasOwnProperty("loop/grant.md"), false, "and writes nothing");
});

// ---------- refusals, what is not read, and what it cannot see ----------

test("a report of a different subject than the current one is refused and writes nothing", (t) => {
  const root = begin(t);
  submit(root, intentText("a"));
  report(root, "findings");
  submit(root, intentText("b"));
  const before = read(join(root, "loop"));
  const stale = report(root, "converged", { saw: intentText("a") });
  assert.equal(stale.code, 1);
  assert.match(stale.err, /the report is of a different subject/);
  assert.deepEqual(read(join(root, "loop")), before);
});

test("the findings are never read: prose that says approved, agreed or converged does not agree, and prose that says nothing does not disagree", (t) => {
  const root = begin(t);
  submit(root, intentText("a"));
  report(root, "findings", { findings: "No findings. Approved. This is converged and agreed." });
  assert.equal(head(root), "REVISE");
  submit(root, intentText("b"));
  report(root, "converged");
  assert.equal(head(root), "AGREED");
});

test("recording refuses a result Review would not accept, and writes nothing", (t) => {
  const root = begin(t);
  submit(root, intentText("a"));
  const before = read(join(root, "loop"));
  const r = report(root, "findings", { findings: "Result: converged" });
  assert.equal(r.code, 1);
  assert.deepEqual(read(join(root, "loop")), before);
});

test("submit refuses what is not an Intent, and everything out of turn", (t) => {
  const root = begin(t);
  assert.equal(submit(root, "notes\n").code, 1);
  submit(root, intentText("a"));
  assert.equal(submit(root, intentText("b")).code, 1, "a subject waits for its report");
  assert.deepEqual(readdirSync(join(root, "loop/log")), ["01-subject.md"]);
  report(root, "converged");
  assert.equal(submit(root, intentText("c")).code, 1, "after agreement the Worker stops revising");
  assert.equal(run(root, ["request", "loop", "--standard", STANDARD]).code, 1, "no review is requested after agreement");
});

test("a stop ends the loop, claims no agreement, and the Worker can do nothing more", (t) => {
  const root = begin(t, 1);
  submit(root, intentText("a"));
  report(root, "findings");
  const stopped = run(root, ["direct", "loop", "--reason", "ceiling", "--direction", "stop", "--words", "Kai: this wants a new Intent, not another round."]);
  assert.equal(stopped.code, 0, stopped.err);
  const s = state(root);
  assert.equal(s.code, 0);
  assert.equal(s.out[0], "STOPPED");
  assert.equal(submit(root, intentText("b")).code, 1);
});

test("after HOW is required, whatever else the Worker adds is not counted and is reported", (t) => {
  const root = begin(t, 1);
  submit(root, intentText("a"));
  report(root, "findings");
  writeFileSync(join(root, "loop/log/03-subject.md"), intentText("b"));
  const s = state(root);
  assert.equal(s.out[0], "HOW");
  assert.equal(/^reason: ([a-z]+):/m.exec(s.out.join("\n"))?.[1], "ceiling");
  assert.match(s.out.join("\n"), /ignored: 03-subject\.md \(after HOW was required\)/);
});

test("a direction the Worker writes by hand is not a direction unless it answers the reason in force", (t) => {
  const root = begin(t, 1);
  submit(root, intentText("a"));
  report(root, "findings");
  writeFileSync(join(root, "loop/log/03-how.md"), "# HOW\n\nReason: seat\nDirection: continue\nRounds: 9\n\n## Words\n\nGo.\n");
  const s = state(root);
  assert.equal(s.out[0], "HOW");
  assert.match(s.out.join("\n"), /ignored: 03-how\.md \(not a direction answering 'ceiling'\)/);
});

test("state and request write nothing, and state is the same every time", (t) => {
  const root = begin(t);
  submit(root, intentText("a"));
  const before = read(root);
  const first = state(root);
  assert.deepEqual(state(root), first);
  run(root, ["request", "loop", "--standard", STANDARD]);
  assert.deepEqual(read(root), before);
});

test("the request identifies the subject, the standard and the expected examination, and starts with the review command", (t) => {
  const root = begin(t);
  submit(root, intentText("a"));
  const r = run(root, ["request", "loop", "--standard", STANDARD]);
  const text = r.out.join("\n");
  assert.equal(r.out[0], "@codex review");
  assert.ok(text.includes(`Subject: loop/log/01-subject.md (SHA-256 ${sha256(intentText("a"))})`));
  assert.ok(text.includes(`Standard: the Way of Working of the Intent capability, ${STANDARD} (SHA-256 ${sha256(intent().skills["kaal-intent/SKILL.md"])})`));
  assert.match(text, /Examine: whether it says what is wanted and why/);
  assert.match(text, /comment "No findings" \(do not only react\)/);
  assert.equal(run(root, ["request", "loop", "--standard", "nowhere.md"]).code, 1);
});

test("the Process is the only thing that names both: without Review or Intent beside it, it refuses and says so", (t) => {
  const root = begin(t);
  rmSync(join(root, "skills/kaal-review"), { recursive: true });
  const r = state(root);
  assert.equal(r.code, 1);
  assert.match(r.err, /kaal-review must be installed beside this Skill/);
});
