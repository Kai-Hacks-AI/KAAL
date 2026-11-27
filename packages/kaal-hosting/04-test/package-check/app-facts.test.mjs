// hosting/C114 delivered Cases (T336 to T339): facts that carry Hosting's attribution, the pull request facts the Approver judges, and the paging of the check runs.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { DISPATCHER, SHA, granted } from "./app-fixtures.mjs";

const HEAD = "1".repeat(40);
const BASE = "2".repeat(40);
const PARENT = "3".repeat(40);
const APPROVER = { ...DISPATCHER, app: "approver", name: "KAAL Approver", owner: "kaal-review", appId: "67890", abilities: ["read-contents", "read-pull-requests", "read-checks", "approve-pull-requests"] };
const APPROVER_WORLD = {
  declarations: [{ path: "packages/kaal-review/13-source/github-apps/approver.json", declaration: APPROVER }],
  appId: "67890", slug: "kaal-approver", installPermissions: { metadata: "read", contents: "read", pull_requests: "write", checks: "read" },
};
const ABILITIES = ["read-contents", "read-pull-requests", "read-checks"];
const request = { repo: "o/r", number: 7, check: "Change Isolation" };

// Three runs of one check at the head, deliberately not in order: an older success must not hide a newer failure or a pending run.
const RUNS = [
  { id: 11, name: "Change Isolation", head_sha: HEAD, status: "completed", conclusion: "success", started_at: "2026-11-27T05:00:00Z", app: { slug: "kaal-inspector", id: 24680 } },
  { id: 13, name: "Change Isolation", head_sha: HEAD, status: "in_progress", conclusion: null, started_at: "2026-11-27T05:20:00Z", app: { slug: "kaal-inspector", id: 24680 } },
  { id: 12, name: "Change Isolation", head_sha: HEAD, status: "completed", conclusion: "failure", started_at: "2026-11-27T05:10:00Z", app: { slug: "kaal-inspector", id: 24680 } },
];

const route = (r) => {
  if (r.path === "/repos/o/r/pulls/7") return { status: 200, json: { number: 7, user: { login: "claude-bot", type: "Bot" }, head: { ref: "claude/w", sha: HEAD }, base: { ref: "kaal/hosting/gen", sha: BASE, repo: { default_branch: "main" } }, body: "ignored" } };
  if (r.path === `/repos/o/r/commits/${HEAD}`) return { status: 200, json: { sha: HEAD, parents: [{ sha: BASE }, { sha: PARENT }], commit: { message: "ignored" } } };
  if (r.path === `/repos/o/r/commits/${HEAD}/check-runs`) {
    assert.equal(r.query.filter, "all", "reruns are asked for, not dropped");
    assert.equal(r.query.check_name, "Change Isolation");
    return { status: 200, json: { total_count: 3, check_runs: RUNS } };
  }
  return { status: 404, json: { message: "Not Found" } };
};
const read = async (extra = {}) => {
  const { grant, api } = await granted(ABILITIES, route, APPROVER_WORLD, { app: "approver", appId: "67890" });
  const mark = api.mark();
  const opts = { grant, fetch: api.fetch, api: api.api };
  return { grant, api, mark, opts, facts: await hosting.readPullRequestFacts({ ...request, ...extra }, opts) };
};

it("hosting/T336: a fact is Hosting's only if Hosting made it; a copy, a clone, a JSON round trip and a hand-built twin carry no attribution", async () => {
  const { facts, opts } = await read();
  const origin = hosting.factOrigin(facts);
  assert.equal(origin.app, "approver", "the App whose grant read the fact");
  assert.equal(origin.repo, "o/r");
  for (const [why, imitation] of [
    ["a spread copy", { ...facts }],
    ["a structured clone", structuredClone(facts)],
    ["a JSON round trip", JSON.parse(JSON.stringify(facts))],
    ["Object.assign onto an empty object", Object.assign({}, facts)],
    ["an object with the same prototype", Object.create(Object.getPrototypeOf(facts), Object.getOwnPropertyDescriptors(facts))],
    ["a hand-built fact claiming an origin", { ...facts, origin: { app: "approver", repo: "o/r" }, source: "hosting" }],
    ["nothing", undefined],
    ["a string", "approver"],
  ]) assert.equal(hosting.factOrigin(imitation), null, why);
  assert.equal(Object.isFrozen(facts) && Object.isFrozen(facts.head) && Object.isFrozen(facts.checks), true, "the fact cannot be edited");
  assert.equal(Object.keys(facts).includes("origin"), false, "attribution is never a field of the data");
  // The five reads of the first DO attribute their facts the same way.
  const { grant, api } = await granted(["read-contents", "read-pull-requests"], (r) => (r.path === "/repos/o/r/pulls" ? { status: 200, json: [] } : { status: 200, json: [{ state: "APPROVED", commit_id: HEAD, user: { login: "x", type: "Bot" } }] }));
  const reviews = await hosting.listReviews("o/r", 7, { grant, fetch: api.fetch, api: api.api });
  assert.equal(hosting.factOrigin(reviews).app, "dispatcher");
  assert.equal(hosting.factOrigin(JSON.parse(JSON.stringify(reviews))), null);
  void opts;
});

