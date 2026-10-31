#!/usr/bin/env node
// Change Isolation: two repository engineering controls, decided from changed paths alone.
//
//   1. Core travels alone. A change touching Core contains only Core and the
//      supporting files listed in CORE_SUPPORT.
//   2. .github travels alone. A change touching .github/ contains nothing outside it.
//
// A declared migration is the one exception to rule 1, for a Change that cannot be split because
// Core and the files beyond it must move together. It names its Change, the Owner's decision, and
// the exact set of other paths it carries. A change is judged under it only when its paths beyond
// Core and CORE_SUPPORT are exactly that set: one path more or one fewer, and rule 1 applies. A
// malformed entry, one that lists a path twice, names a Core, supporting or .github path, or is not
// a normal repository-relative path, never applies. The exception is temporary: a governed
// Engineering Change removes the entry once its Change has landed.
//
// Usage: check.mjs < paths
// Reads the change's repository-relative paths from stdin, NUL- or newline-separated. The caller
// supplies the complete change, both sides of every rename; this file alone defines the rules.
// Exits 0 when the change conforms, 1 with one line per offending path, 2 when it cannot judge.
//
// Limitation: the rules are path-level. An allowed supporting file passes whatever it contains.
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

/** Declared migrations. Each entry is temporary: a governed Engineering Change removes it once its Change has landed. */
export const MIGRATIONS = [
  {
    // hosting/C11 (#657) renames kaal-hosting to @kaihacksai/kaal-hosting. Core imports Hosting,
    // so a Core-only half cannot resolve the new name, and a half without Core breaks Core.
    change: "hosting/C11",
    decision: "the Owner's re-review of hosting/C11 (comment 6543757589): a temporary allowance for its exact path set",
    paths: [
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
    ],
  },
];

const GITHUB = /^\.github\//;

const any = (patterns, path) => patterns.some((p) => p.test(path));
const normal = (p) => typeof p === "string" && p.split("/").every((s) => s !== "" && s !== "." && s !== "..");

/** Whether a migration entry is well formed. One that is not never applies. */
export function wellFormed(m) {
  if (!m || typeof m.change !== "string" || m.change === "" || typeof m.decision !== "string" || m.decision === "") return false;
  if (!Array.isArray(m.paths) || m.paths.length === 0 || new Set(m.paths).size !== m.paths.length) return false;
  return m.paths.every((p) => normal(p) && !any(CORE, p) && !any(CORE_SUPPORT, p) && !GITHUB.test(p));
}

/**
 * @param {string[]} paths repository-relative changed paths
 * @param {object[]} [migrations] the declared migrations; tests pass their own
 * @returns {string[]} violations
 */
export function check(paths, migrations = MIGRATIONS) {
  const violations = [];
  if (paths.some((p) => any(CORE, p))) {
    const beyond = [...new Set(paths.filter((p) => !any(CORE, p) && !any(CORE_SUPPORT, p)))].sort();
    const declared = migrations.some((m) => wellFormed(m) && [...m.paths].sort().join("\0") === beyond.join("\0"));
    for (const p of declared ? [] : paths) {
      if (!any(CORE, p) && !any(CORE_SUPPORT, p)) violations.push(`core travels alone: ${p} is not Core or its supporting files`);
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
  const violations = check(paths);
  for (const v of violations) console.error(v);
  if (violations.length) process.exit(1);
  console.log(`ok: ${paths.length} changed paths conform`);
}
