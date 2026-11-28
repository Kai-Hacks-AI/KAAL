// Posting a check run under an App's grant: hosting/C117 (T345 to T348) and hosting/C169 (T354 and T355). They use the App fixtures of
// hosting/C114 (`app-fixtures.mjs`); the stand-in's answer may carry `headers`. Nothing reaches GitHub. The Cases are the drafts of the
// Changes' PLANs (`00-changes/C117-post-check-run`, `00-changes/C169-check-run-contract`), delivered unchanged.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { DISPATCHER, granted } from "./app-fixtures.mjs";

const HEAD = "1".repeat(40);
const INSPECTOR = { ...DISPATCHER, app: "inspector", name: "KAAL Inspector", owner: "kaal-review", appId: "5953432", abilities: ["read-contents", "read-pull-requests", "post-checks"] };
const WORLD = {
  declarations: [{ path: "packages/kaal-review/13-source/github-apps/inspector.json", declaration: INSPECTOR }],
  appId: "5953432", slug: "kaal-inspector", installPermissions: { metadata: "read", contents: "read", pull_requests: "read", checks: "write" },
};
const ID = { app: "inspector", appId: "5953432" };
const ABILITIES = ["read-contents", "post-checks"];
const check = { name: "Controls / CTL42", revision: HEAD, conclusion: "success", title: "CTL42 passed", summary: "The control held at the revision.", externalId: "run-77" };
const made = (body, extra = {}) => ({ id: 4242, name: body.name, head_sha: body.head_sha, status: "completed", conclusion: body.conclusion, external_id: body.external_id, app: { id: 5953432, slug: "kaal-inspector" }, ...extra });
const route = (extra) => (r) => (r.method === "POST" && r.path === "/repos/o/r/check-runs" ? { status: 201, json: made(r.body, typeof extra === "function" ? extra(r) : extra) } : { status: 404, json: { message: "Not Found" } });
const post = async (c, { abilities = ABILITIES, world = route(), repo = "o/r", extra = {} } = {}) => {
  const { grant, api } = await granted(abilities, world, WORLD, ID);
  const mark = api.mark();
  return { grant, api, mark, opts: { grant, fetch: api.fetch, api: api.api, ...extra }, run: () => hosting.postCheckRun(repo, c, { grant, fetch: api.fetch, api: api.api, ...extra }) };
};

it("hosting/T345: postCheckRun sends one POST of the fixed form with the grant's token and returns the run as a fact Hosting made", async () => {
  const p = await post(check);
  const run = await p.run();
  assert.deepEqual(run, { id: 4242, name: "Controls / CTL42", revision: HEAD, conclusion: "success", signer: "kaal-inspector", externalId: "run-77" });
  const calls = p.api.requests.slice(p.mark);
  assert.equal(calls.length, 1, "one request, no read before and none after, and no retry");
  assert.equal(calls[0].method, "POST");
  assert.equal(calls[0].path, "/repos/o/r/check-runs");
  assert.equal(calls[0].headers.authorization, "Bearer ghs_GRANT");
  assert.deepEqual(calls[0].body, { name: "Controls / CTL42", head_sha: HEAD, status: "completed", conclusion: "success", output: { title: "CTL42 passed", summary: "The control held at the revision." }, external_id: "run-77" });
  assert.equal(hosting.factOrigin(run).app, "inspector");
  assert.equal(hosting.factOrigin(run).repo, "o/r");
  assert.equal(hosting.factOrigin({ ...run }), null, "a copy is not Hosting's");
  assert.equal(Object.isFrozen(run), true);
  // Without an external id the field is not sent and not returned.
  const { externalId, ...bare } = check;
  const q = await post(bare);
  const run2 = await q.run();
  assert.equal("externalId" in run2, false);
  assert.equal("external_id" in q.api.requests.slice(q.mark)[0].body, false);
  void externalId;
});

