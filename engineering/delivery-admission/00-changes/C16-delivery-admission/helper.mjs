// Shared by the Cases of engineering/C16. The module under test is absent on main, so every Case fails until the DO.
// The registry is the one pull/C14 returns for main's tip: { accepted, source, classRoutes, stocks, problems },
// plus the `admission` section of the sibling kaal-admission.json (stock -> { qualifier, routes?, migration? }).
export const MODULE = new URL("../../admission.mjs", import.meta.url).href;
export const load = () => import(MODULE);
export const HEAD = "a".repeat(40);
export const REGISTRY = {
  accepted: true,
  source: "main",
  classRoutes: { HOTFIX: ["hotfix/*"], WIRE: ["wire/*"] },
  stocks: [{ capability: "release", stock: "kaal/release/*" }],
  admission: { HOTFIX: { qualifier: "hotfix-out" }, WIRE: { qualifier: "wire-out" }, KAAL: { qualifier: "kaal-out", routes: ["kaal/**"] } },
  problems: [],
};
export const okOut = (stock, qualifier, head = HEAD) => ({ stock, qualifier, head, verdict: "pass", record: {} });
const Q = { HOTFIX: "hotfix-out", WIRE: "wire-out", KAAL: "kaal-out" };
export const facts = (headRef, stock, extra = {}) => ({
  repo: "o/r", defaultBranch: "main", baseRef: "main", headRepo: "o/r", headRef, head: HEAD,
  registry: REGISTRY,
  out: stock === undefined ? null : okOut(stock, Q[stock] ?? `${stock}-q`),
  ...extra,
});