it("hosting/T337: readPullRequestFacts sends only the documented GET requests and returns head, base, main, author and every run of the named check at the head, none selected", async () => {
  const { facts, api, mark } = await read();
  assert.deepEqual(facts, {
    number: 7,
    head: { ref: "claude/w", sha: HEAD, parents: [BASE, PARENT] },
    base: { ref: "kaal/hosting/gen", sha: BASE },
    main: SHA,
    author: { login: "claude-bot", type: "Bot" },
    checks: [
      { id: 13, name: "Change Isolation", revision: HEAD, status: "in_progress", conclusion: null, signer: "kaal-inspector" },
      { id: 12, name: "Change Isolation", revision: HEAD, status: "completed", conclusion: "failure", signer: "kaal-inspector" },
      { id: 11, name: "Change Isolation", revision: HEAD, status: "completed", conclusion: "success", signer: "kaal-inspector" },
    ],
  });
  const calls = api.requests.slice(mark);
  assert.ok(calls.length > 0 && calls.every((r) => r.method === "GET" && r.headers.authorization === "Bearer ghs_GRANT"), "GET only, the grant's token in the header only");
  assert.deepEqual(calls.map((r) => r.path), ["/repos/o/r/pulls/7", `/repos/o/r/commits/${HEAD}`, "/repos/o/r/commits/main", `/repos/o/r/commits/${HEAD}/check-runs`]);
  const text = JSON.stringify(facts);
  assert.equal(/ignored|approv|merge-ok|verdict|judg/i.test(text), false, "no body, no message and no judgement: Review decides");
  // Nothing is selected for the judge: the pending run and the newer failure are listed with the older success, newest first.
  assert.equal(facts.checks.some((c) => c.conclusion === "success"), true);
  assert.equal(facts.checks[0].status, "in_progress");
  // The default branch is what GitHub's answer names; an answer that names none fails closed and never assumes main.
  for (const [why, repo] of [["no repository in the base", undefined], ["no default branch", {}], ["an empty default branch", { default_branch: "" }]]) {
    const w = await granted(ABILITIES, (r) => (r.path === "/repos/o/r/pulls/7" ? { status: 200, json: { ...route(r).json, base: { ref: "kaal/hosting/gen", sha: BASE, repo } } } : route(r)), APPROVER_WORLD, { app: "approver", appId: "67890" });
    await assert.rejects(hosting.readPullRequestFacts(request, { grant: w.grant, fetch: w.api.fetch, api: w.api.api }), (e) => e.code === "READ_FAILED", why);
    assert.equal(w.api.requests.slice(w.api.mark()).some((r) => r.path.startsWith("/repos/o/r/commits/main")), false, `${why}: main was not read in its place`);
  }
  // A check that does not exist at the head is a fact too: an empty list, not a failure and not a guess.
  const { grant: g0, api: a0 } = await granted(ABILITIES, (r) => (r.path.endsWith("/check-runs") ? { status: 200, json: { check_runs: [] } } : route(r)), APPROVER_WORLD, { app: "approver", appId: "67890" });
  assert.deepEqual((await hosting.readPullRequestFacts({ ...request, check: "Change Isolation" }, { grant: g0, fetch: a0.fetch, api: a0.api })).checks, []);
  // A check run of another revision is never taken for the head's.
  const stale = await granted(ABILITIES, (r) => (r.path.endsWith("/check-runs") ? { status: 200, json: { check_runs: [{ id: 1, name: "Change Isolation", head_sha: "9".repeat(40), status: "completed", conclusion: "success", app: { slug: "kaal-inspector" } }, ...RUNS] } } : route(r)), APPROVER_WORLD, { app: "approver", appId: "67890" });
  assert.equal((await hosting.readPullRequestFacts(request, { grant: stale.grant, fetch: stale.api.fetch, api: stale.api.api })).checks.length, 3, "a run of another revision is never listed");
});

