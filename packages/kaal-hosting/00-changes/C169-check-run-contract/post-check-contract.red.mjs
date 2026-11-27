// hosting/C169 executable drafts (T354 and T355): the contract of `postCheckRun` (hosting/C117, on `main`). RED on `main`: the
// external id is reported as the caller gave it, and a key of the check whose value is `undefined` is not refused. They use the App
// fixtures of hosting/C114 (`04-test/package-check/app-fixtures.mjs`). The DO turns them into delivered Cases unchanged
// (`04-test/package-check/app-checks.test.mjs`). Nothing reaches GitHub.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { DISPATCHER, granted } from "../../04-test/package-check/app-fixtures.mjs";

const HEAD = "1".repeat(40);
const INSPECTOR = { ...DISPATCHER, app: "inspector", name: "KAAL Inspector", owner: "kaal-review", appId: "5953432", abilities: ["read-contents", "read-pull-requests", "read-checks", "post-checks"] };
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
  assert.equal(p.api.requests.length, p.mark, "every refusal came before any call");
  // The listed keys stay allowed with no value: an external id of undefined is none.
  const { externalId: _drop, ...bare } = check;
  const run = await (await post({ ...bare, externalId: undefined })).run();
  assert.equal("externalId" in run, false);
});
