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

State the claim. A test case is one claim about behaviour its user relies on, stated as a sentence that is true when the test passes, together with the proof of that claim. The claim, not its inputs, makes the case: more evidence for the same claim belongs to that case, and a new claim is a new case. State what is promised, not how it is done today, so the case outlives a change of mechanism. The claim says nothing about where or how the case is run.

Prove all of it. The proof covers exactly what the claim says: an exact result where the claim is exact, every entry where it speaks of a whole, everywhere a second one could be where it says there is only one. A case that would still pass with its claim broken proves nothing, so check that breaking the promise makes it fail. A failing case then names the claim that broke.

Keep test data apart from test cases. Test data is what a case proves its claim over: the inputs it is given, the conditions it is put in, such as which step fails, and the results it must produce. Its role makes it data, not its form: a file, a directory tree, a named row in a table, or a description of state that can only be built while the test runs. Name each item for what it shows. More data is more evidence for a claim, not another case, and the data a claim needs depends on its subject: the same claim about two subjects may need different data to cover all of it. What the claim itself says, such as the error it promises, belongs to the case. What only makes the test possible, such as the scratch place it works in, how a condition is produced or the platform it runs on, is not test data. Keeping data apart from the case lets the claim be read without its data in the way, and lets the same data serve several claims. Where test data is kept and how it is organised is the using system's decision.

Make it repeatable. Run again against the same version in the same environment, a test gives the same result: it does not depend on the order tests run in, on which other tests run with it, or on anything an earlier run left behind.

Know what a run proved. A test run is one occurrence of running a selection of cases against one version of the tested thing in one environment, together with what it observed for each case: passed, failed, or not run. Cases and their data outlive every run, and no run changes them; keeping a record of a run is not what makes it one. A run's result holds only for what it exercised: the cases it actually ran, the version it ran them against, and the environment it ran in, such as the platform, the runtime or how files were checked out, wherever these can change the result. A case skipped in a run proved nothing in it. The version a run exercises need not be the one its cases were written for: running a case against a version that breaks its claim is how the case is shown to be able to fail. Which cases a run should select, and where, is decided outside the run.

Anchor the testing. A using system's testing has one anchor: a directory, \`test/\` by default, where agents working with tests enter. Create it with \`scripts/create-anchor.ts [dir]\`. It creates \`<dir>/AGENTS.md\`, which routes agents working with tests to this skill, and nothing else, and refuses when \`<dir>\` already exists. The anchor is an entry point, not a container: tests and their data stay wherever the using system keeps them.

What to test, where and when to run it, and which tests to keep are the using system's decisions; this skill says how a test is written and creates the anchor.
`;

/** Generates this skill's SKILL.md at `target` (by default, next to this skill's scripts). */
export function init(target = SKILL): string {
  fs.writeFileSync(target, SKILL_MD);
  return target;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) init();
