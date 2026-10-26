// The reminder (F21, A15): after the verdict lines of a run that has a fail or cannot judge, one line
// naming where the kaal-guard Skill is. It is reporting only: it changes no verdict, no exit status and
// no verdict line (F22), and the runner and the hook know nothing of it.
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
