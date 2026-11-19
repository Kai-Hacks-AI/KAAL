// hosting/C111 Case: the same record where GraphQL is refused, from REST and the cloud thread route.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { REPOSITORY, SHA, fakeGh } from "./fixtures.mjs";
const exported = () => assert.equal(typeof hosting.readPullRequests, "function", "readPullRequests is not exported");

it("hosting/T291: with GraphQL refused, readPullRequests returns the same record shape from REST and the cloud review-thread route, and never asks GraphQL twice", async () => {
  exported();
  const { gh, calls } = fakeGh("cloud");
  const [pull] = await hosting.readPullRequests(REPOSITORY, { gh });
  assert.equal(pull.number, 7);
  assert.equal(pull.draft, false);
  assert.deepEqual(pull.head, { ref: "claude/sample-plan", sha: SHA });
  assert.equal(pull.base.ref, "main");
  assert.deepEqual(pull.reviews, []);
  assert.deepEqual(pull.threads, { unresolved: 1 });
  assert.equal(calls.filter((args) => args[1] === "graphql").length, 1, "GraphQL was asked more than once");
});