it("hosting/T346: postCheckRun needs the ability post-checks and its own grant, takes no authority from the caller, and refuses before any call", async () => {
  const p = await post(check);
  const opts = p.opts;
  const refused = async (why, c, o, code, repo = "o/r") => {
    await assert.rejects(hosting.postCheckRun(repo, c, o), (e) => e.code === code, why);
  };
  await refused("no grant", check, { fetch: p.api.fetch, api: p.api.api }, "GRANT_UNTRUSTED");
  await refused("a forged grant", check, { ...opts, grant: { token: "ghs_X", abilities: ["post-checks"] } }, "GRANT_UNTRUSTED");
  await refused("another repository", check, opts, "GRANT_REPO_MISMATCH", "o/other");
  for (const key of ["status", "app", "appId", "id", "head_sha", "output", "token", "permissions", "abilities"]) await refused(`${key} in the check`, { ...check, [key]: "x" }, opts, "INVALID_CHECK");
  for (const key of ["token", "abilities", "check", "declaration"]) await refused(`${key} as an option`, check, { ...opts, [key]: "x" }, "INVALID_CHECK");
  assert.equal(p.api.requests.length, p.mark, "every refusal came before any call");
  const readOnly = await post(check, { abilities: ["read-contents", "read-pull-requests"] });
  await assert.rejects(readOnly.run(), (e) => e.code === "ABILITY_REFUSED");
  assert.equal(readOnly.api.requests.length, readOnly.mark, "a grant without post-checks sends nothing");
});

it("hosting/T347: postCheckRun refuses a check that GitHub would not take or that is not what it says, before any call", async () => {
  const p = await post(check);
  const bad = (c) => hosting.postCheckRun("o/r", c, p.opts);
  const cases = [
    ["no name", { ...check, name: "" }], ["a name that is not text", { ...check, name: 7 }], ["a name with a line break", { ...check, name: "a\nb" }],
    ["a revision that is not 40 hex", { ...check, revision: "main" }], ["a short revision", { ...check, revision: "abc123" }], ["an upper-case revision", { ...check, revision: "A".repeat(40) }],
    ["a conclusion GitHub has no word for", { ...check, conclusion: "passed" }], ["a pending conclusion", { ...check, conclusion: "in_progress" }], ["no conclusion", { ...check, conclusion: undefined }],
    ["no title", { ...check, title: "" }], ["a title over 255 characters", { ...check, title: "t".repeat(256) }],
    ["no summary", { ...check, summary: " " }], ["a summary over 65535 characters", { ...check, summary: "s".repeat(65536) }],
    ["an empty external id", { ...check, externalId: "" }], ["an external id over 255 characters", { ...check, externalId: "e".repeat(256) }],
    ["not an object", "check"], ["nothing", undefined],
  ];
  for (const [why, c] of cases) await assert.rejects(bad(c), (e) => e.code === "INVALID_CHECK", why);
  for (const conclusion of ["success", "failure", "neutral", "cancelled", "skipped", "timed_out", "action_required"]) {
    const q = await post({ ...check, conclusion });
    assert.equal((await q.run()).conclusion, conclusion, conclusion);
  }
  const edge = await post({ ...check, title: "t".repeat(255), summary: "s".repeat(65535) });
  await edge.run();
  assert.equal(p.api.requests.length, p.mark, "every refusal came before any call");
});

it("hosting/T348: postCheckRun fails by name and never retries: a refused or failed post keeps GitHub's status and headers, and a run that is not the one asked for is not reported as posted", async () => {
  const fail = async (status, headers = {}) => {
    const p = await post(check, { world: () => ({ status, json: { message: "no" }, headers }) });
    await assert.rejects(p.run(), (e) => {
      assert.equal(e.code, "CHECK_FAILED");
      assert.equal(e.status, status, "GitHub's status is kept, so a caller can tell a refusal from a failure");
      for (const [name, value] of Object.entries(headers)) assert.equal(e.headers[name.toLowerCase()], value, name);
      assert.doesNotMatch(e.message + JSON.stringify(e.headers ?? {}), /ghs_/);
      return true;
    });
    assert.equal(p.api.requests.length - p.mark, 1, `HTTP ${status}: one request, never repeated`);
  };
  await fail(403, { "Retry-After": "30", "x-ratelimit-remaining": "0" });
  await fail(429);
  await fail(422);
  await fail(500);
  const net = await post(check, { world: () => { throw new Error("socket closed ghs_GRANT"); } });
  await assert.rejects(net.run(), (e) => e.code === "CHECK_FAILED" && e.status === undefined && !/ghs_/.test(e.message + JSON.stringify(e.headers ?? {})));
  assert.equal(net.api.requests.length - net.mark, 1);
  // What GitHub made must be what was asked for, by the App whose grant posted it.
  for (const [why, extra] of [
    ["another name", { name: "Other" }], ["another revision", { head_sha: "9".repeat(40) }], ["another conclusion", { conclusion: "failure" }], ["not completed", { status: "queued" }],
    ["another App", { app: { id: 12345, slug: "kaal-dispatcher" } }], ["no App", { app: undefined }], ["no id", { id: undefined }], ["a text id", { id: "4242" }],
  ]) {
    const p = await post(check, { world: route(extra) });
    await assert.rejects(p.run(), (e) => e.code === "CHECK_MISMATCH", why);
  }
});

