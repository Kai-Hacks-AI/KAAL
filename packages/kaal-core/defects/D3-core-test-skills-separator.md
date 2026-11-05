# core/D3: a Core test excludes Skill files with a "/skills/" fragment that no Windows path contains

Owner: Core. Raised on 4 November 2026 from the Windows full-suite run on the core/D1 and core/D2 fix (#1025, run 41787432234): the CPO required that any newly exposed path defect get its own RED Case. Classified by Core as a Core defect, a test that assumes the POSIX separator.

## Record

```json
{
  "id": "core/D3",
  "context": "core (tests)",
  "expected": "The identity test reads every typed Node of the repository and skips the Skill files, on any supported host.",
  "observed": "On Windows the Skill files are not skipped: skills\\kaal-core\\SKILL.md has no type, the legacy frontmatter pattern does not match it, and the test fails with 'object null is not iterable'.",
  "where": "packages/kaal-core/test/core.test.ts:222, in 'keeps the id, name and type of every Node in this repository…'",
  "status": "confirmed",
  "tests": ["core/T124"]
}
```

## Observed and cause

`readdirSync(…, { recursive: true })` returns entries with the host separator. The filter `!p.includes("/skills/")` therefore matches nothing on Windows, and `SKILL.md` files (frontmatter `name:` then `description:`, no `type:`) are handed to the pattern that expects a typed Node, which returns `null`. This is the "further Windows path assumption" the amendment PLAN of core/D1 and core/D2 named as a known limit. core/T125 shows the separator fact.

## Case

| Identity | Role | File |
| --- | --- | --- |
| core/T124 | the RED Case: test/core.test.ts tests no directory entry against a "/" fragment | [windows-skills-separator.red.mjs](windows-skills-separator.red.mjs) |
| core/T125 | control, passes today | same file |

**Answered** only by a Run in which core/T124 passes, unmodified, in the Change that fixes the line, with core/T125 still passing and the Windows full suite green.

## Bounds and correction

Not a blocker for Hosting 0.0.1. Correction (a separate Change, through `kaal/core`): test the entry's segments, for example `!p.split(sep).includes("skills")`, with `sep` imported from `node:path`. It changes one line of an existing test, so it needs an approved bounded amendment PLAN first. This record changes no test, script or package.
