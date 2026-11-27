// hosting/C118 executable drafts (T349 to T353): the judged revision, resolved from a GitHub event and tied to the checkout.
// RED on `main`: `judgedRevision` and the command `kaal-hosting-judged-revision` do not exist. They need no App and no network.
// The DO turns them into delivered Cases unchanged (`04-test/package-check/judged-revision.test.mjs`). Git is used for the command's
// fixture only, in a scratch repository isolated from the user's configuration.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { PACKAGE } from "./harness.mjs";

const SCRIPTS = join(PACKAGE, "dist/skills/kaal-hosting/scripts");
const HEAD = "1".repeat(40); // the head of the pull request: what was judged
const MERGE = "2".repeat(40); // GITHUB_SHA of a pull_request run: the test merge commit
const BASE = "3".repeat(40);
const OTHER = "4".repeat(40);
const PR = { pull_request: { head: { sha: HEAD }, base: { sha: BASE } } };
const refused = (call, code) => assert.throws(call, (e) => e instanceof hosting.JudgedRevisionError && e.code === code, `expected ${code}`);

it("hosting/T349: judgedRevision names the head of a pull request, the new commit of a push and the head of a merge group, and the trigger beside it", () => {
  const pr = hosting.judgedRevision({ eventName: "pull_request", event: PR, trigger: MERGE });
  assert.deepEqual({ ...pr }, { judged: HEAD, trigger: MERGE, event: "pull_request", source: "pull_request.head.sha", checkout: null });
  assert.ok(Object.isFrozen(pr), "the answer is frozen");
  assert.equal(pr.judged === MERGE, false, "release/D20: the test merge commit is never the judged revision");

  const target = hosting.judgedRevision({ eventName: "pull_request_target", event: PR, trigger: BASE });
  assert.deepEqual({ judged: target.judged, trigger: target.trigger, source: target.source }, { judged: HEAD, trigger: BASE, source: "pull_request.head.sha" }, "on pull_request_target the trigger is the base and the judged one is still the head");

  const push = hosting.judgedRevision({ eventName: "push", event: { after: HEAD, before: BASE }, trigger: HEAD });
  assert.deepEqual({ ...push }, { judged: HEAD, trigger: HEAD, event: "push", source: "push.after", checkout: null });

  const group = hosting.judgedRevision({ eventName: "merge_group", event: { merge_group: { head_sha: HEAD, base_sha: BASE } }, trigger: HEAD });
  assert.deepEqual({ ...group }, { judged: HEAD, trigger: HEAD, event: "merge_group", source: "merge_group.head_sha", checkout: null });

  assert.equal(hosting.judgedRevision({ eventName: "pull_request", event: PR }).trigger, null, "a trigger the caller does not give is not invented");
  assert.equal(hosting.judgedRevision({ eventName: "pull_request", event: { pull_request: { head: { sha: HEAD.replace(/1/g, "A") } } } }).judged, HEAD.replace(/1/g, "a"), "an id is written in lower case");
  assert.equal(hosting.judgedRevision({ eventName: "pull_request", event: { pull_request: { head: { sha: "f".repeat(64) } } } }).judged, "f".repeat(64), "a 64 character id is a revision");

  const elsewhere = hosting.judgedRevision({ eventName: "push", event: { after: HEAD, pull_request: { head: { sha: OTHER } }, merge_group: { head_sha: OTHER } }, trigger: HEAD });
  assert.equal(elsewhere.judged, HEAD, "a push is read at after and nowhere else");
  assert.equal(hosting.judgedRevision({ eventName: "pull_request", event: { ...PR, after: OTHER, merge_group: { head_sha: OTHER } } }).judged, HEAD, "a pull request is read at its head and nowhere else");
});

