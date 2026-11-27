// hosting/C118 executable drafts (T349 to T353): the revisions of a run, stated as distinct facts. RED on `main`: `runRevisions` and the
// command `kaal-hosting-run-revisions` do not exist. They need no App and no network. The DO turns them into delivered Cases unchanged
// (`04-test/package-check/run-revisions.test.mjs`). Git is used for the command's fixture only, in a scratch repository isolated from the
// user's configuration. Hosting states facts; whether the evidence matches what was examined is for the consumer and for Testing.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { PACKAGE } from "./harness.mjs";

const SCRIPTS = join(PACKAGE, "dist/skills/kaal-hosting/scripts");
const HEAD = "1".repeat(40); // the head the event of a pull request names
const MERGE = "2".repeat(40); // GITHUB_SHA of a pull_request run: the test merge commit
const BASE = "3".repeat(40);
const OTHER = "4".repeat(40);
const PR = { pull_request: { head: { sha: HEAD }, base: { sha: BASE } } };
const refused = (call, code) => assert.throws(call, (e) => e instanceof hosting.RunRevisionsError && e.code === code, `expected ${code}`);
const NO_VERDICT = /judged|examined|equivalent|verdict|\btied\b|\bok\b|valid|trusted|match/i;

it("hosting/T349: runRevisions states the head the event names, the trigger and the checkout as distinct facts, for each of the four events", () => {
  const pr = hosting.runRevisions({ eventName: "pull_request", event: PR, trigger: MERGE });
  assert.deepEqual(JSON.parse(JSON.stringify(pr)), {
    event: "pull_request", eventHead: { revision: HEAD, source: "pull_request.head.sha" }, trigger: MERGE, checkout: null,
    relations: { triggerIsEventHead: false, checkoutIsEventHead: null, checkoutIsTrigger: null, eventHeadIsCheckoutParent: null },
  });
  assert.ok(Object.isFrozen(pr) && Object.isFrozen(pr.eventHead) && Object.isFrozen(pr.relations), "the facts are frozen");

  const target = hosting.runRevisions({ eventName: "pull_request_target", event: PR, trigger: BASE });
  assert.deepEqual([target.eventHead.revision, target.trigger, target.relations.triggerIsEventHead], [HEAD, BASE, false], "on pull_request_target the trigger is the base and the event names the head");

  const push = hosting.runRevisions({ eventName: "push", event: { after: HEAD, before: BASE }, trigger: HEAD });
  assert.deepEqual([push.eventHead, push.trigger, push.relations.triggerIsEventHead], [{ revision: HEAD, source: "push.after" }, HEAD, true]);

  const group = hosting.runRevisions({ eventName: "merge_group", event: { merge_group: { head_sha: HEAD, base_sha: BASE } }, trigger: HEAD });
  assert.deepEqual([group.eventHead, group.trigger, group.relations.triggerIsEventHead], [{ revision: HEAD, source: "merge_group.head_sha" }, HEAD, true]);

  const none = hosting.runRevisions({ eventName: "pull_request", event: PR });
  assert.deepEqual([none.trigger, none.relations.triggerIsEventHead], [null, null], "a trigger the caller does not give is not invented, and nothing is said about it");
  assert.equal(hosting.runRevisions({ eventName: "pull_request", event: { pull_request: { head: { sha: HEAD.replace(/1/g, "A") } } } }).eventHead.revision, HEAD.replace(/1/g, "a"), "an id is written in lower case");
  assert.equal(hosting.runRevisions({ eventName: "pull_request", event: { pull_request: { head: { sha: "f".repeat(64) } } } }).eventHead.revision, "f".repeat(64), "a 64 character id is a revision");

  assert.equal(hosting.runRevisions({ eventName: "push", event: { after: HEAD, pull_request: { head: { sha: OTHER } }, merge_group: { head_sha: OTHER } }, trigger: HEAD }).eventHead.revision, HEAD, "a push is read at after and nowhere else");
  assert.equal(hosting.runRevisions({ eventName: "pull_request", event: { ...PR, after: OTHER, merge_group: { head_sha: OTHER } } }).eventHead.revision, HEAD, "a pull request is read at its head and nowhere else");

  const names = JSON.stringify(Object.keys(pr).concat(Object.keys(pr.eventHead), Object.keys(pr.relations)));
  assert.doesNotMatch(names, NO_VERDICT, "no fact is named as what was judged or examined, and none is a verdict");
});

