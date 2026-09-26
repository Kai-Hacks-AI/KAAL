import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const SKILL = fileURLToPath(new URL("../SKILL.md", import.meta.url));

/** This skill's SKILL.md. The skill is born from init: SKILL.md is generated from here, never edited by hand. */
export const SKILL_MD = `---
name: testing
description: Write tests that state claims, keep test data apart from test cases, and run the same way wherever the tested thing runs. Use when adding, changing or reviewing tests.
---

# Testing

A test proves a claim about what the tested thing does. Write it so the claim is visible, the evidence is separate from the proof, and the proof holds every time it is run.

State the claim. A test case's name is one claim about behaviour its user relies on, written as a sentence that is true when the test passes: "refuses to overwrite an existing file", not "test overwrite". When a claim needs "and", it is either one behaviour with several observable parts or two cases. A case asserts what the claim says and no more, so a failing case names the claim that broke.

Keep test data apart from test cases. Test data is the inputs and expected results a case uses: files, directory trees, recorded outputs. It lives in a \`test-data/\` directory beside the tests, named for what each item shows (\`file-removed\`, \`header-malformed\`), and a small loader next to the tests (\`test-data.ts\`) gives cases access to it by name. A case holds no data itself, so the same data can serve several claims and a claim can be read without its data in the way. Data a case compares byte for byte stays byte-exact wherever it is checked out: the using system keeps it out of line-ending conversion and formatting.

Never test over the data. A case that changes anything works on a fresh scratch copy of its data, in a temporary directory, never on the committed data or on another case's copy, so cases do not depend on order or on what an earlier run left behind.

Run the same way everywhere. Tests are run repeatedly, locally and in CI, on every platform the tested thing supports, and a test that passes on one platform and fails on another has found a real difference. A failure that cannot be produced the same way on every platform, such as a full disk or an unreadable file, is simulated through a narrow seam in the tested code, named as a simulation in the case, and the case then claims what the failure leaves behind.

Learn from failures. Every failure found by review, probing or use becomes a test case stating the claim it broke, before or with its fix. When the same kind of failure keeps being found, change the mechanism that lets it happen instead of adding another case.

What to test, where and when to run it, and which tests to keep are the using system's decisions; this skill says how a test is written.
`;

/** Generates this skill's SKILL.md at `target` (by default, next to this skill's scripts). */
export function init(target = SKILL): string {
  fs.writeFileSync(target, SKILL_MD);
  return target;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) init();
