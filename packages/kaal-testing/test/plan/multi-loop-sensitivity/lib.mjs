// Helpers for the testing/C71 planned Cases. Read-only: they inspect the Skill directory only.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const PKG = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
/** Override with KAAL_TESTING_SKILL_DIR when validating against a throwaway reference Skill outside the repo. */
export const SKILL_DIR = process.env.KAAL_TESTING_SKILL_DIR ? resolve(process.env.KAAL_TESTING_SKILL_DIR) : join(PKG, "skills/kaal-testing");
export const SKILL = join(SKILL_DIR, "SKILL.md");
export const HEADING = "Testing loops";
export const OLD_HEADING = "The three loops";

export const readText = (p) => {
  assert.ok(existsSync(p), `missing: ${p}`);
  return readFileSync(p, "utf8");
};

/** The `## ` headings of SKILL.md in order, and the body of `## Testing loops` ('' when absent). */
export function skillParts() {
  const text = readText(SKILL);
  const headings = [...text.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
  const at = text.search(new RegExp(`^## ${HEADING}\\s*$`, "m"));
  if (at < 0) return { text, headings, section: "" };
  const rest = text.slice(at);
  const next = rest.slice(3).search(/^## /m);
  return { text, headings, section: (next < 0 ? rest : rest.slice(0, next + 3)).trimEnd() };
}
