// Case release/T486 (release/C35): enforcement is additive, and C16 admits a wire head on Integrating + Wiring
import assert from "node:assert/strict";
import { source, contexts } from "./helper.mjs";

export const id = "release/T486";
export const tests = ["release/C35", "engineering/C16"];
export const title = "a wire/* head is admitted when the effective rules (Integrating + Wiring) require only verify Stages (Integrating) and (Wiring) and both are green on the exact head, and refused when either is red";
export async function run() {
  const { promotionSource } = await import(new URL("../../../github/lineage.ts", import.meta.url).href);
  const SHA = "a".repeat(40);
  const base = { repo: "o/r", defaultBranch: "main", baseRef: "main", headRepo: "o/r", headRef: "wire/githooks-split", head: SHA };
  const names = [...contexts(source("Integrating")), ...contexts(source("Wiring"))];
  assert.deepEqual(names, ["verify Stages (Integrating)", "verify Stages (Developing)", "verify Stages (Wiring)"]); // release/C37 adds Developing
  const required = names.map((context) => ({ context, integrationId: 15368 }));
  const runs = (red) => names.map((name, i) => ({ id: i + 1, name, status: "completed", conclusion: name === red ? "failure" : "success", appId: 15368, headSha: SHA }));
  assert.equal(promotionSource({ ...base, checks: { required, runs: runs() } }).kind, "pass");
  for (const red of names) assert.equal(promotionSource({ ...base, checks: { required, runs: runs(red) } }).kind, "fail", `${red} red`);
}
