// hosting/C118 delivered cases: the content of a run and its provenance, stated as distinct facts (hosting/F113, hosting/A50;
// hosting/T349 to hosting/T353). They reach Hosting by its name, as a consumer does, and write only to the operating system's
// temporary directory. Git is used for the fixtures only, in a scratch repository isolated from the user's configuration.
// Hosting states content and provenance; what was examined, and whether evidence is about it, is for the consumer and for Testing.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
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
const refused = (call, code) => assert.throws(call, (e) => e instanceof hosting.RunFactsError && e.code === code, `expected ${code}`);
const NO_VERDICT = /judged|examined|equivalent|verdict|\btied\b|\bok\b|valid|trusted|match/i;
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
// The identity of a set of files, written out here independently of Hosting: one line per path in string order, the JSON array [path, sha256], a line feed.
const identityOf = (files) => ({ algorithm: "sha256", digest: sha(Object.keys(files).sort().map((p) => `${JSON.stringify([p, sha(files[p])])}\n`).join("")), files: Object.keys(files).length });
const A = { "a.txt": Buffer.from("base\n"), "src/b.txt": Buffer.from("head\n") };

it("hosting/T349: describeRun states the head the event names and the trigger as provenance, for each of the four events, and says nothing of content it was not given", () => {
  const pr = hosting.describeRun({ eventName: "pull_request", event: PR, trigger: MERGE });
  assert.deepEqual(JSON.parse(JSON.stringify(pr)), {
    event: "pull_request", content: null, headContent: null,
    provenance: {
      eventHead: { revision: HEAD, source: "pull_request.head.sha" }, trigger: MERGE, git: null,
      relations: { triggerIsEventHead: false, gitCommitIsEventHead: null, gitCommitIsTrigger: null, eventHeadIsGitParent: null },
    },
    relations: { contentIsHeadContent: null },
  });
  assert.ok(Object.isFrozen(pr) && Object.isFrozen(pr.provenance) && Object.isFrozen(pr.provenance.eventHead) && Object.isFrozen(pr.relations), "the facts are frozen");

  const facts = (eventName, event, trigger) => hosting.describeRun({ eventName, event, trigger }).provenance;
  const target = facts("pull_request_target", PR, BASE);
  assert.deepEqual([target.eventHead.revision, target.trigger, target.relations.triggerIsEventHead], [HEAD, BASE, false], "on pull_request_target the trigger is the base and the event names the head");
  const push = facts("push", { after: HEAD, before: BASE }, HEAD);
  assert.deepEqual([push.eventHead, push.relations.triggerIsEventHead], [{ revision: HEAD, source: "push.after" }, true]);
  const group = facts("merge_group", { merge_group: { head_sha: HEAD, base_sha: BASE } }, HEAD);
  assert.deepEqual([group.eventHead, group.relations.triggerIsEventHead], [{ revision: HEAD, source: "merge_group.head_sha" }, true]);

  assert.deepEqual([facts("pull_request", PR).trigger, facts("pull_request", PR).relations.triggerIsEventHead], [null, null], "a trigger the caller does not give is not invented, and nothing is said about it");
  assert.equal(facts("pull_request", { pull_request: { head: { sha: HEAD.replace(/1/g, "A") } } }).eventHead.revision, HEAD.replace(/1/g, "a"), "an id is written in lower case");
  assert.equal(facts("pull_request", { pull_request: { head: { sha: "f".repeat(64) } } }).eventHead.revision, "f".repeat(64), "a 64 character id is a revision");
  assert.equal(facts("push", { after: HEAD, pull_request: { head: { sha: OTHER } }, merge_group: { head_sha: OTHER } }, HEAD).eventHead.revision, HEAD, "a push is read at after and nowhere else");
  assert.equal(facts("pull_request", { ...PR, after: OTHER, merge_group: { head_sha: OTHER } }).eventHead.revision, HEAD, "a pull request is read at its head and nowhere else");

  const names = JSON.stringify([Object.keys(pr), Object.keys(pr.provenance), Object.keys(pr.provenance.eventHead), Object.keys(pr.provenance.relations), Object.keys(pr.relations)]);
  assert.doesNotMatch(names, NO_VERDICT, "no fact is named as what was judged or examined, and none is a verdict");
});

