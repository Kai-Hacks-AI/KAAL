// Shared facts for the engineering/C16 Cases. The unit is promotionSource in engineering/github/lineage.ts.
export const load = () => import(new URL("../../../github/lineage.ts", import.meta.url).href);
export const SHA = "a".repeat(40);
export const base = { repo: "o/r", defaultBranch: "main", baseRef: "main", headRepo: "o/r", head: SHA };
export const green = (...names) => ({ required: names, runs: names.map((name) => ({ name, conclusion: "success" })) });