it("hosting/T354: postCheckRun reports an external id only as GitHub confirmed it, and a run carrying another one is not the run asked for", async () => {
  // The external id is how a reader tells two posts of one verdict apart: the fact never claims a correlation GitHub did not return.
  const same = await post(check);
  assert.equal((await same.run()).externalId, "run-77", "GitHub returned the id asked for");
  for (const [why, extra] of [["another external id", { external_id: "run-78" }], ["no external id returned", { external_id: undefined }], ["an empty external id returned", { external_id: "" }], ["a number", { external_id: 77 }]]) {
    const p = await post(check, { world: route(extra) });
    await assert.rejects(p.run(), (e) => e.code === "CHECK_MISMATCH", why);
    assert.equal(p.api.requests.length - p.mark, 1, `${why}: one request, never repeated`);
  }
  // No external id asked: none is reported, and GitHub's empty or absent one is what it says when none was sent.
  const { externalId: _drop, ...bare } = check;
  for (const extra of [{ external_id: undefined }, { external_id: "" }, { external_id: null }]) {
    const p = await post(bare, { world: route(extra) });
    const run = await p.run();
    assert.equal("externalId" in run, false, "none asked, none reported");
  }
  const invented = await post(bare, { world: route({ external_id: "invented" }) });
  await assert.rejects(invented.run(), (e) => e.code === "CHECK_MISMATCH", "an id nobody sent is not the run asked for");
});

it("hosting/T355: postCheckRun refuses any key outside the check, whatever its value, before any call", async () => {
  // A key is refused for being there, not for what it holds: undefined, null, false, 0 and an empty string are values too.
  const p = await post(check);
  for (const key of ["status", "app", "appId", "id", "head_sha", "output", "token", "permissions", "abilities", "headSha", "extra"]) {
    for (const value of [undefined, null, false, 0, ""]) {
      await assert.rejects(hosting.postCheckRun("o/r", { ...check, [key]: value }, p.opts), (e) => e.code === "INVALID_CHECK", `${key}: ${String(value)}`);
    }
  }
  for (const key of ["token", "abilities", "check", "declaration", "extra"]) {
    await assert.rejects(hosting.postCheckRun("o/r", check, { ...p.opts, [key]: undefined }), (e) => e.code === "INVALID_CHECK", `${key} as an option`);
  }
  // A symbol key is a key too: it is refused for being there, as a key of the check and as a key of the options.
  for (const value of [undefined, "x"]) {
    await assert.rejects(hosting.postCheckRun("o/r", { ...check, [Symbol("extra")]: value }, p.opts), (e) => e.code === "INVALID_CHECK", `a symbol key of the check: ${String(value)}`);
    await assert.rejects(hosting.postCheckRun("o/r", check, { ...p.opts, [Symbol("extra")]: value }), (e) => e.code === "INVALID_CHECK", `a symbol key of the options: ${String(value)}`);
  }
  assert.equal(p.api.requests.length, p.mark, "every refusal came before any call");
  // The listed keys stay allowed with no value: an external id of undefined is none.
  const { externalId: _drop, ...bare } = check;
  const run = await (await post({ ...bare, externalId: undefined })).run();
  assert.equal("externalId" in run, false);
});