it("hosting/T350: describeRun refuses an event it cannot read, an id that is not a revision and a fact of the wrong form, and states a disagreement instead of refusing it", () => {
  for (const eventName of ["workflow_run", "schedule", "workflow_dispatch", "pull_request_review", "", undefined]) refused(() => hosting.describeRun({ eventName, event: PR, trigger: MERGE }), "UNSUPPORTED_EVENT");
  refused(() => hosting.describeRun({ eventName: "push", event: { after: "0".repeat(40) }, trigger: HEAD }), "NOT_A_REVISION"); // a deleted ref has no new commit
  for (const value of [undefined, null, 5, "", "abc1234", "z".repeat(40), HEAD + "0"]) refused(() => hosting.describeRun({ eventName: "pull_request", event: { pull_request: { head: { sha: value } } }, trigger: MERGE }), "NOT_A_REVISION");
  for (const trigger of ["abc", "z".repeat(40), 7]) refused(() => hosting.describeRun({ eventName: "pull_request", event: PR, trigger }), "NOT_A_REVISION");
  refused(() => hosting.describeRun({ eventName: "pull_request", event: {}, trigger: MERGE }), "NOT_A_REVISION");
  for (const bad of [null, "x", [], { eventName: "push", event: "x" }, { eventName: "push", event: null }, { eventName: "push", event: { after: HEAD }, head: OTHER }, { eventName: "push", event: { after: HEAD }, judged: OTHER }, { eventName: "push", event: { after: HEAD }, sha: OTHER }]) refused(() => hosting.describeRun(bad), "INVALID_SOURCE");
  const source = { eventName: "pull_request", event: PR, trigger: MERGE };
  for (const observed of [null, "x", { head: OTHER }, { git: { commit: HEAD } }, { git: { commit: HEAD, parents: [], extra: 1 } }, { content: { algorithm: "sha1", digest: "a".repeat(64), files: 1 } }, { content: { algorithm: "sha256", digest: "abc", files: 1 } }, { headContent: "x" }]) refused(() => hosting.describeRun(source, observed), "INVALID_SOURCE");
  refused(() => hosting.describeRun(source, { git: { commit: "abc", parents: [] } }), "NOT_A_REVISION");
  refused(() => hosting.describeRun(source, { git: { commit: HEAD, parents: ["abc"] } }), "NOT_A_REVISION");

  const apart = hosting.describeRun({ eventName: "push", event: { after: HEAD }, trigger: OTHER }).provenance;
  assert.deepEqual([apart.eventHead.revision, apart.trigger, apart.relations.triggerIsEventHead], [HEAD, OTHER, false], "a push whose trigger is not its new commit is a fact, and both are stated");
});

