// Shared by the Cases of engineering/C16. The module under test is absent on main, so every Case fails until the DO.
export const MODULE = new URL("../../admission.mjs", import.meta.url).href;
export const load = () => import(MODULE);
export const HEAD = "a".repeat(40);
export const entry = (stock, route, qualifier = `${stock}-out`, extra = {}) => ({ stock, route, out: { qualifier }, ...extra });
export const REGISTRATION = {
  accepted: true,
  entries: [entry("hotfix", "hotfix/*"), entry("wire", "wire/*"), entry("hotfix-capability", "kaal/hotfix/**"), entry("kaal-foundation", "kaal/foundation/**")],
};
export const okOut = (stock, qualifier = `${stock}-out`, head = HEAD) => ({ stock, qualifier, head, verdict: "pass", record: {} });
export const facts = (headRef, stock, extra = {}) => ({
  repo: "o/r", defaultBranch: "main", baseRef: "main", headRepo: "o/r", headRef, head: HEAD,
  registration: REGISTRATION,
  out: stock === undefined ? null : okOut(stock),
  ...extra,
});
