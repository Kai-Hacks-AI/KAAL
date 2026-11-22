# C30 change

The Owner's reading of what the check should be: it is not a judge, it is a check, and the layout must work as "this is inside the specification, this is outside it", so that both what is missing and what is too much are flagged. Testing ran the check over `packages/kaal-testing` at `main` and it said PASS to a folder with seven unnumbered folders and none of the required ones. The Defect is engineering/D4 (recorded by the defect capability, in this folder). This is engineering's answer, to be judged before anything is built.

## The answer in six lines

1. **The check says in or out.** PASS only when nothing is missing and nothing is extra.
2. **Extra means not named.** A tracked file at the root, or a folder, that the template does not name is out. A numbered folder the template does not have was already out; now an unnumbered one is too.
3. **Missing means marked required.** The template marks parts `required`; the check reads the flag. The required parts are the root files `AGENTS.md`, `README.md` and `package.json`, and the folders `10-intent`, `11-requirements`, `12-architecture`, `13-source` and `14-operations`.
4. **The rest is optional on purpose:** `00-backlog`, `01-changes`, `02-learnings`, `15-defects` and `dist` (never committed). A git folder with no tracked file does not exist, so a package with nothing in flight, no retro yet and no defect cannot be faulted for the folders that hold exactly those.
5. **One fault, one finding.** A folder with one fault is FAIL and names that fault and nothing else (as F52 says).
6. **Detective, nothing breaks.** No job runs the check. The first run over all packages is the baseline; a ratchet is a later Change with the Owner's go.

## What this changes in what exists

- The template: `required: true` on the three root files and five folders (data; `package-layout.md` says which and why).
- The check: it reads the flag, and it names a root file or a folder the template does not name. The finding "the folder holds none of the layout's folders" goes, because the missing parts say it.
- F57 said a folder with no `14-operations` is PASS, and F52 said an unnumbered folder is not judged: both are amended by F91. The Cases that pinned those (T1231 and T1243) and one fixture that left out the required folders (T1335) are amended at the DO.

## What happens to the packages that fail

All 14 packages with a `package.json` are FAIL with the draft check, with 10 to 17 findings each (evidence.md). None is in the target layout yet: they hold `skills`, `payload`, `test`, `lib`, the older numbers and so on, and the Owner has not authorized migrating a package. So:

- **Nothing runs the check today.** Only Cases call it, over fixtures, so no pull request, ruleset or job turns red.
- **The first run is the baseline.** `check-layout.mjs <template> <folder>` over each package names the findings per package, as CTL2 says it does. Per CTL2, the ratchet tightens against that baseline: the findings per package, never a count, and a finding once resolved must not come back.
- **The ratchet and any preventive use are later Changes,** each with the Owner's go. This Change adds neither.
- **The ratchet's exit (the Owner, 22 Nov):** when the baseline reaches 0, the ratchet is cleaned up toward plain preventive. The baseline and everything that exists only to carry it are removed, and the check then fails any finding outright. The ratchet Change must state this exit and its Case: a ratchet with no exit is not accepted. This is the same exit as the workflow ratchet's closed baseline at 21/21.
- **Migration is each package's own.** A package moves into the layout when its capability's thread plans it; the check then shows what is left.

## Not in this Change

A job or ruleset for the check, the baseline file, the ratchet, any package migration, the places `engineering/<cap>` and `.kaal/<cap>` (the check judges one folder at a time, and the required root files are for `packages/<cap>`; whether a consumer's data folder shares them is Question 2), the inside of the numbered folders (`10-intent` and the other element folders keep today's rules), and a name change from `judgeLayout` (the Owner's word is "check"; the code name is a symbol and moves nothing).

## Ids

Change engineering/C30, Requirement engineering/F91, gap G120, Cases T1380 to T1382, Defect engineering/D4. They are the next free on `main` and every branch at the time of writing (highest Case seen: T1379; highest Requirement seen: F90); the allocator confirms. The Defect record is the defect capability's file, taken in unchanged.

## DO

Not authorized by this PLAN. After the merged PLAN: edit the template in place, never moving the draft over it (a draft copy goes stale when another collector changes the template, as C29 learned); edit `check-layout.mjs` in place; amend T1231, T1243 and T1335 and F52, F57; rename T1380 to T1382 to `.test.mjs`; say in `package-layout.md` which parts are required; remove `draft/`; run the baseline over the packages and attach it to `do.md`.

## Questions for review

1. Is the required set right: `AGENTS.md`, `README.md`, `package.json` and `10-intent` to `14-operations`? Recommended: yes. `LICENSE` is a publishing need and is left optional here; `00` and `01` are optional because they are temporary and an empty folder is not tracked.
2. Are the same required root files right for `engineering/<cap>` and `.kaal/<cap>`, where the machinery is deployed and the content is the consumer's? Recommended: this Change covers `packages/<cap>` and the check is told the place later (one more flag, YAGNI until a consumer folder is checked).
3. Which root files beyond the template are allowed? Seen in packages today: `.gitattributes`, `.gitignore`, `tsconfig.json`, `contract.json`, `installation.kaal.json` (matches `*.kaal.json`), `concluding-act.md`. Recommended: allow none beyond the template now; they are findings in the baseline, each removed or named when its package migrates, so the template does not grow to bless whatever exists.
4. Should the in-flight Change folders (`00-changes` and the older numbers) be named as legacy and accepted? Recommended: no. They are out of the specification and the baseline shows them.

## ACT

The retro of the collector that carries this Change, in kaal-retro's contract.
