// Shared by the Cases of engineering/C16. The module under test is absent on main, so every Case fails until the DO.
export const MODULE = new URL("../../admission.mjs", import.meta.url).href;
export const load = () => import(MODULE);
export const base = { repo: "o/r", defaultBranch: "main", baseRef: "main", headRepo: "o/r" };
export const facts = (headRef, evidence, extra = {}) => ({ ...base, headRef, evidence, ...extra });
export const HOTFIX_OK = {
  hotfix: {
    chapters: ["Change", "Defect", "Urgency", "Approach"],
    defect: "engineering/D1",
    defectOnMain: true,
    redCase: { onMain: "T1.red.mjs", atHead: "T1.test.mjs" },
  },
};
export const WIRE_OK = {
  wire: {
    pairs: [{ kind: "copy", target: ".github/x.yml", source: "engineering/x.yml" }],
    changed: [{ path: ".github/x.yml", text: "a" }],
    main: { "engineering/x.yml": "a" },
  },
};