it("hosting/T350: runRevisions refuses an event it cannot read and an id that is not a revision, and states a disagreement as a fact instead of refusing it", () => {
  for (const eventName of ["workflow_run", "schedule", "workflow_dispatch", "pull_request_review", "", undefined]) refused(() => hosting.runRevisions({ eventName, event: PR, trigger: MERGE }), "UNSUPPORTED_EVENT");
  refused(() => hosting.runRevisions({ eventName: "push", event: { after: "0".repeat(40) }, trigger: HEAD }), "NOT_A_REVISION"); // a deleted ref has no new commit
  for (const sha of [undefined, null, 5, "", "abc1234", "z".repeat(40), HEAD + "0"]) refused(() => hosting.runRevisions({ eventName: "pull_request", event: { pull_request: { head: { sha } } }, trigger: MERGE }), "NOT_A_REVISION");
  for (const trigger of ["abc", "z".repeat(40), 7]) refused(() => hosting.runRevisions({ eventName: "pull_request", event: PR, trigger }), "NOT_A_REVISION");
  refused(() => hosting.runRevisions({ eventName: "pull_request", event: {}, trigger: MERGE }), "NOT_A_REVISION");
  for (const bad of [null, "x", [], { eventName: "push", event: "x" }, { eventName: "push", event: null }, { eventName: "push", event: { after: HEAD }, head: OTHER }, { eventName: "push", event: { after: HEAD }, judged: OTHER }, { eventName: "push", event: { after: HEAD }, sha: OTHER }]) refused(() => hosting.runRevisions(bad), "INVALID_SOURCE");
  refused(() => hosting.runRevisions({ eventName: "pull_request", event: PR }, { commit: HEAD, parents: [], head: OTHER }), "INVALID_SOURCE");

  const apart = hosting.runRevisions({ eventName: "push", event: { after: HEAD }, trigger: OTHER });
  assert.deepEqual([apart.eventHead.revision, apart.trigger, apart.relations.triggerIsEventHead], [HEAD, OTHER, false], "a push whose trigger is not its new commit is a fact, and both are stated");
});

it("hosting/T351: runRevisions states how the checkout relates to the event head and the trigger, and never calls any relation enough", () => {
  const at = (checkout, source = { eventName: "pull_request", event: PR, trigger: MERGE }) => hosting.runRevisions(source, checkout);
  const rel = (r) => [r.relations.checkoutIsEventHead, r.relations.checkoutIsTrigger, r.relations.eventHeadIsCheckoutParent];

  const head = at({ commit: HEAD, parents: [BASE] });
  assert.deepEqual(head.checkout, { commit: HEAD, parents: [BASE] }, "the checkout is stated as it is");
  assert.deepEqual(rel(head), [true, false, false], "the checkout is the head the event names");
  assert.deepEqual(rel(at({ commit: MERGE, parents: [BASE, HEAD] })), [false, true, true], "the checkout is the trigger, a commit that has the head as a parent");
  assert.deepEqual(rel(at({ commit: MERGE, parents: [BASE, OTHER] })), [false, true, false], "a merge that does not hold the head says so, and is not refused");
  assert.deepEqual(rel(at({ commit: OTHER, parents: [BASE] })), [false, false, false], "any other commit says so, and is not refused");
  assert.deepEqual(rel(at({ commit: HEAD.toUpperCase(), parents: [] })), [true, false, false], "letter case does not matter");
  assert.equal(at({ commit: MERGE, parents: [BASE, HEAD] }).eventHead.revision, HEAD, "the head the event names does not change with the checkout");
  assert.deepEqual(rel(at({ commit: MERGE, parents: [BASE, HEAD] }, { eventName: "pull_request", event: PR })), [false, null, true], "without a trigger nothing is said about it");

  const push = at({ commit: HEAD, parents: [BASE] }, { eventName: "push", event: { after: HEAD }, trigger: HEAD });
  assert.deepEqual(rel(push), [true, true, false]);
  assert.deepEqual(rel(at({ commit: MERGE, parents: [BASE, HEAD] }, { eventName: "push", event: { after: HEAD }, trigger: HEAD })), [false, false, true], "the relations are stated for a push as for a pull request");

  refused(() => at({ commit: "abc", parents: [] }), "NOT_A_REVISION");
  refused(() => at({ commit: HEAD, parents: ["abc"] }), "NOT_A_REVISION");
  refused(() => at({ commit: HEAD }), "INVALID_SOURCE");
  assert.doesNotMatch(JSON.stringify(Object.keys(head.relations)), NO_VERDICT, "the relations are facts, none is a verdict");
});

