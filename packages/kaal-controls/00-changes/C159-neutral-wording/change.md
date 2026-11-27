# C159 change

## PLAN

1. Add the Case T1574 under controls/N8 (plain `.test.mjs`, never renamed). It finds the package root itself (the folder with `package.json` above it), so it works in any checkout, and it reads every `.mjs`, `.md`, `.json` and `.yml` file of the Skill. It fails on a hosting term (`pull request`, in any spelling) and on the form of a Change id (`<capability>/C<n>`). It is RED on the collector (nine lines in five files) and was run GREEN against an uncommitted throwaway rewording, with the package suite GREEN.
2. Amend controls/N8 by one sentence: the Skill names no hosting term and no Change id form, and says "change under review" where it means the change a check judges.
3. No script, Skill word or record change in the PLAN.

## DO

Not authorized by this PLAN. On its merge into the collector, and with the collector synced with main:

1. Reword the nine lines: "pull request" becomes "change under review" in `ratchet.mjs`, `demand-record.mjs`, `enforcing-controls.md` and `declaring-controls.md`, and the sentence naming the Change id form says that a change identifier is not a control id.
2. Comments and reference text only. No identifier, input name, output name, flag or behavior changes.
3. T1574 GREEN; the package suite GREEN. A mutation, as in C25 and C157: one `pull request` put back into a script comment and one Change id form put back into a reference, each alone turns T1574 RED.

## DO record

Ten places are reworded: "pull request" becomes "change under review" (or "it", where the sentence reads better) in `ratchet.mjs` (three comments), `demand-record.mjs` (two comments), `enforcing-controls.md` and `declaring-controls.md` (the evidence example, which also read "a real merge or pull request"), and the sentence that showed the Change id form now says that a change identifier is not a control id. Comments and reference text only: no identifier, input or output name, flag or behavior changes, and the `pr` input name of `findRecordDue` stays (design question 1). T1574 is GREEN and the package suite (116 tests) is GREEN. `mutations/` keeps four weakenings as exact patches with a runner, as in C25, C155 and C157: a hosting term back in a script comment (M1), in a reference (M2), a Change id form back in a reference (M3) and the snake spelling of the hosting term (M4). `mutations/run-at-do-head.txt` is the run on the DO: the baseline is GREEN and each weakening, loaded alone, is RED, and the runner stops if a patch does not apply. The record cannot name its own revision; re-run `sh mutations/run.sh <repo root>` at the DO's head and compare with it.

## ACT

A retro entry in the collector.

## Design questions, with recommendations

1. **The input name `pr` of `findRecordDue`.** It abbreviates "pull request" and is an input name that Release's runner passes. Recommend leaving it in this Change: renaming it is a change of interface and belongs with Release's caller in its own Change (`change` is the neutral name). The Case does not forbid the two letters.
2. **The station names.** `Developing`, `Collecting`, `Integrating`, `Hotfixing`, `Wiring`, `Promoting` and `Publishing`, and the example `stations: [Integrating:preventive]`, are KAAL's vocabulary inside the Skill. Recommend they move with the split of the CTL declarations from KAAL's stations and flags, which is the next alignment Change, so that this one stays wording only.
3. **Where the Case lives.** Under N8, which already says the Skill is setup agnostic, rather than a new Requirement. It is the package-relative form that the later Cases follow.
