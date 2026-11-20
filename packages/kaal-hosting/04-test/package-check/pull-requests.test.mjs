// hosting/C111 delivered cases: reading the open pull requests of a repository (hosting/F85, hosting/F86, hosting/F87, hosting/F88,
// hosting/F89, hosting/N13; hosting/T290 to hosting/T293, hosting/T295 and hosting/T296). They reach Hosting by its name, as a
// consumer does, and need no `gh`, no network and no Git: the one seam for the binary (`options.gh`) is a fake that answers like
// each environment.
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { it } from "node:test";
import { pathToFileURL } from "node:url";
import * as hosting from "@kaihacksai/kaal-hosting";
import { PACKAGE } from "./harness.mjs";

const SCRIPTS = join(PACKAGE, "dist/skills/kaal-hosting/scripts");
const REPOSITORY = "owner/sample";
const SHA = "7".repeat(40);
const pull = { number: 7, title: "PLAN: A sample change", draft: false, state: "open", mergeable_state: "clean", auto_merge: null, head: { ref: "claude/sample-plan", sha: SHA }, base: { ref: "main" } };
const graphqlAnswer = {
  data: { repository: { pullRequests: { pageInfo: { hasNextPage: false, endCursor: null }, nodes: [{
    number: 7, title: pull.title, isDraft: false, headRefName: pull.head.ref, headRefOid: SHA, baseRefName: "main", mergeStateStatus: "CLEAN", autoMergeRequest: null,
    reviewThreads: { pageInfo: { hasNextPage: false }, nodes: [{ isResolved: false }, { isResolved: true }] },
    latestReviews: { pageInfo: { hasNextPage: false }, nodes: [] },
    commits: { nodes: [{ commit: { oid: SHA, statusCheckRollup: null } }] },
  }] } } },
};
const threadRoute = [{ resolved: false, outdated: false, path: "a.md", line: 3, comment_ids: [1] }, { resolved: true, outdated: true, path: "b.md", line: null, comment_ids: [2] }];
const ok = (value) => ({ status: 0, stdout: JSON.stringify(value), stderr: "" });
const fail = (text) => ({ status: 1, stdout: "", stderr: text });

/**
 * mode: "graphql" (everything answers), "cloud" (GraphQL refused with HTTP 403, REST and the thread route answer), "no-threads" (as cloud,
 * the thread route answers 404), "thread-outage" (as cloud, the thread route answers HTTP 503), "graphql-outage" (GraphQL answers HTTP 502),
 * "down" (every call fails with HTTP 502).
 */