it("hosting/T338: readPullRequestFacts needs read-contents, read-pull-requests and read-checks, takes only its grant, and refuses before any call otherwise", async () => {
  for (const missing of ABILITIES) {
    const { grant, api } = await granted(ABILITIES.filter((a) => a !== missing), route, APPROVER_WORLD, { app: "approver", appId: "67890" });
    const mark = api.mark();
    await assert.rejects(hosting.readPullRequestFacts(request, { grant, fetch: api.fetch, api: api.api }), (e) => e.code === "ABILITY_REFUSED", missing);
    assert.equal(api.requests.length, mark, "refused before any call");
  }
  const { grant, api } = await granted(ABILITIES, route, APPROVER_WORLD, { app: "approver", appId: "67890" });
  const mark = api.mark();
  const opts = { grant, fetch: api.fetch, api: api.api };
  for (const [why, bad, o, code] of [
    ["no grant", request, { fetch: api.fetch, api: api.api }, "GRANT_UNTRUSTED"],
    ["a forged grant", request, { ...opts, grant: { token: "ghs_X", abilities: ABILITIES } }, "GRANT_UNTRUSTED"],
    ["a token option", request, { ...opts, token: "ghs_X" }, "INVALID_READ"],
    ["a facts option handed in", request, { ...opts, facts: {} }, "INVALID_READ"],
    ["an origin handed in", { ...request, origin: { app: "approver" } }, opts, "INVALID_READ"],
    ["no check name", { repo: "o/r", number: 7 }, opts, "INVALID_READ"],
    ["a number that is not a pull request number", { ...request, number: "7; drop" }, opts, "INVALID_READ"],
    ["another repository", { ...request, repo: "o/other" }, opts, "GRANT_REPO_MISMATCH"],
  ]) {
    await assert.rejects(hosting.readPullRequestFacts(bad, o), (e) => e.code === code, why);
  }
  assert.equal(api.requests.length, mark, "every refusal came before any call");

});

it("hosting/T339: the check runs of a head are paged to a short page, listed complete, once each, newest first, never a truncated list", async () => {
  // Run i started i seconds after run 1, so the newest run is the highest id; the stand-in lists runs by id, so the newest sits on the last page.
  const run = (i) => ({ id: i, name: "Change Isolation", head_sha: HEAD, status: "completed", conclusion: "success", started_at: new Date(Date.UTC(2026, 10, 27, 5, 0, 0) + i * 1000).toISOString(), app: { slug: "kaal-inspector", id: 24680 } });
  const read = async (count) => {
    const all = Array.from({ length: count }, (_, i) => run(i + 1));
    const asks = [];
    const { grant, api } = await granted(ABILITIES, (r) => {
      if (!r.path.endsWith("/check-runs")) return route(r);
      const page = Number(r.query.page ?? 1);
      asks.push(page);
      return { status: 200, json: { total_count: count, check_runs: all.slice((page - 1) * 100, page * 100) } };
    }, APPROVER_WORLD, { app: "approver", appId: "67890" });
    const facts = await hosting.readPullRequestFacts(request, { grant, fetch: api.fetch, api: api.api });
    return { ids: facts.checks.map((c) => c.id), asks, checks: facts.checks };
  };
  const newestFirst = (count) => Array.from({ length: count }, (_, i) => count - i);
  const two = await read(101);
  assert.deepEqual(two.ids, newestFirst(101), "all 101, each once, newest first across the page break");
  assert.deepEqual(two.asks, [1, 2], "page 1 and page 2, no page 3");
  assert.deepEqual(two.checks[0], { id: 101, name: "Change Isolation", revision: HEAD, status: "completed", conclusion: "success", signer: "kaal-inspector" });
  const exact = await read(100);
  assert.deepEqual(exact.ids, newestFirst(100));
  assert.deepEqual(exact.asks, [1, 2], "a full page is followed by one more, which is empty");
  const none = await read(0);
  assert.deepEqual(none.ids, []);
  assert.deepEqual(none.asks, [1]);
  // More pages than the bound is a named failure and never a truncated list.
  const endless = await granted(ABILITIES, (r) => (r.path.endsWith("/check-runs") ? { status: 200, json: { check_runs: Array.from({ length: 100 }, (_, i) => run(i + 1)) } } : route(r)), APPROVER_WORLD, { app: "approver", appId: "67890" });
  await assert.rejects(hosting.readPullRequestFacts(request, { grant: endless.grant, fetch: endless.api.fetch, api: endless.api.api }), (e) => e.code === "READ_FAILED");
});

it("hosting/T340: no consumer can register a fact: registration is not exported, its module cannot be imported, and its origin is the grant Hosting holds, never a field", async () => {
  assert.deepEqual(Object.keys(hosting).filter((k) => /attribut|regist|origin/i.test(k)), ["factOrigin"], "the one export about origin only reads");
  for (const deep of ["facts.js", "grant.js", "app-reads.js"]) {
    await assert.rejects(import(`@kaihacksai/kaal-hosting/dist/skills/kaal-hosting/scripts/github/${deep}`), (e) => e.code === "ERR_PACKAGE_PATH_NOT_EXPORTED", deep);
  }
  // A grant's own fields name its App and repository but carry no authority: a copy that claims another App is not a grant, so it reads and attributes nothing.
  const { grant, api } = await granted(["read-contents", "read-pull-requests"], () => ({ status: 200, json: [] }));
  const mark = api.mark();
  const claim = { ...grant, app: "approver" };
  await assert.rejects(hosting.listReviews("o/r", 7, { grant: claim, fetch: api.fetch, api: api.api }), (e) => e.code === "GRANT_UNTRUSTED");
  assert.equal(api.requests.length, mark, "refused before any call");
  assert.equal(hosting.factOrigin(await hosting.listReviews("o/r", 7, { grant, fetch: api.fetch, api: api.api })).app, "dispatcher", "the origin is the grant's, as Hosting holds it");
});
