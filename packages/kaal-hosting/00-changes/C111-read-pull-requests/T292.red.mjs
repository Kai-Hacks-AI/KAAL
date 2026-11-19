// hosting/C111 Case: a fact no transport answers is unknown, never a zero.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { REPOSITORY, SHA, fakeGh } from "./fixtures.mjs";
const exported = () => assert.equal(typeof hosting.readPullRequests, "function", "readPullRequests is not exported");

it("hosting/T292: with GraphQL refused and no thread route, the threads are unknown with a reason, every other fact is still read, and nothing is zero", async () => {
  exported();
  const { gh } = fakeGh("no-threads");
  const [pull] = await hosting.readPullRequests(REPOSITORY, { gh });
  assert.equal(pull.threads.unknown, true);
  assert.equal(typeof pull.threads.reason, "string");
  assert.ok(pull.threads.reason.length > 0);
  assert.equal(pull.number, 7);
  assert.deepEqual(pull.reviews, []);
  assert.ok(!("unresolved" in pull.threads), "a count was invented");
});
