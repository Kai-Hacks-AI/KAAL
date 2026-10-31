#!/usr/bin/env node
// Change Isolation: two repository engineering controls, decided from changed paths alone.
//
//   1. Core travels alone. A change touching Core contains only Core and the
//      supporting files listed in CORE_SUPPORT.
//   2. .github travels alone. A change touching .github/ contains nothing outside it.
//
// One interim allowance relaxes rule 1 for one Change, hosting/C11 (#657), and for no other: the
// engineering/C11 amendment, Option A, which the Owner approved on #716. It applies only when all hold:
//   - the change is hosting/C11's transformation: the target names Hosting's package `kaal-hosting`
//     and the candidate names it `@kaihacksai/kaal-hosting`, the rename hosting/A7 authorizes on the
//     target. Path equality alone never establishes which Change this is.
//   - it is unspent: once the target names `@kaihacksai/kaal-hosting`, hosting/C11 has landed and the
//     allowance cannot be used again, even before the Change that removes it.
//   - its paths beyond Core and CORE_SUPPORT are exactly HOSTING_C11's recorded set.
// The two names are read as Git data from the target and candidate commits the runner already supplies
// (GUARD_BASE, GUARD_HEAD); the candidate is never checked out or run. Without them the allowance
// does not apply. A change carrying part of the set fails, naming each extra and missing path. Rule 2
// is unchanged, so .github still travels alone. It is a migration exception, not a model of isolation,
// and a separate governed Engineering Change removes it once #657 has landed.
//
// Usage: check.mjs < paths
// Reads the change's repository-relative paths from stdin, NUL- or newline-separated. The caller
// supplies the complete change, both sides of every rename; this file alone defines the rules.
// Exits 0 when the change conforms, 1 with one line per offending path, 2 when it cannot judge.
//
// Limitation: the rules are path-level. An allowed supporting file passes whatever it contains.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/** Paths that are Core: the package and the Engine files deployed from its payload. */
const CORE = [/^packages\/kaal-core\//, /^\.kaal\/(AGENTS\.md|KAAL-KERNEL\.md|core\/)/];

/** Paths that may travel with Core and nothing else besides. */
const CORE_SUPPORT = [
  /^package\.json$/, // root workspace metadata
  /^package-lock\.json$/, // root lockfile
  /^engineering\/acceptance\/embed\.test\.mjs$/, // Core's own acceptance evidence
];

/**
 * hosting/C11's exact path set beyond Core and CORE_SUPPORT. hosting/C11 renames kaal-hosting to
 * @kaihacksai/kaal-hosting; Core imports Hosting, so neither half of the rename can land without the
 * other. Authority: the engineering/C11 amendment, Option A (Owner's approval on #716). Temporary.
 */
export const HOSTING_C11 = Object.freeze([
  "engineering/boundary.test.mjs",
  "engineering/contracts/measure.mjs",
  "engineering/contracts/race/hooks.mjs",
  "engineering/contracts/race/hosting.mjs",
  "engineering/coverage/measure.mjs",
  "engineering/delivery/pack.mjs",
  "engineering/delivery/pack.test.mjs",
  "engineering/github/lineage.test.ts",
  "engineering/inventory/attribute.mjs",
  "engineering/inventory/measure.mjs",
  "engineering/lanes/acceptance.mjs",
  "engineering/lanes/evidence.mjs",
  "engineering/lanes/evidence.test.mjs",
  "engineering/lanes/hosting.mjs",
  "engineering/lanes/workspaces.mjs",
  "engineering/report/measure.mjs",
  "packages/extensions/kaal-hosting/.gitattributes",
  "packages/extensions/kaal-hosting/README.md",
  "packages/extensions/kaal-hosting/package.json",
  "packages/extensions/kaal-hosting/plan/boundary/testing.md",
  "packages/extensions/kaal-hosting/test/conformance.test.ts",
  "packages/extensions/kaal-hosting/test/hosting.test.ts",
  "packages/extensions/kaal-hosting/test/plan/cleanup.test.mjs",
  "packages/extensions/kaal-hosting/test/plan/expectations.test.mjs",
  "packages/extensions/kaal-hosting/test/plan/kinds.test.mjs",
  "packages/extensions/kaal-hosting/test/plan/reconciliation.test.mjs",
  "packages/skills/kaal-engineer-skill/package.json",
  "packages/skills/kaal-engineer-skill/skills/kaal-engineer-skill/scripts/check-skill.mjs",
  "packages/skills/kaal-engineer-skill/test/acceptance/engineer-skill.test.mjs",
  "packages/skills/kaal-engineer-skill/test/check-skill.test.mjs",
  "packages/skills/kaal-engineer-skill/test/conformance/compare.mjs",
  "packages/skills/kaal-engineer-skill/test/conformance/fixtures.mjs",
  "packages/skills/kaal-engineer-skill/test/plan/skill-format.test.mjs",
  "packages/skills/kaal-graph/package.json",
  "packages/skills/kaal-graph/skills/kaal-graph/scripts/graph.mjs",
  "packages/skills/kaal-graph/test/acceptance/graph.test.mjs",
  "packages/skills/kaal-graph/test/graph.test.mjs",
  "packages/skills/kaal-testing/evidence.kaal.json",
  "packages/skills/kaal-testing/lib/acceptance.mjs",
  "packages/skills/kaal-testing/lib/coverage.mjs",
  "packages/skills/kaal-testing/package.json",
  "packages/skills/kaal-testing/test/acceptance.test.mjs",
  "packages/skills/kaal-testing/test/attribution.test.mjs",
  "packages/skills/kaal-testing/test/boundary.test.mjs",
  "packages/skills/kaal-testing/test/testing.test.mjs",
]);

const GITHUB = /^\.github\//;

const HOSTING_MANIFEST = "packages/extensions/kaal-hosting/package.json";

/** Hosting's package name as a commit holds it, read as Git data, or undefined when it cannot be read. */
function hostingName(commit) {
  if (!/^[0-9a-f]{7,64}$/.test(commit ?? "")) return undefined;
  try {
    const manifest = execFileSync("git", ["show", `${commit}:${HOSTING_MANIFEST}`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    return JSON.parse(manifest).name;
  } catch {
    return undefined;
  }
}

/** The facts the hosting/C11 allowance is judged on: Hosting's name on the target and on the candidate. */
export function facts(env = process.env) {
  return { target: hostingName(env.GUARD_BASE), candidate: hostingName(env.GUARD_HEAD) };
}

/** Whether these facts are hosting/C11's unspent transformation. */
const isHostingC11 = (f) => f?.target === "kaal-hosting" && f?.candidate === "@kaihacksai/kaal-hosting";

const any = (patterns, path) => patterns.some((p) => p.test(path));

/**
 * @param {string[]} paths repository-relative changed paths
 * @param {{target?: string, candidate?: string}} [hosting] Hosting's name on the target and the candidate
 * @returns {string[]} violations
 */
export function check(paths, hosting = { target: undefined, candidate: undefined }) {
  const violations = [];
  if (paths.some((p) => any(CORE, p))) {
    const beyond = [...new Set(paths.filter((p) => !any(CORE, p) && !any(CORE_SUPPORT, p)))];
    if (isHostingC11(hosting) && beyond.some((p) => HOSTING_C11.includes(p))) {
      // hosting/C11's unspent rename is judged against its recorded set, and only that set.
      for (const p of beyond) if (!HOSTING_C11.includes(p)) violations.push(`core travels alone: ${p} is extra to hosting/C11's allowed set`);
      for (const p of HOSTING_C11) if (!beyond.includes(p)) violations.push(`core travels alone: ${p} is missing from hosting/C11's allowed set`);
    } else {
      for (const p of paths) {
        if (!any(CORE, p) && !any(CORE_SUPPORT, p)) violations.push(`core travels alone: ${p} is not Core or its supporting files`);
      }
    }
  }
  if (paths.some((p) => GITHUB.test(p))) {
    for (const p of paths) if (!GITHUB.test(p)) violations.push(`.github travels alone: ${p} is outside .github/`);
  }
  return violations;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const refuse = (message) => {
    console.error(message);
    process.exit(2);
  };
  if (process.argv.length > 2) refuse("usage: check.mjs < paths");
  const input = readFileSync(0, "utf8");
  const paths = input.split(input.includes("\0") ? "\0" : "\n").filter(Boolean);
  const unnormal = paths.find((p) => p.split("/").some((s) => s === "" || s === "." || s === ".."));
  if (unnormal !== undefined) refuse(`not a repository-relative path: ${unnormal}`);
  const violations = check(paths, facts());
  for (const v of violations) console.error(v);
  if (violations.length) process.exit(1);
  console.log(`ok: ${paths.length} changed paths conform`);
}
