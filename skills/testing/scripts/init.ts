import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const SKILL = fileURLToPath(new URL("../SKILL.md", import.meta.url));

/** This skill's SKILL.md. The skill is born from init: SKILL.md is generated from here, never edited by hand. */
export const SKILL_MD = `---
name: testing
description: Write tests that state claims, keep their test data apart from the test cases, and give the same result every time they run. Use when adding, changing or reviewing tests, or creating a testing anchor.
---

# Testing

A test proves a claim about what the tested thing does, and can be run again to prove it again.

State the claim. Each test case states one claim about behaviour its user relies on, as a sentence that is true when the test passes, and asserts what that claim says. A failing case then names the claim that broke.

Keep test data apart from test cases. The inputs and expected results a case uses are its test data. Keeping them apart from the case lets the claim be read without its data in the way, and lets the same data serve several claims. Where test data is kept and how it is organised is the using system's decision.

Make it repeatable. A test gives the same result every time it is run: it does not depend on the order tests run in or on anything an earlier run left behind.

Anchor the testing. A using system's testing has one anchor: a directory, \`test/\` by default, where agents working with tests enter. Create it with \`scripts/create-anchor.ts [dir]\`. It creates \`<dir>/AGENTS.md\`, which routes agents working with tests to this skill, and nothing else, and refuses when \`<dir>\` already exists. The anchor is an entry point, not a container: tests and their data stay wherever the using system keeps them.

What to test, where and when to run it, and which tests to keep are the using system's decisions; this skill says how a test is written and creates the anchor.
`;

/** Generates this skill's SKILL.md at `target` (by default, next to this skill's scripts). */
export function init(target = SKILL): string {
  fs.writeFileSync(target, SKILL_MD);
  return target;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) init();
