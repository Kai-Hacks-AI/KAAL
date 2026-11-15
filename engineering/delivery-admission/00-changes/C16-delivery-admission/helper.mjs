// Shared facts for the engineering/C16 Cases. The unit is promotionSource in engineering/github/lineage.ts.
export const load = () => import(new URL("../../../github/lineage.ts", import.meta.url).href);
export const SHA = "a".repeat(40);
export const base = { repo: "o/r", defaultBranch: "main", baseRef: "main", headRepo: "o/r", head: SHA };
let id = 1;
export const run = (name, conclusion = "success", extra = {}) => ({ id: id++, name, status: conclusion === null ? "in_progress" : "completed", conclusion, appId: 15368, ...extra });
export const need = (...names) => names.map((context) => ({ context, integrationId: 15368 }));
// every required check has a completed, successful run on the head
export const green = (...names) => ({ required: need(...names), runs: names.map((n) => run(n)) });
