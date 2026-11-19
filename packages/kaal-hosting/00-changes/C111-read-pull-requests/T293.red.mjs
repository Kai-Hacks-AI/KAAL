// hosting/C111 Case: nothing answers.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { REPOSITORY, SHA, fakeGh } from "./fixtures.mjs";
const exported = () => assert.equal(typeof hosting.readPullRequests, "function", "readPullRequests is not exported");

it("hosting/T293: when no transport answers, readPullRequests rejects with PULLS_UNREADABLE and returns nothing", async () => {
  exported();
  const { gh } = fakeGh("down");
  await assert.rejects(hosting.readPullRequests(REPOSITORY, { gh }), (error) => error instanceof hosting.HostingError && error.code === "PULLS_UNREADABLE");
});
