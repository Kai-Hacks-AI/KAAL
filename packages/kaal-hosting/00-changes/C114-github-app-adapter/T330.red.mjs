// hosting/T330 draft (hosting/C114): a grant is usable for its repository and its origin only.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { mint, standIn } from "./fixtures.mjs";

it("hosting/T330: a grant refuses another repository, another api and another fetch, before any call, and sends its token nowhere else", async () => {
  const { grant, api } = await mint(["read-contents"]);
  const ok = standIn(() => ({ status: 200, json: { object: { sha: "c".repeat(40) } } }));
  assert.equal(typeof (await hosting.readRef("o/r", "main", { grant, fetch: api.fetch, api: api.api }).catch(() => "x")), "string", "the transport it was minted against is accepted");
  for (const [why, call, code] of [
    ["another repository", () => hosting.readRef("o/other", "main", { grant, fetch: api.fetch, api: api.api }), "GRANT_REPO_MISMATCH"],
    ["another api origin", () => hosting.readRef("o/r", "main", { grant, fetch: api.fetch, api: "https://evil.invalid" }), "GRANT_TRANSPORT_MISMATCH"],
    ["another fetch", () => hosting.readRef("o/r", "main", { grant, fetch: ok.fetch, api: api.api }), "GRANT_TRANSPORT_MISMATCH"],
    ["the default origin when it was minted against another", () => hosting.readRef("o/r", "main", { grant, fetch: api.fetch }), "GRANT_TRANSPORT_MISMATCH"],
  ]) {
    const before = api.requests.length + ok.requests.length;
    await assert.rejects(call(), (e) => e.code === code, why);
    assert.equal(api.requests.length + ok.requests.length, before, `${why}: no request was sent anywhere`);
  }
});