it("hosting/T350: judgedRevision refuses an event it does not know, an id that is not a revision, and a run that disagrees with its event", () => {
  for (const eventName of ["workflow_run", "schedule", "workflow_dispatch", "pull_request_review", "", undefined]) refused(() => hosting.judgedRevision({ eventName, event: PR, trigger: MERGE }), "UNSUPPORTED_EVENT");
  refused(() => hosting.judgedRevision({ eventName: "push", event: { after: "0".repeat(40) }, trigger: HEAD }), "NOT_A_REVISION"); // a deleted ref has no new commit
  for (const sha of [undefined, null, 5, "", "abc1234", "z".repeat(40), HEAD + "0"]) refused(() => hosting.judgedRevision({ eventName: "pull_request", event: { pull_request: { head: { sha } } }, trigger: MERGE }), "NOT_A_REVISION");
  for (const trigger of ["abc", "z".repeat(40), 7]) refused(() => hosting.judgedRevision({ eventName: "pull_request", event: PR, trigger }), "NOT_A_REVISION");
  refused(() => hosting.judgedRevision({ eventName: "pull_request", event: {}, trigger: MERGE }), "NOT_A_REVISION");
  refused(() => hosting.judgedRevision({ eventName: "push", event: { after: HEAD }, trigger: OTHER }), "UNTIED"); // GITHUB_SHA of a push is its after
  refused(() => hosting.judgedRevision({ eventName: "merge_group", event: { merge_group: { head_sha: HEAD } }, trigger: OTHER }), "UNTIED");
  for (const bad of [null, "x", [], { eventName: "push", event: "x" }, { eventName: "push", event: null }, { eventName: "push", event: { after: HEAD }, head: OTHER }, { eventName: "push", event: { after: HEAD }, judged: OTHER }, { eventName: "push", event: { after: HEAD }, sha: OTHER }]) refused(() => hosting.judgedRevision(bad), "INVALID_SOURCE");
  refused(() => hosting.judgedRevision({ eventName: "pull_request", event: PR, trigger: MERGE }, { commit: HEAD, parents: [], head: OTHER }), "INVALID_SOURCE");
});

it("hosting/T351: judgedRevision ties the judged revision to the checkout: the head itself, or a merge of the head, and nothing else", () => {
  const at = (checkout, source = { eventName: "pull_request", event: PR, trigger: MERGE }) => hosting.judgedRevision(source, checkout);
  assert.equal(at({ commit: HEAD, parents: [BASE] }).checkout, "judged", "the checkout is the head");
  assert.equal(at({ commit: MERGE, parents: [BASE, HEAD] }).checkout, "merge-of-judged", "the checkout is the test merge commit of the head");
  assert.equal(at({ commit: MERGE, parents: [BASE, HEAD] }).judged, HEAD, "and what was judged is still the head");
  assert.equal(at({ commit: HEAD.toUpperCase(), parents: [] }).checkout, "judged", "letter case does not matter");
  refused(() => at({ commit: MERGE, parents: [BASE, OTHER] }), "UNTIED"); // a merge that does not hold the head
  refused(() => at({ commit: OTHER, parents: [BASE] }), "UNTIED");
  refused(() => at({ commit: BASE, parents: [] }), "UNTIED");
  refused(() => at({ commit: "abc", parents: [] }), "NOT_A_REVISION");
  refused(() => at({ commit: HEAD, parents: ["abc"] }), "NOT_A_REVISION");
  refused(() => at({ commit: HEAD }), "INVALID_SOURCE", "parents are part of the checkout");
  const push = { eventName: "push", event: { after: HEAD }, trigger: HEAD };
  assert.equal(at({ commit: HEAD, parents: [BASE] }, push).checkout, "judged");
  refused(() => at({ commit: MERGE, parents: [BASE, HEAD] }, push), "UNTIED"); // only a pull request has a test merge commit
  const group = { eventName: "merge_group", event: { merge_group: { head_sha: HEAD } }, trigger: HEAD };
  assert.equal(at({ commit: HEAD, parents: [BASE] }, group).checkout, "judged");
});

it("hosting/T352: judgedRevision reads no environment, no file and no Git, and does not change its input", () => {
  const env = { GITHUB_SHA: process.env.GITHUB_SHA, GITHUB_EVENT_NAME: process.env.GITHUB_EVENT_NAME, GITHUB_EVENT_PATH: process.env.GITHUB_EVENT_PATH };
  Object.assign(process.env, { GITHUB_SHA: OTHER, GITHUB_EVENT_NAME: "push", GITHUB_EVENT_PATH: join(tmpdir(), "no-such-event.json") });
  try {
    const source = Object.freeze({ eventName: "pull_request", event: Object.freeze({ pull_request: Object.freeze({ head: Object.freeze({ sha: HEAD }) }) }), trigger: MERGE });
    const checkout = Object.freeze({ commit: MERGE, parents: Object.freeze([BASE, HEAD]) });
    const answer = hosting.judgedRevision(source, checkout);
    assert.deepEqual({ judged: answer.judged, trigger: answer.trigger, event: answer.event }, { judged: HEAD, trigger: MERGE, event: "pull_request" }, "the environment of the process does not enter the answer");
  } finally {
    for (const [key, value] of Object.entries(env)) value === undefined ? delete process.env[key] : (process.env[key] = value);
  }
  const text = readFileSync(join(SCRIPTS, "judged-revision.js"), "utf8");
  assert.doesNotMatch(text, /process\.env|node:fs|node:child_process|cross-spawn/, "the function imports nothing that reads the host");
});

