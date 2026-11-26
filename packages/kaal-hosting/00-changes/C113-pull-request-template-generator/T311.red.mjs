// hosting/T311 draft (hosting/C113): auto-merge authorisation comes only from the declaration; nothing merges or approves.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { HOTFIX, declarations, names, options, request, standIn } from "./fixtures.mjs";

const refusedBefore = async (api, input, rule) => {
  await assert.rejects(hosting.raisePullRequest(input, declarations, options({ fetch: api.fetch, api: api.api })), (e) => e.code === "RAISE_REFUSED" && e.rule === rule);
  assert.equal(api.requests.length, 0, `${rule}: nothing was sent`);
};

it("hosting/T311: none or absent means no auto-merge call; the caller cannot choose a method or draft; no merge or approval request is ever sent", async () => {
  const none = standIn();
  const hotfix = { ...request, type: "HOTFIX", chapters: { Change: "d" }, head: "hotfix/x", base: "main", title: "Fix a defect" };
  await hosting.raisePullRequest(hotfix, declarations, options({ fetch: none.fetch, api: none.api }));
  assert.deepEqual(names(none.requests), ["POST /repos/o/r/pulls"], "autoMerge none: one request");
  assert.equal(none.requests[0].body.draft, true, "the declared draft flag");
  const absent = standIn();
  const bare = [{ ...HOTFIX, raise: { head: ["hotfix/*"], base: ["main"] } }];
  await hosting.raisePullRequest(hotfix, bare, options({ fetch: absent.fetch, api: absent.api }));
  assert.deepEqual(names(absent.requests), ["POST /repos/o/r/pulls"], "no autoMerge declared: one request, not a draft");
  assert.equal(absent.requests[0].body.draft, false);

  await refusedBefore(standIn(), { ...request, autoMerge: "squash" }, "caller-merge-choice");
  await refusedBefore(standIn(), { ...request, mergeMethod: "merge" }, "caller-merge-choice");
  await refusedBefore(standIn(), { ...request, draft: true }, "caller-draft-choice");

  for (const method of ["squash", "merge", "rebase", "none"]) {
    const api = standIn();
    const d = [{ ...declarations[0], raise: { ...declarations[0].raise, autoMerge: method } }];
    await hosting.raisePullRequest(request, d, options({ fetch: api.fetch, api: api.api }));
    for (const r of api.requests) {
      assert.doesNotMatch(r.path, /\/merge$|\/reviews$|\/review$/);
      assert.notEqual(r.method, "PUT");
      assert.doesNotMatch(JSON.stringify(r.body ?? {}), /approvePullRequest|mergePullRequest|APPROVE/);
    }
  }
});
