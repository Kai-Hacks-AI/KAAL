// hosting/T312 draft (hosting/C113): every breach of the owners' rules is refused before the first call.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { declarations, options, request, standIn } from "./fixtures.mjs";

it("hosting/T312: an unlisted type, DEFAULT, a head or base outside raise, a title rule and bad chapters are refused with the rule and its owner, and nothing is sent", async () => {
  const cases = [
    ["an unlisted type", { ...request, type: "ACT" }, "type-list", "engineering"],
    ["DEFAULT", { ...request, type: "DEFAULT" }, "type-list", "engineering"],
    ["a head outside raise", { ...request, head: "main" }, "head", "kaal-change"],
    ["a base outside raise", { ...request, base: "main" }, "base", "kaal-change"],
    ["a Change id in the title", { ...request, title: "C113 renders templates" }, "title", "kaal-change"],
    ["a missing chapter", { ...request, chapters: { Change: "x" } }, "chapters", "kaal-change"],
  ];
  for (const [why, input, rule, owner] of cases) {
    const api = standIn();
    await assert.rejects(hosting.raisePullRequest(input, declarations, options({ fetch: api.fetch, api: api.api })), (e) => e.code === "RAISE_REFUSED" && e.rule === rule && e.owner === owner, why);
    assert.equal(api.requests.length, 0, `${why}: nothing was sent`);
  }
});