it("hosting/T352: runRevisions reads no environment, no file and no Git, and does not change its input", () => {
  const env = { GITHUB_SHA: process.env.GITHUB_SHA, GITHUB_EVENT_NAME: process.env.GITHUB_EVENT_NAME, GITHUB_EVENT_PATH: process.env.GITHUB_EVENT_PATH };
  Object.assign(process.env, { GITHUB_SHA: OTHER, GITHUB_EVENT_NAME: "push", GITHUB_EVENT_PATH: join(tmpdir(), "no-such-event.json") });
  try {
    const source = Object.freeze({ eventName: "pull_request", event: Object.freeze({ pull_request: Object.freeze({ head: Object.freeze({ sha: HEAD }) }) }), trigger: MERGE });
    const checkout = Object.freeze({ commit: MERGE, parents: Object.freeze([BASE, HEAD]) });
    const answer = hosting.runRevisions(source, checkout);
    assert.deepEqual([answer.eventHead.revision, answer.trigger, answer.event], [HEAD, MERGE, "pull_request"], "the environment of the process does not enter the answer");
  } finally {
    for (const [key, value] of Object.entries(env)) value === undefined ? delete process.env[key] : (process.env[key] = value);
  }
  const text = readFileSync(join(SCRIPTS, "run-revisions.js"), "utf8");
  assert.doesNotMatch(text, /process\.env|node:fs|node:child_process|cross-spawn/, "the function imports nothing that reads the host");
});

it("hosting/T353: the command kaal-hosting-run-revisions reads the event, the trigger and the checkout of a run, prints them as facts, and exits 2 only for what it cannot read", () => {
  const home = mkdtempSync(join(tmpdir(), "hosting-run-revisions-"));
  const clean = { PATH: process.env.PATH, HOME: home, GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: "/dev/null", GIT_TERMINAL_PROMPT: "0" };
  const git = (...args) => {
    const run = spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@example.invalid", "-c", "commit.gpgsign=false", ...args], { cwd: join(home, "repo"), encoding: "utf8", env: clean });
    assert.equal(run.status, 0, run.stderr);
    return run.stdout.trim();
  };
  try {
    spawnSync("git", ["init", "-q", "-b", "main", join(home, "repo")], { encoding: "utf8", env: clean });
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
    const parents = git("rev-list", "--parents", "-n", "1", "HEAD").split(" ").slice(1);
    assert.ok(parents.includes(head) && merge !== head);

    const eventPath = join(home, "event.json");
    const call = (env, ...args) => spawnSync(process.execPath, [join(SCRIPTS, "run-revisions-cli.mjs"), ...args], { encoding: "utf8", env: { PATH: process.env.PATH, HOME: home, ...env } });
    const line = (run) => JSON.parse(run.stdout.replace(/^kaal-hosting-run-revisions /, ""));

    writeFileSync(eventPath, JSON.stringify({ pull_request: { head: { sha: head } } }));
    const ok = call({ GITHUB_EVENT_NAME: "pull_request", GITHUB_EVENT_PATH: eventPath, GITHUB_SHA: merge }, "--checkout", join(home, "repo"));
    assert.equal(ok.status, 0, ok.stderr);
    assert.match(ok.stdout, /^kaal-hosting-run-revisions \{/);
    assert.deepEqual(line(ok), {
      result: "facts", event: "pull_request", eventHead: { revision: head, source: "pull_request.head.sha" }, trigger: merge, checkout: { commit: merge, parents },
      relations: { triggerIsEventHead: false, checkoutIsEventHead: false, checkoutIsTrigger: true, eventHeadIsCheckoutParent: true },
    }, "the head the event names, the trigger and the checkout, side by side");

    const loose = call({ GITHUB_EVENT_NAME: "pull_request", GITHUB_EVENT_PATH: eventPath, GITHUB_SHA: merge });
    assert.equal(loose.status, 0, loose.stderr);
    assert.equal(line(loose).checkout, null, "without --checkout nothing is said about the working copy");

    writeFileSync(eventPath, JSON.stringify({ pull_request: { head: { sha: OTHER } } }));
    const apart = call({ GITHUB_EVENT_NAME: "pull_request", GITHUB_EVENT_PATH: eventPath, GITHUB_SHA: merge }, "--checkout", join(home, "repo"));
    assert.equal(apart.status, 0, "a checkout that does not hold the head of the event is a fact, not a failure");
    assert.deepEqual(line(apart).relations, { triggerIsEventHead: false, checkoutIsEventHead: false, checkoutIsTrigger: true, eventHeadIsCheckoutParent: false });

    const unknown = call({ GITHUB_EVENT_NAME: "schedule", GITHUB_EVENT_PATH: eventPath, GITHUB_SHA: merge });
    assert.equal(unknown.status, 2);
    assert.deepEqual(line(unknown), { result: "cannot-determine", code: "UNSUPPORTED_EVENT", reason: line(unknown).reason });
    const none = call({ GITHUB_EVENT_NAME: "pull_request", GITHUB_SHA: merge });
    assert.equal(none.status, 2, "no event file is a refusal, not a guess");
    assert.equal(line(none).code, "EVENT_UNREADABLE");
    assert.equal([ok, loose, apart, unknown, none].some((run) => run.status === 1), false, "the command never exits 1: nothing here can fail a check");
  } finally { rmSync(home, { recursive: true, force: true }); }
});