it("hosting/T351: describeRun relates content to content and Git to Git, and a commit relationship is never the identity of content", () => {
  const same = identityOf(A);
  const other = identityOf({ ...A, "c.txt": Buffer.from("more\n") });
  const run = (observed, source = { eventName: "pull_request", event: PR, trigger: MERGE }) => hosting.describeRun(source, observed);

  assert.deepEqual(JSON.parse(JSON.stringify(run({ content: same, headContent: same }).relations)), { contentIsHeadContent: true }, "the same content is the same content");
  assert.equal(run({ content: other, headContent: same }).relations.contentIsHeadContent, false, "other content is other content");
  assert.equal(run({ content: same }).relations.contentIsHeadContent, null, "without the content of the head nothing is said");
  assert.equal(run({ headContent: same }).relations.contentIsHeadContent, null, "without the content of the working copy nothing is said");
  assert.deepEqual([run({ content: same }).content, run({ content: same }).headContent], [same, null], "content is stated as it was given");

  const merge = run({ git: { commit: MERGE, parents: [BASE, HEAD] }, content: other, headContent: same });
  assert.deepEqual([merge.provenance.relations.gitCommitIsTrigger, merge.provenance.relations.eventHeadIsGitParent, merge.relations.contentIsHeadContent], [true, true, false],
    "a merge that has the head as a parent is a different content: the parent relationship does not make them one");
  const dirty = run({ git: { commit: HEAD, parents: [BASE] }, content: other, headContent: same });
  assert.deepEqual([dirty.provenance.relations.gitCommitIsEventHead, dirty.relations.contentIsHeadContent], [true, false], "the same commit with other content: the commit does not stand for the content");
  const clean = run({ git: { commit: HEAD, parents: [BASE] }, content: same, headContent: same });
  assert.deepEqual([clean.provenance.relations.gitCommitIsEventHead, clean.relations.contentIsHeadContent], [true, true]);
  const rel = (r) => [r.provenance.relations.gitCommitIsEventHead, r.provenance.relations.gitCommitIsTrigger, r.provenance.relations.eventHeadIsGitParent];
  assert.deepEqual(rel(run({ git: { commit: MERGE, parents: [BASE, OTHER] } })), [false, true, false], "a merge that does not hold the head says so, and is not refused");
  assert.deepEqual(rel(run({ git: { commit: OTHER, parents: [BASE] } })), [false, false, false]);
  assert.deepEqual(rel(run({ git: { commit: HEAD.toUpperCase(), parents: [] } })), [true, false, false], "letter case does not matter");
  assert.deepEqual(rel(run({ git: { commit: MERGE, parents: [BASE, HEAD] } }, { eventName: "pull_request", event: PR })), [false, null, true], "without a trigger nothing is said about it");
  assert.deepEqual(rel(run({ git: { commit: HEAD, parents: [BASE] } }, { eventName: "push", event: { after: HEAD }, trigger: HEAD })), [true, true, false]);
  assert.equal(run({ git: null }).provenance.git, null, "a working copy that is not a Git working copy has no provenance of that kind, and that is not an error");
  assert.doesNotMatch(JSON.stringify(Object.keys(clean.provenance.relations).concat(Object.keys(clean.relations))), NO_VERDICT, "the relations are facts, none is a verdict");
});

it("hosting/T352: contentIdentity is the identity of bytes and paths and nothing else, and describeRun reads no environment, no file and no Git", () => {
  const id = hosting.contentIdentity(A);
  assert.deepEqual({ ...id }, identityOf(A), "the identity is the one defined: a line per path in string order, [path, sha256], a line feed");
  assert.ok(Object.isFrozen(id));
  assert.deepEqual({ ...hosting.contentIdentity({ "src/b.txt": A["src/b.txt"], "a.txt": A["a.txt"] }) }, { ...id }, "the order the files are given in is not part of the identity");
  assert.deepEqual({ ...hosting.contentIdentity({ "a.txt": new Uint8Array(Buffer.from("base\n")), "src/b.txt": Buffer.from("head\n") }) }, { ...id }, "bytes are bytes, a Buffer or not");
  assert.notEqual(hosting.contentIdentity({ ...A, "src/b.txt": Buffer.from("Head\n") }).digest, id.digest, "a byte changes the identity");
  assert.notEqual(hosting.contentIdentity({ "a.txt": A["a.txt"], "src/c.txt": A["src/b.txt"] }).digest, id.digest, "a path changes the identity");
  assert.notEqual(hosting.contentIdentity({ "a.txt": Buffer.from("x"), "b.txt": Buffer.from("y") }).digest, hosting.contentIdentity({ "a.txt": Buffer.from("y"), "b.txt": Buffer.from("x") }).digest, "the bytes belong to their paths");
  assert.notEqual(hosting.contentIdentity({ "a\n[": Buffer.from("x") }).digest, hosting.contentIdentity({ a: Buffer.from("x") }).digest, "a path with a line feed cannot pass for another");
  assert.deepEqual({ ...hosting.contentIdentity({}) }, identityOf({}), "an empty set has an identity");
  for (const bad of [null, "x", [], { "a.txt": "text" }, { "a.txt": null }]) refused(() => hosting.contentIdentity(bad), "INVALID_SOURCE");

  const env = { GITHUB_SHA: process.env.GITHUB_SHA, GITHUB_EVENT_NAME: process.env.GITHUB_EVENT_NAME, GITHUB_EVENT_PATH: process.env.GITHUB_EVENT_PATH };
  Object.assign(process.env, { GITHUB_SHA: OTHER, GITHUB_EVENT_NAME: "push", GITHUB_EVENT_PATH: join(tmpdir(), "no-such-event.json") });
  try {
    const frozen = Object.freeze({ eventName: "pull_request", event: Object.freeze({ pull_request: Object.freeze({ head: Object.freeze({ sha: HEAD }) }) }), trigger: MERGE });
    const observed = Object.freeze({ content: id, git: Object.freeze({ commit: MERGE, parents: Object.freeze([BASE, HEAD]) }) });
    const answer = hosting.describeRun(frozen, observed);
    assert.deepEqual([answer.provenance.eventHead.revision, answer.provenance.trigger, answer.event], [HEAD, MERGE, "pull_request"], "the environment of the process does not enter the answer");
  } finally {
    for (const [key, value] of Object.entries(env)) value === undefined ? delete process.env[key] : (process.env[key] = value);
  }
  const text = readFileSync(join(SCRIPTS, "run-facts.js"), "utf8");
  assert.doesNotMatch(text, /process\.env|node:fs|node:child_process|cross-spawn/, "the function imports nothing that reads the host");
});