it("hosting/T353: the command kaal-hosting-judged-revision reads the event of the run and the checkout, prints what was judged, and exits 2 for what it cannot tie", () => {
  const home = mkdtempSync(join(tmpdir(), "hosting-judged-"));
  const git = (...args) => {
    const run = spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@example.invalid", "-c", "commit.gpgsign=false", ...args], { cwd: join(home, "repo"), encoding: "utf8", env: { PATH: process.env.PATH, HOME: home, GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: "/dev/null", GIT_TERMINAL_PROMPT: "0" } });
    assert.equal(run.status, 0, run.stderr);
    return run.stdout.trim();
  };
  try {
    spawnSync("git", ["init", "-q", "-b", "main", join(home, "repo")], { encoding: "utf8", env: { PATH: process.env.PATH, HOME: home, GIT_CONFIG_GLOBAL: "/dev/null" } });
    writeFileSync(join(home, "repo", "a.txt"), "base\n");
    git("add", "."); git("commit", "-q", "-m", "base");
    git("checkout", "-q", "-b", "topic");
    writeFileSync(join(home, "repo", "b.txt"), "head\n");
    git("add", "."); git("commit", "-q", "-m", "head");
    const head = git("rev-parse", "HEAD");
    git("checkout", "-q", "main");
    writeFileSync(join(home, "repo", "c.txt"), "more\n");
    git("add", "."); git("commit", "-q", "-m", "more");
    git("merge", "-q", "--no-ff", "-m", "test merge", "topic");
    const merge = git("rev-parse", "HEAD");
    assert.notEqual(merge, head);

    const eventPath = join(home, "event.json");
    const call = (env, ...args) => spawnSync(process.execPath, [join(SCRIPTS, "judged-revision-cli.mjs"), ...args], { encoding: "utf8", env: { PATH: process.env.PATH, HOME: home, ...env } });
    const line = (run) => JSON.parse(run.stdout.replace(/^kaal-hosting-judged-revision /, ""));

    writeFileSync(eventPath, JSON.stringify({ pull_request: { head: { sha: head } } }));
    const ok = call({ GITHUB_EVENT_NAME: "pull_request", GITHUB_EVENT_PATH: eventPath, GITHUB_SHA: merge }, "--checkout", join(home, "repo"));
    assert.equal(ok.status, 0, ok.stderr);
    assert.match(ok.stdout, /^kaal-hosting-judged-revision \{/);
    assert.deepEqual(line(ok), { result: "judged", judged: head, trigger: merge, event: "pull_request", source: "pull_request.head.sha", checkout: "merge-of-judged" }, "the head is judged, the merge commit is the trigger, and the checkout is a merge of the head");

    const loose = call({ GITHUB_EVENT_NAME: "pull_request", GITHUB_EVENT_PATH: eventPath, GITHUB_SHA: merge });
    assert.equal(loose.status, 0, loose.stderr);
    assert.equal(line(loose).checkout, null, "without --checkout nothing is tied, and the answer says so");

    writeFileSync(eventPath, JSON.stringify({ pull_request: { head: { sha: OTHER } } }));
    const untied = call({ GITHUB_EVENT_NAME: "pull_request", GITHUB_EVENT_PATH: eventPath, GITHUB_SHA: merge }, "--checkout", join(home, "repo"));
    assert.equal(untied.status, 2, "a checkout that does not hold the judged revision is refused");
    assert.deepEqual(line(untied), { result: "cannot-determine", code: "UNTIED", reason: line(untied).reason });
    assert.equal("judged" in line(untied), false, "a refusal names no revision");

    const unknown = call({ GITHUB_EVENT_NAME: "schedule", GITHUB_EVENT_PATH: eventPath, GITHUB_SHA: merge });
    assert.equal(unknown.status, 2);
    assert.equal(line(unknown).code, "UNSUPPORTED_EVENT");
    const none = call({ GITHUB_EVENT_NAME: "pull_request", GITHUB_SHA: merge });
    assert.equal(none.status, 2, "no event file is a refusal, not a guess");
    assert.equal(line(none).code, "EVENT_UNREADABLE");
    const exit1 = [ok, loose, untied, unknown, none].some((run) => run.status === 1);
    assert.equal(exit1, false, "the command never exits 1: nothing here can fail a check");
  } finally { rmSync(home, { recursive: true, force: true }); }
});
