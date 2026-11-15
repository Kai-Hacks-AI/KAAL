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
  admission: { HOTFIX: { qualifier: "hotfix-qual" }, WIRE: { qualifier: "wire-qual" }, KAAL: { qualifier: "kaal-qual", routes: ["kaal/**"] } },
  problems: [],
};
export const okQual = (stock, qualifier, head = HEAD) => ({ stock, qualifier, head, verdict: "pass", record: {} });
const Q = { HOTFIX: "hotfix-qual", WIRE: "wire-qual", KAAL: "kaal-qual" };
export const facts = (headRef, stock, extra = {}) => ({
  repo: "o/r", defaultBranch: "main", baseRef: "main", headRepo: "o/r", headRef, head: HEAD,
  registry: REGISTRY,
  qualification: stock === undefined ? null : okQual(stock, Q[stock] ?? `${stock}-q`),
  ...extra,
});
