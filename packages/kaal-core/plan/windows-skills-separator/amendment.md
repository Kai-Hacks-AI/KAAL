# core/D3 PLAN: bounded amendment of one Core test line (host separator)

Review material only. This PLAN changes no test, script or package byte; it asks for approval of one bounded change to an existing, immutable test.

## Why

core/D3 (`defects/D3-core-test-skills-separator.md`) is a Core defect found by the Windows full-suite run on the core/D1 and core/D2 fix (#1025): 180 of 181 tests pass, and the identity test fails because `!p.includes("/skills/")` never matches a Windows directory entry (`skills\kaal-core\SKILL.md`), so untyped Skill files reach the typed-Node check. Its RED Case core/T124 fails today; core/T125 is the passing control.

## The amendment

`packages/kaal-core/test/core.test.ts`, one import and one line, in the test "keeps the id, name and type of every Node in this repository, and only the genesis has no type":

- `import { dirname, join } from "node:path";` becomes `import { dirname, join, sep } from "node:path";`
- `!p.includes("/skills/")` becomes `!p.split(sep).includes("skills")`.

On any host the filter excludes exactly the entries under a `skills` directory, as before: on Linux `x/skills/y.md` is excluded by either form, and no `.md` file is itself named `skills`. No assertion, title, fixture or other line changes.

`amendment.patch` is the exact change, written against `kaal/core` with the core/D1 and core/D2 fix (#1025) applied, since both touch this test. Apply it after #1025.

## Evidence so far

On Linux with the patch applied: `dist-test/core.test.js` 65 pass, 0 fail; `defects/windows-skills-separator.red.mjs` 2 pass (core/T124 GREEN, core/T125 control). The Windows result is for CI to show after the Change, together with the full source suite.

## Bounds

One line and one import of one existing test. Belongs to Core 0.0.1; does not gate Hosting. After approval, one Change applies the patch and turns core/T124 GREEN unmodified. Any further newly exposed path defect gets its own RED Case. No promotion or publication.
