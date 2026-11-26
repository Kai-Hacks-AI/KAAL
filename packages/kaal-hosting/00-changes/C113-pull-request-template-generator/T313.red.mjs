// hosting/T313 draft (hosting/C113): the write boundary of the type (Engineering's write areas).
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { declarations, options, request, standIn } from "./fixtures.mjs";

it("hosting/T313: a changed path outside the type's write areas is refused and named; inside, and an unknown area set, are decided before any call", async () => {
  const run = async (extra) => { const api = standIn(); const p = hosting.raisePullRequest(request, declarations, options({ fetch: api.fetch, api: api.api, ...extra })); return { p, api }; };
  const outside = await run({ changedPaths: ["packages/kaal-hosting/05-src/a.ts", "packages/kaal-hosting/01-intent/intent.md"] });
  await assert.rejects(outside.p, (e) => e.code === "RAISE_REFUSED" && e.rule === "write-areas" && e.owner === "engineering" && /01-intent\/intent\.md/.test(e.message));
  assert.equal(outside.api.requests.length, 0);
  const inside = await run({ changedPaths: ["packages/a/05-src/x/y/z.ts", "packages/b/04-test/t.test.mjs"] });
  await inside.p;
  assert.equal(inside.api.requests.length >= 1, true);
  const none = await run({ writeAreas: { SYNC: ["**"] } });
  await assert.rejects(none.p, (e) => e.rule === "write-areas", "a type with no declared areas fails closed");
  assert.equal(none.api.requests.length, 0);
  const empty = await run({ changedPaths: [] });
  await empty.p;
  assert.equal(empty.api.requests.length >= 1, true, "no changed path breaks no boundary");
  const part = await run({ changedPaths: ["packages/kaal-hosting/05-src-extra/a.ts"] });
  await assert.rejects(part.p, (e) => e.rule === "write-areas", "`*` is one whole segment, so 05-src-extra is outside 05-src");
});
