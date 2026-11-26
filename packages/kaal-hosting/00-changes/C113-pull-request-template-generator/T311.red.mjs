// hosting/T311 draft (hosting/C113): auto-merge comes only from the owner's declaration at the base revision.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { BASE, DO, HEAD, HOTFIX, PATHS, options, policy, posts, request, world } from "./fixtures.mjs";

const withDeclaration = (declaration, other = {}) => world({ files: { [BASE]: policy({ [PATHS.declaration("kaal-change")]: JSON.stringify({ types: [declaration, HOTFIX] }), ...other }), [HEAD]: policy() } });

it("hosting/T311: the declared method is what is enabled, none or absent enables nothing, and nothing merges, reviews or approves", async () => {
  for (const [method, enum_] of [["squash", "SQUASH"], ["merge", "MERGE"], ["rebase", "REBASE"]]) {
    const w = withDeclaration({ ...DO, raise: { ...DO.raise, autoMerge: method } });
    await hosting.raisePullRequest(request, options(w));
    assert.equal(w.requests.at(-1).body.variables.mergeMethod, enum_, method);
    for (const r of w.requests) {
      assert.doesNotMatch(r.path, /\/merge$|\/reviews?$|\/requested_reviewers$/);
      assert.notEqual(r.method, "PUT");
      assert.doesNotMatch(JSON.stringify(r.body ?? {}), /approvePullRequest|mergePullRequest|APPROVE/);
    }
  }
  for (const raise of [{ ...DO.raise, autoMerge: "none" }, { head: DO.raise.head, base: DO.raise.base }]) {
    const w = withDeclaration({ ...DO, raise });
    await hosting.raisePullRequest(request, options(w));
    assert.deepEqual(posts(w.requests), ["POST /repos/o/r/pulls"], JSON.stringify(raise));
    assert.equal(w.requests.find((r) => r.method === "POST").body.draft, false);
  }
  const hotfix = world({ changed: ["packages/kaal-hosting/13-source/a.ts"], refs: { "hotfix/x": HEAD, main: BASE } });
  await hosting.raisePullRequest({ ...request, type: "HOTFIX", chapters: { Change: "d" }, head: "hotfix/x", base: "main", title: "Fix a defect" }, options(hotfix));
  assert.equal(hotfix.requests.find((r) => r.method === "POST").body.draft, true, "the declared draft flag");
});
