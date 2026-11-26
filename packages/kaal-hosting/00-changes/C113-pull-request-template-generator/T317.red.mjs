// hosting/T317 draft (hosting/C113): production authority is not caller-selected. Only the transport is injected.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { BASE, DO, HEAD, HOTFIX, PATHS, declarations, options, policy, posts, reads, request, world } from "./fixtures.mjs";

const refusedAs = async (w, input, extra, rule) => {
  await assert.rejects(hosting.raisePullRequest(input, options(w, extra)), (e) => e.code === "RAISE_REFUSED" && e.rule === rule, rule);
  assert.equal(w.requests.length, 0, `${rule}: refused before any call, not even a read`);
};

it("hosting/T317: caller-supplied authority is refused before any call; the head's own policy and diff are never read as authority; every unknown refuses", async () => {
  // 1. Authority offered by the caller is refused, not ignored: policy, paths, merge and draft choices.
  for (const [key, value] of [["declarations", declarations], ["typeList", { types: [{ type: "DO", owner: "kaal-change" }], invalid: [] }], ["writeAreas", { DO: ["**"] }], ["changedPaths", ["packages/a/13-source/x.ts"]], ["changed", []], ["policy", {}]]) {
    await refusedAs(world(), request, { [key]: value }, "caller-authority");
    await refusedAs(world(), { ...request, [key]: value }, {}, "caller-authority");
  }
  await refusedAs(world(), { ...request, autoMerge: "squash" }, {}, "caller-merge-choice");
  await refusedAs(world(), { ...request, mergeMethod: "merge" }, {}, "caller-merge-choice");
  await refusedAs(world(), { ...request, draft: true }, {}, "caller-draft-choice");

  // 2. A permissive policy on the head (the branch being raised) is never read: only the base revision is.
  const permissive = policy({
    [PATHS.writeAreas]: JSON.stringify({ areas: [{ path: "", phase: "DO" }], legacy: {}, pullRequests: [{ type: "DO", may: ["DO", "PLAN", "ACT"] }] }),
    [PATHS.declaration("kaal-change")]: JSON.stringify({ types: [{ ...DO, raise: { head: ["*"], base: ["*"], autoMerge: "rebase" } }, HOTFIX] }),
  });
  const hostile = world({ files: { [BASE]: policy(), [HEAD]: permissive }, changed: ["packages/kaal-hosting/10-intent/intent.md"] });
  await assert.rejects(hosting.raisePullRequest(request, options(hostile)), (e) => e.code === "RAISE_REFUSED" && e.rule === "write-areas");
  assert.deepEqual(posts(hostile.requests), []);
  assert.ok(reads(hostile.requests).every((r) => !r.endsWith(`@${HEAD}`)), "no policy file was read at the head revision");
  const allowed = world({ files: { [BASE]: policy(), [HEAD]: permissive } });
  await hosting.raisePullRequest(request, options(allowed));
  assert.equal(allowed.requests.at(-1).body.variables.mergeMethod, "SQUASH", "the base's method, not the head's rebase");

  // 3. Every unknown refuses, and nothing is written.
  const missingFile = (path) => world({ files: { [BASE]: Object.fromEntries(Object.entries(policy()).filter(([p]) => p !== path)), [HEAD]: policy() } });
  const unknowns = [
    ["the type list is missing at the base", missingFile(PATHS.typeList), "type-list"],
    ["the write areas are missing at the base", missingFile(PATHS.writeAreas), "write-areas"],
    ["the owner's declaration is missing at the base", missingFile(PATHS.declaration("kaal-change")), "declaration"],
    ["a policy file is not JSON", world({ files: { [BASE]: policy({ [PATHS.writeAreas]: "{ nope" }), [HEAD]: policy() } }), "write-areas"],
    ["the declaration does not hold the type", world({ files: { [BASE]: policy({ [PATHS.declaration("kaal-change")]: JSON.stringify({ types: [HOTFIX] }) }), [HEAD]: policy() } }), "declaration"],
    ["the head does not resolve", world({ refs: { "kaal/hosting/gen": BASE } }), "revision"],
    ["the base does not resolve", world({ refs: { "claude/work": HEAD } }), "revision"],
    ["the compare fails", world({ script: (r) => (r.path.includes("/compare/") ? { status: 500, json: {} } : undefined) }), "revision"],
    ["the compare is cut off at 300 files", world({ changed: Array.from({ length: 300 }, (_, i) => `packages/a/13-source/f${i}.ts`) }), "revision"],
  ];
  for (const [why, w, rule] of unknowns) {
    await assert.rejects(hosting.raisePullRequest(request, options(w)), (e) => e.code === "RAISE_REFUSED" && e.rule === rule, why);
    assert.deepEqual(posts(w.requests), [], `${why}: nothing was written`);
  }
});
