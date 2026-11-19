// hosting/C111 Case: the whole record from GraphQL where it answers.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { REPOSITORY, SHA, fakeGh } from "./fixtures.mjs";
const exported = () => assert.equal(typeof hosting.readPullRequests, "function", "readPullRequests is not exported");

it("hosting/T290: with GraphQL answering, readPullRequests returns one record per open pull request with every fact read, the unresolved threads counted", async () => {
  exported();
  const { gh } = fakeGh("graphql");
  const [pull, ...rest] = await hosting.readPullRequests(REPOSITORY, { gh });
  assert.equal(rest.length, 0);
  assert.equal(pull.number, 7);
  assert.equal(pull.title, "PLAN: A sample change");
  assert.equal(pull.draft, false);
  assert.deepEqual(pull.head, { ref: "claude/sample-plan", sha: SHA });
  assert.equal(pull.base.ref, "main");
  assert.deepEqual(pull.reviews, []);
  assert.deepEqual(pull.threads, { unresolved: 1 });
});
