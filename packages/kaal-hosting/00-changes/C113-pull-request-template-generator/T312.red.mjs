// hosting/T312 draft (hosting/C113): every breach of the owners' rules is refused, from the base policy, before the first write.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { options, posts, request, world } from "./fixtures.mjs";

it("hosting/T312: an unlisted type, DEFAULT, a head or base outside raise, a title rule and bad chapters are refused with the rule and the owner, and nothing is written", async () => {
  const cases = [
    ["an unlisted type", { ...request, type: "ACT" }, "type-list", "engineering"],
    ["DEFAULT", { ...request, type: "DEFAULT" }, "type-list", "engineering"],
    ["a head outside raise", { ...request, head: "main" }, "head", "kaal-change"],
    ["a base outside raise", { ...request, base: "main" }, "base", "kaal-change"],
    ["a Change id in the title", { ...request, title: "C113 renders templates" }, "title", "kaal-change"],
    ["a missing chapter", { ...request, chapters: { Change: "x" } }, "chapters", "kaal-change"],
  ];
  for (const [why, input, rule, owner] of cases) {
    const w = world();
    await assert.rejects(hosting.raisePullRequest(input, options(w)), (e) => e.code === "RAISE_REFUSED" && e.rule === rule && e.owner === owner, why);
    assert.deepEqual(posts(w.requests), [], `${why}: nothing was written`);
  }
});
