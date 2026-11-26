// hosting/T313 draft (hosting/C113): the write boundary comes from the revision's own diff and Engineering's areas at the base.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { options, posts, request, world } from "./fixtures.mjs";

const run = async (changed, input = request, config = {}) => { const w = world({ changed, ...config }); const p = hosting.raisePullRequest(input, options(w)); return { p, w }; };
const refused = async (changed, rule, text, input, config) => {
  const { p, w } = await run(changed, input, config);
  await assert.rejects(p, (e) => e.code === "RAISE_REFUSED" && e.rule === rule && e.owner === "engineering" && (!text || text.test(e.message)));
  assert.deepEqual(posts(w.requests), [], "nothing was written");
};

it("hosting/T313: a path outside the type's phases or in no area is refused and named; legacy names read through; an empty diff is refused", async () => {
  await refused(["packages/kaal-hosting/13-source/a.ts", "packages/kaal-hosting/10-intent/intent.md"], "write-areas", /10-intent\/intent\.md/);
  await refused(["packages/kaal-hosting/99-unknown/a.md"], "write-areas", /99-unknown/);
  await refused([".github/workflows/x.yml"], "write-areas", /\.github/);
  await refused(["packages/kaal-hosting/13-source-extra/a.ts"], "write-areas", /13-source-extra/, request);
  await refused(["packages/kaal-hosting/01-changes/C1/x.md"], "write-areas", /01-changes/, request);
  await refused([], "write-areas", /no changed path/);
  for (const ok of [["packages/a/13-source/x/y/z.ts", "packages/b/13-source/t.mjs"], ["packages/a/05-src/legacy.ts"], ["packages/a/package.json"]]) {
    const { p, w } = await run(ok);
    await p;
    assert.deepEqual(posts(w.requests).slice(0, 1), ["POST /repos/o/r/pulls"], ok.join());
  }
  // A SYNC may carry no phase (engineering/C36: may []), so its diff cannot be judged by areas: it refuses, fail closed.
  await refused(["packages/a/13-source/x.ts"], "write-areas", undefined, { ...request, type: "SYNC", chapters: { Change: "x", Reason: "y" }, head: "sync/a", title: "Sync" }, { refs: { "sync/a": "1".repeat(40), "kaal/hosting/gen": "2".repeat(40) } });
});
