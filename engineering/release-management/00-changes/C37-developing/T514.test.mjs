// Case release/T514 (release/C37): C16 admits a head only when Integrating, its own family and Developing are all green on the exact head
import assert from "node:assert/strict";
import { source, contexts } from "./helper.mjs";

export const id = "release/T514";
export const tests = ["release/C37", "engineering/C16"];
export const title = "a wire/* head is admitted when Integrating, Wiring and Developing are green on the exact head, and refused when any of the three is red";
export async function run() {
  const { promotionSource } = await import(new URL("../../../github/lineage.ts", import.meta.url).href);
  const SHA = "a".repeat(40);
  const base = { repo: "o/r", defaultBranch: "main", baseRef: "main", headRepo: "o/r", headRef: "wire/example", head: SHA };
  const names = [...contexts(source("Integrating")), ...contexts(source("Wiring"))];
  assert.deepEqual(names, ["verify Stages (Integrating)", "verify Stages (Developing)", "verify Stages (Wiring)"]);
  const required = names.map((context) => ({ context, integrationId: 15368 }));
  const runs = (red) => names.map((name, i) => ({ id: i + 1, name, status: "completed", conclusion: name === red ? "failure" : "success", appId: 15368, headSha: SHA }));
  assert.equal(promotionSource({ ...base, checks: { required, runs: runs() } }).kind, "pass");
  for (const red of names) assert.equal(promotionSource({ ...base, checks: { required, runs: runs(red) } }).kind, "fail", `${red} red`);
}
