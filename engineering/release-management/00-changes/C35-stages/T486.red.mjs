// Case release/T486 (release/C35): C16 admits a wire head on the verify Stages (Wiring) check alone
import assert from "node:assert/strict";
import { source, contexts } from "./helper.mjs";

export const id = "release/T486";
export const tests = ["release/C35", "engineering/C16"];
export const title = "a wire/* head is admitted when the wiring ruleset requires only verify Stages (Wiring) and it is green on the exact head, and refused when it is red";
export async function run() {
  const { promotionSource } = await import(new URL("../../../github/lineage.ts", import.meta.url).href);
  const SHA = "a".repeat(40);
  const base = { repo: "o/r", defaultBranch: "main", baseRef: "main", headRepo: "o/r", headRef: "wire/githooks-split", head: SHA };
  const required = contexts(source("Wiring")).map((context) => ({ context, integrationId: 15368 }));
  const runs = (conclusion) => required.map((r, i) => ({ id: i + 1, name: r.context, status: "completed", conclusion, appId: 15368, headSha: SHA }));
  assert.deepEqual(required.map((r) => r.context), ["verify Stages (Wiring)"]);
  assert.equal(promotionSource({ ...base, checks: { required, runs: runs("success") } }).kind, "pass");
  assert.equal(promotionSource({ ...base, checks: { required, runs: runs("failure") } }).kind, "fail");
}
