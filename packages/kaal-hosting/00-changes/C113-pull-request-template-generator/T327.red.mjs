// hosting/T327 draft (hosting/C113, amendment): a rename or a copy is judged by its source.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { BASE, HEAD, options, posts, request, world } from "./fixtures.mjs";

const raise = (w) => hosting.raisePullRequest(request, options(w)).then(() => null, (e) => e);

it("hosting/T327: a rename or a copy is judged by its source as well as its destination, and a source GitHub does not name is unknown", async () => {
  const dest = "packages/a/13-source/new.ts";
  const edit = (f) => hosting.raisePullRequest(request, options(world({ changed: [f] }))).then(() => null, (e) => e);
  // A rename out of a path the type may not write is refused and names the source.
  let e = await edit({ filename: dest, status: "renamed", previous_filename: "packages/a/10-intent/intent.md" });
  assert.equal(e?.rule, "write-areas");
  assert.match(e.message, /10-intent\/intent\.md/);
  e = await edit({ filename: dest, status: "copied", previous_filename: ".github/workflows/x.yml" });
  assert.equal(e?.rule, "write-areas");
  assert.match(e.message, /\.github/);
  // A rename whose source is missing (or not text) is unknown, whatever its destination.
  for (const f of [{ filename: dest, status: "renamed" }, { filename: dest, status: "copied", previous_filename: "" }, { filename: dest, status: "modified", previous_filename: 7 }]) {
    const w = world({ changed: [f] });
    e = await hosting.raisePullRequest(request, options(w)).then(() => null, (x) => x);
    assert.equal(e?.code, "RAISE_REFUSED", JSON.stringify(f));
    assert.equal(e.rule, "revision", JSON.stringify(f));
    assert.deepEqual(posts(w.requests), [], "nothing was written");
  }
  // A rename inside the allowed area, both paths judged, goes on.
  const ok = world({ changed: [{ filename: dest, status: "renamed", previous_filename: "packages/a/13-source/old.ts" }] });
  await hosting.raisePullRequest(request, options(ok));
  assert.deepEqual(posts(ok.requests).slice(0, 1), ["POST /repos/o/r/pulls"]);
});
