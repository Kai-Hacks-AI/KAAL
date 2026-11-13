# C1 proposal

For CPO alignment. Nothing here is implemented.

## 1. The contract of the Skill

| Question | Test | Answer |
| --- | --- | --- |
| Semantics | Would it still be true once the Change is finished and its record deleted? | yes: target-state. No, because it names a from and a to, a step, a migration, a retirement, an "until" or an order of work: change-oriented |
| Concern | Would it still hold if the platform or mechanism that carries it out were replaced? | yes: Solution. No, because it says how the solution is made available, integrated, executed or operated: Delivery |
| Concern | Is it the bounded transition from the baseline to the target? | Change |

Valid pairs: Solution with target-state, Delivery with target-state, Change with change-oriented. Any other is a finding. Rules, in at most 120 lines: split a mixed statement by pair; move a change-oriented statement out of a target element into its Change, and raise a target-state statement found only in a Change to its element; name an ambiguous term and ask; trace target, Gap and one closing Change; keep Solution and Delivery in their own Changes, with a dependency as an edge and never a merge, and a Delivery Change never weakening the Solution contract; classify before planning. Output per statement: its parts, the owning element, the finding and the next move.

## 2. Placement

The Skill is Architecture's: package and Skill `kaal-architecture`, collector `kaal/architecture/classify`. The earlier package of the same name (the URBAN Skill) is parked on `kaal/old/architecture`, is not on `main`, and is not depended on. The ids restart in `architecture/` and are C1, I1, F1 to F3, N1, A1, A2, G1, G2 and T1 to T6.

## 3. Representative classifications

| Statement | Classification | Finding |
| --- | --- | --- |
| "A Change that holds files of two owners that must travel apart is refused, and each offending file is named." | Solution, target-state | none |
| "The verdict is produced by an automated job on every proposed Change into a collector." | Delivery, target-state | none |
| "The judge returns PASS, FAIL or UNKNOWN, and until the replay agrees the old script keeps judging as well." | Solution target-state, and Change change-oriented | mixed: split |
| "The control shall be migrated from the old script to the judge." (as a Solution requirement) | Change, change-oriented | misplaced: move to the Change |
| "So that the local check passes on every machine, it treats UNKNOWN as PASS." (a step of the delivering Change) | Delivery change, and a change of the Solution contract | weakens-solution: refuse; a Solution Change first |

## 4. Verification and the Cases

Comparing recorded answers with a key shows only that the answers match. The evidence that the Skill produces them is a trial that the author did not run, with provenance, so the Cases refuse a trial without it (`trial/` in the DO):

- `skill.prompt.txt` holds the Skill as shipped and the ten statements, and nothing else. Its sha256 is recorded. `skill.raw.txt` is the agent's output, unedited, and the recorded answers must equal it.
- `skill.json` names the observer, who must not be the author, the agent, the model and the date.
- `baseline.*` is the same trial without the Skill. It is recorded and reported, so that what the Skill adds is visible. A baseline that already matches the key is a finding about the Skill.
- A difference from the key is reported, never corrected silently.

Cases: T1 (I1, F1, F2) and T4 (A2, F3) compare the Skill-only answers with the key; T2 (N1) checks size and that no workflow or gate exists; T3 (A1) checks the shell and the key; T5 and T6 close the two Gaps. Negative statements: S4 and S10 (mixed), S5 and S6 (wrong element), S7 (weakening), S8 (ambiguous).

## 5. Smallest PLAN and Change

One PLAN and one Change, architecture/C1, onto one component. Applying the Skill to #1404 is a Change of the Change Isolation capability (`application-1404.md`).
