// The reminder (F21, A15): after the verdict lines of a run that has a fail or cannot judge, one line
// naming where the kaal-guard Skill is. In a CI run it also names, for each failing check that the
// hook runs too, the hook as an earlier opportunity (F43). It is reporting only: it changes no verdict,
// no exit status and no verdict line (F22), and the runner and the hook know nothing of it.
import { existsSync } from "node:fs";
import { isAbsolute, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

/** The Skill's canonical location in a repository (F23). */
export const SKILL = ".agents/skills/kaal-guard/SKILL.md";

/** The package's own copy of the Skill. */
const PACKAGE_SKILL = fileURLToPath(new URL("../skills/kaal-guard/SKILL.md", import.meta.url));

/** Whether a run's results ask for the reminder: a fail or a cannot judge among them. */
export const needed = (results) => results.some((r) => r.verdict === "fail" || r.verdict === "cannot judge");

/**
 * Where the Skill is: the deployed one when the installation record registers it and it exists, as a
 * repository-relative path; otherwise the package's copy, relative to the repository where it lies
 * inside it, and absolute where it does not. `deployed` says which.
 */
export function skill(root, record) {
  if (record?.assets?.[SKILL] && existsSync(join(root, SKILL))) return { path: SKILL, deployed: true };
  const inside = relative(root, PACKAGE_SKILL);
  const path = inside && !inside.startsWith("..") && !isAbsolute(inside) ? inside.split("\\").join("/") : PACKAGE_SKILL;
  return { path, deployed: false };
}

/** The one reminder line. */
export function line({ path, deployed }) {
  return deployed
    ? `kaal-guard: to resolve a fail or cannot judge, read the kaal-guard Skill at ${path}`
    : `kaal-guard: to resolve a fail or cannot judge, read the kaal-guard Skill; none is deployed in this repository, so read the package's copy at ${path}`;
}

/**
 * The checks of a CI run that earn the earlier-opportunity line (F43): each one that ends fail and whose
 * declaration's `runs` holds both hook and ci. A run in the hook, a check that runs only in CI and any
 * other verdict earn none. `list` is the repository's declarations as the run read them.
 */
export function earlier(results, list, ci) {
  if (!ci) return [];
  return results.filter((r) => r.verdict === "fail" && list.checks?.[r.name]?.runs?.includes("hook") && list.checks[r.name].runs.includes("ci")).map((r) => r.name);
}

/**
 * The earlier-opportunity line for one check (F43). It is a condition and a next step, never a claim: Guard
 * does not know why the hook did not catch the failure, so the line never says that the hook was missing.
 */
export function earlierLine(name) {
  return `kaal-guard: ${name} also runs in the pre-push hook, so the hook was an earlier opportunity to catch this failure; check whether the hook is active in your clone, and if it is not active, run \`npx kaal-guard init --hook\`, then run \`npx kaal-guard run --check ${name}\` locally`;
}