it("hosting/T353: readCheckout and the command kaal-hosting-run-facts state what a working copy holds and where it comes from, content first, and exit 2 only for what they cannot read", async () => {
  const home = mkdtempSync(join(tmpdir(), "hosting-run-facts-"));
  const clean = { PATH: process.env.PATH, HOME: home, GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: "/dev/null", GIT_TERMINAL_PROMPT: "0" };
  const repo = join(home, "repo");
  const git = (...args) => {
    const run = spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@example.invalid", "-c", "commit.gpgsign=false", ...args], { cwd: repo, encoding: "utf8", env: clean });
    assert.equal(run.status, 0, run.stderr);
    return run.stdout.trim();
  };
  const put = (name, text) => writeFileSync(join(repo, name), text);
  try {
    spawnSync("git", ["init", "-q", "-b", "main", repo], { encoding: "utf8", env: clean });
    put("a.txt", "base\n");
    git("add", "."); git("commit", "-q", "-m", "base");
    git("checkout", "-q", "-b", "topic");
    put("b.txt", "head\n");
    git("add", "."); git("commit", "-q", "-m", "head");
    const head = git("rev-parse", "HEAD");
    const headFiles = { "a.txt": Buffer.from("base\n"), "b.txt": Buffer.from("head\n") };
    git("checkout", "-q", "main");
    put("c.txt", "more\n");
    git("add", "."); git("commit", "-q", "-m", "more");
    git("merge", "-q", "--no-ff", "-m", "test merge", "topic");
    const merge = git("rev-parse", "HEAD");
    const parents = git("rev-list", "--parents", "-n", "1", "HEAD").split(" ").slice(1);
    const mergeFiles = { ...headFiles, "c.txt": Buffer.from("more\n") };
    assert.ok(parents.includes(head) && merge !== head);

    const read = await hosting.readCheckout(repo, { head });
    assert.deepEqual({ ...read.content }, identityOf(mergeFiles), "the content is the files the working copy holds, without .git");
    assert.deepEqual({ ...read.headContent }, identityOf(headFiles), "and the content of the commit the event names is read from the repository");
    assert.deepEqual(read.git, { commit: merge, parents }, "Git is provenance, beside the content");
    assert.equal((await hosting.readCheckout(repo, { head: OTHER })).headContent, null, "a commit that is not in the repository is not content, and is not an error");
    assert.equal((await hosting.readCheckout(repo)).headContent, null, "none asked, none read");

    const eventPath = join(home, "event.json");
    const call = (env, ...args) => spawnSync(process.execPath, [join(SCRIPTS, "run-facts-cli.mjs"), ...args], { encoding: "utf8", env: { PATH: process.env.PATH, HOME: home, ...env } });
    const line = (run) => JSON.parse(run.stdout.replace(/^kaal-hosting-run-facts /, ""));
    const env = { GITHUB_EVENT_NAME: "pull_request", GITHUB_EVENT_PATH: eventPath, GITHUB_SHA: merge };

    writeFileSync(eventPath, JSON.stringify({ pull_request: { head: { sha: head } } }));
    const ok = call(env, "--checkout", repo);
    assert.equal(ok.status, 0, ok.stderr);
    assert.match(ok.stdout, /^kaal-hosting-run-facts \{/);
    assert.deepEqual(line(ok), {
      result: "facts", event: "pull_request", content: identityOf(mergeFiles), headContent: identityOf(headFiles),
      provenance: {
        eventHead: { revision: head, source: "pull_request.head.sha" }, trigger: merge, git: { commit: merge, parents },
        relations: { triggerIsEventHead: false, gitCommitIsEventHead: false, gitCommitIsTrigger: true, eventHeadIsGitParent: true },
      },
      relations: { contentIsHeadContent: false },
    }, "the head's parent relationship is true and the content is not the head's: both are stated");

    git("checkout", "-q", head);
    const atHead = line(call({ ...env, GITHUB_SHA: head }, "--checkout", repo));
    assert.deepEqual([atHead.relations.contentIsHeadContent, atHead.provenance.relations.gitCommitIsEventHead], [true, true]);
    put("a.txt", "changed\n");
    const dirty = line(call({ ...env, GITHUB_SHA: head }, "--checkout", repo));
    assert.deepEqual([dirty.relations.contentIsHeadContent, dirty.provenance.relations.gitCommitIsEventHead], [false, true], "the same commit with other files is other content, and the command says so");

    const loose = call(env);
    assert.equal(loose.status, 0, loose.stderr);
    assert.deepEqual([line(loose).content, line(loose).provenance.git], [null, null], "without --checkout nothing is said about a working copy");

    const plain = join(home, "plain");
    spawnSync(process.execPath, ["-e", `require("fs").mkdirSync(${JSON.stringify(plain)}); require("fs").writeFileSync(${JSON.stringify(join(plain, "x.txt"))}, "x")`]);
    const noGit = call(env, "--checkout", plain);
    assert.equal(noGit.status, 0, noGit.stderr);
    assert.deepEqual([line(noGit).content, line(noGit).provenance.git, line(noGit).headContent], [identityOf({ "x.txt": Buffer.from("x") }), null, null], "a directory that is not a Git working copy still has content");

    const broken = join(home, "broken");
    spawnSync(process.execPath, ["-e", `require("fs").mkdirSync(${JSON.stringify(join(broken, ".git"))}, { recursive: true }); require("fs").writeFileSync(${JSON.stringify(join(broken, "x.txt"))}, "x")`]);
    await assert.rejects(hosting.readCheckout(broken), (e) => e.code === "REVISION_UNREADABLE", "a directory that holds a .git Git cannot read is an error, not a directory without Git");
    const unreadable = call(env, "--checkout", broken);
    assert.equal(unreadable.status, 2, "the command says it cannot read the repository, and does not print facts without Git");
    assert.deepEqual(line(unreadable), { result: "cannot-determine", code: "REVISION_UNREADABLE", reason: line(unreadable).reason });
    assert.equal((await hosting.readCheckout(plain)).git, null, "while a directory without .git is a directory without Git");

    const unknown = call({ ...env, GITHUB_EVENT_NAME: "schedule" });
    assert.equal(unknown.status, 2);
    assert.deepEqual(line(unknown), { result: "cannot-determine", code: "UNSUPPORTED_EVENT", reason: line(unknown).reason });
    const none = call({ GITHUB_EVENT_NAME: "pull_request", GITHUB_SHA: merge });
    assert.equal(none.status, 2, "no event file is a refusal, not a guess");
    assert.equal(line(none).code, "EVENT_UNREADABLE");
    assert.equal([ok, loose, noGit, unreadable, unknown, none].some((r) => r.status === 1), false, "the command never exits 1: nothing here can fail a check");
  } finally { rmSync(home, { recursive: true, force: true }); }
});