function fakeGh(mode) {
  const calls = [];
  const gh = async (args) => {
    calls.push(args);
    const route = args[0] === "api" ? args[1] ?? "" : "";
    if (mode === "down") return fail("gh: HTTP 502 Bad Gateway");
    if (route === "graphql") {
      if (mode === "graphql") return ok(graphqlAnswer);
      if (mode === "graphql-outage") return fail("gh: HTTP 502 Bad Gateway");
      return fail("gh: GitHub GraphQL is not available from Claude Code sessions; use the REST API. (HTTP 403)");
    }
    const path = route.replace(/^repos\/[^/]+\/[^/]+\//, "").split("?")[0];
    if (path === "pulls") return ok([pull]);
    if (path === "pulls/7") return ok(pull);
    if (path === "pulls/7/reviews") return ok([]);
    if (path === `commits/${SHA}/check-runs`) return ok({ total_count: 0, check_runs: [] });
    if (path === `commits/${SHA}/status`) return ok({ state: "pending", statuses: [] });
    if (path === "pulls/7/ccr/review_threads") {
      if (mode === "cloud") return ok(threadRoute);
      if (mode === "thread-outage") return fail("gh: HTTP 503 Service Unavailable");
      return fail("gh: Not Found (HTTP 404)");
    }
    return fail("gh: Not Found (HTTP 404)");
  };
  return { gh, calls };
}
const read = (mode) => {
  const { gh, calls } = fakeGh(mode);
  return { calls, result: hosting.readPullRequests(REPOSITORY, { gh, pauseMs: 0 }) };
};

it("hosting/T290: with GraphQL answering, readPullRequests returns one record per open pull request with every fact read, the unresolved threads counted", async () => {
  const [pr, ...rest] = await read("graphql").result;
  assert.equal(rest.length, 0);
  assert.equal(pr.number, 7);
  assert.equal(pr.title, "PLAN: A sample change");
  assert.equal(pr.draft, false);
  assert.deepEqual(pr.head, { ref: "claude/sample-plan", sha: SHA });
  assert.equal(pr.base.ref, "main");
  assert.equal(pr.mergeState, "clean");
  assert.equal(pr.autoMerge, false);
  assert.deepEqual(pr.reviews, []);
  assert.deepEqual(pr.threads, { unresolved: 1 });
  assert.deepEqual(pr.checks, []);
});

it("hosting/T291: with GraphQL refused, readPullRequests returns the same record shape from REST and the cloud review-thread route, and asks GraphQL once", async () => {
  const { calls, result } = read("cloud");
  const [pr] = await result;
  assert.equal(pr.number, 7);
  assert.equal(pr.draft, false);
  assert.deepEqual(pr.head, { ref: "claude/sample-plan", sha: SHA });
  assert.equal(pr.base.ref, "main");
  assert.equal(pr.mergeState, "clean");
  assert.deepEqual(pr.reviews, []);
  assert.deepEqual(pr.threads, { unresolved: 1 });
  assert.deepEqual(Object.keys(pr), Object.keys((await read("graphql").result)[0]), "the two transports answer different shapes");
  assert.equal(calls.filter((args) => args[1] === "graphql").length, 1, "GraphQL was asked more than once");
});

it("hosting/T292: with GraphQL refused and no thread route, the threads are unknown with a reason, every other fact is still read, and nothing is zero", async () => {
  const [pr] = await read("no-threads").result;
  assert.equal(pr.threads.unknown, true);
  assert.equal(typeof pr.threads.reason, "string");
  assert.ok(pr.threads.reason.length > 0);
  assert.ok(!("unresolved" in pr.threads), "a count was invented");
  assert.equal(pr.number, 7);
  assert.deepEqual(pr.reviews, []);
});

it("hosting/T293: when no transport answers, readPullRequests rejects with PULLS_UNREADABLE and returns nothing", async () => {
  await assert.rejects(read("down").result, (error) => error instanceof hosting.HostingError && error.code === "PULLS_UNREADABLE");
});

it("hosting/T295: a refusal moves on to the next transport, but a failure in transit is retried and then rejected, never read as a missing fact or a refusal", async () => {
  const outage = read("graphql-outage");
  await assert.rejects(outage.result, (error) => error.code === "PULLS_UNREADABLE" && /transient/.test(error.message));
  assert.equal(outage.calls.length, 4, "a failure in transit is repeated three times, then thrown");
  assert.ok(outage.calls.every((args) => args[1] === "graphql"), "a transport that failed in transit fell back to REST");
  const threads = read("thread-outage");
  await assert.rejects(threads.result, (error) => error.code === "PULLS_UNREADABLE" && /transient/.test(error.message));
  await assert.rejects(hosting.readPullRequests("not a repository", { gh: fakeGh("graphql").gh }), (error) => error.code === "PULLS_UNREADABLE");
});

it("hosting/T296: kaal-hosting-pulls prints one line of facts that agrees with readPullRequests, exits 0 when read and 2 when not, and never 1", async () => {
  const { pullRequestsCommand } = await import(pathToFileURL(join(SCRIPTS, "github/pull-requests-command.js")).href);
  const read1 = await pullRequestsCommand(["--repository", REPOSITORY], { gh: fakeGh("cloud").gh, pauseMs: 0 });
  assert.equal(read1.status, 0);
  assert.ok(!read1.line.includes("\n"));
  assert.ok(read1.line.startsWith("kaal-hosting-pulls "));
  const facts = JSON.parse(read1.line.slice("kaal-hosting-pulls ".length));
  assert.equal(facts.result, "read");
  assert.deepEqual(facts.pulls, await read("cloud").result);
  assert.ok(!/ccr|graphql|rest/i.test(read1.line.replace(/"repository":"[^"]*"/, "")), "the line names a route");
  const down = await pullRequestsCommand(["--repository", REPOSITORY], { gh: fakeGh("down").gh, pauseMs: 0 });
  assert.equal(down.status, 2);
  assert.equal(JSON.parse(down.line.slice("kaal-hosting-pulls ".length)).code, "PULLS_UNREADABLE");
  const usage = await pullRequestsCommand([]);
  assert.equal(usage.status, 2);
  assert.equal(JSON.parse(usage.line.slice("kaal-hosting-pulls ".length)).code, "USAGE");
  const home = mkdtempSync(join(tmpdir(), "hosting-pulls-"));
  try {
    const run = hosting.executeSync(process.execPath, [join(SCRIPTS, "github/pull-requests-cli.mjs")], { cwd: home });
    assert.equal(run.status, 2, "the built command was not exit 2 without arguments");
    assert.match(run.stdout, /^kaal-hosting-pulls \{"result":"cannot-determine","code":"USAGE"/);
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});
