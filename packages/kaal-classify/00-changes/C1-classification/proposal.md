# C1 proposal

For CPO alignment before any Skill is written. Nothing here is implemented.

## 1. The contract of the Skill

The Skill answers two independent questions for each statement and places the result.

| Question | Test | Answer |
| --- | --- | --- |
| Semantics | Would it still be true once the Change is finished and its record deleted? | yes: target-state. No, because it names a from and a to, a step, a migration, a retirement, an "until" or an order of work: change-oriented |
| Concern | Would it still hold if the platform or mechanism that carries it out were replaced? | yes: Solution, what must exist or behave. No, because it says how the solution is made available, integrated, executed or operated: Delivery |
| Concern | Is it the bounded transition from the baseline to the target? | Change |

Valid pairs: Solution and target-state, Delivery and target-state, Change and change-oriented. Every other pair is a finding.

Decision rules, in the Skill's own words, at most 120 lines in all:

1. **Mixed.** If the parts of a statement answer differently, split it into one statement per pair. Do not classify by the dominant part.
2. **Misplaced.** A change-oriented statement inside a Solution or Delivery element moves to the Change as a temporary requirement with an end condition. A target-state statement that exists only in a Change is raised to the target element, and the Change refers to it by id.
3. **Ambiguous.** A term that can mean two concerns is named and put to its author. It is never guessed.
4. **Trace.** Target element, Gap, one closing Change. A parent is done only when its children are done.
5. **Independent.** Solution and Delivery travel in their own Changes. A dependency is an edge, not a reason to merge. A Delivery Change cannot weaken or redefine the Solution contract it delivers: it leaves the Solution's requirements, verdicts and Cases unchanged, and if it seems to need otherwise, a Solution Change lands first.
6. **Order.** Requirements, classification, target-state placement, gap identification, Change planning. Challenge before the plan.

Output per statement: its parts as concern and semantics, the element that owns each, the finding and the next move.

What it does not do: no metamodel, no workflow, no process, no gate in CI, no new id kind. It reuses Intent, Requirement, Architecture, Gap, Change and Case.

## 2. Placement, and the one question for the CPO

The Skill belongs to Architecture, which owns functional placement. Two homes are possible.

| Option | For | Against |
| --- | --- | --- |
| A. A new package `kaal-classify`, shaped like `kaal-controls`, own collector `kaal/architecture-classify` cut from `main` | No dependency on anything off `main`; one small Change; the same method as `kaal-controls`, which is on `main` | A second Architecture-owned Skill beside the URBAN Skill |
| B. A second Skill inside `kaal-architecture` | One Architecture package | That package is on `kaal/architecture`, 91 commits from `main`, in the older nested layout, and its Skill is already named `kaal-architecture`. The Skill could not land before that collector is brought to `main` |

Recommendation: A, and fold the two Skills together in a later Change if the CPO wants one package. The collector name cannot be `kaal/architecture/classify`, because `kaal/architecture` exists as a branch. The name `kaal-architecture` for the new Skill is not available for the same reason, so it is named `kaal-classify`; the CPO may choose another.

Ids are claimed in a new namespace, `classify/`: C1, I1, F1 to F3, N1, A1 to A3, G1 to G3 and T1 to T11. No other capability's id is used.

## 3. Representative classifications

The key holds ten. Five show the range.

| Statement | Concern and semantics | Finding |
| --- | --- | --- |
| "A Change that holds files of two owners that must travel apart is refused, and each offending file is named." | Solution, target-state | none |
| "The verdict is produced by an automated job on every proposed Change into a collector." | Delivery, target-state | none |
| "The judge returns PASS, FAIL or UNKNOWN, and until the replay agrees the old script keeps judging as well." | Solution target-state, and Change change-oriented | mixed: split in two |
| "The control shall be migrated from the old script to the judge." (written as a Solution requirement) | Change, change-oriented | misplaced: move to the Change |
| "So that the local check passes on every machine, it treats UNKNOWN as PASS." (a step of the Change that delivers the check) | Delivery change, and a change of the Solution contract | weakens-solution: refuse; a Solution Change first |

## 4. The Cases

Each requirement and each Gap has a Case that is RED until the Skill and its recorded trial exist (`evidence.md`).

- Cases T1 to T4 judge the recorded answers of an agent that was given only the Skill, against the key, for the statements that each requirement concerns.
- T5 checks that the Skill is at most 120 lines and that the package carries no workflow or gate. T6 and T7 check the package shell and the Skill.
- T8 checks the key itself: each valid pair alone, at least four negative statements, and the mixed, misplaced, weakens-solution, ambiguous and dependency findings each at least once.
- T9 to T11 close the three Gaps.

Negative Cases for mixed concerns are S4 and S10 (two pairs, which must be split), S5 and S6 (the right content in the wrong element), S7 (a Delivery step that weakens the Solution) and S8 (an ambiguous term, which must not be guessed).

## 5. Smallest PLAN and Change

One PLAN (this one) and one Change, `classify/C1`, onto one component, the Skill package. Its DO authors the Skill and records the trial, and its ACT is the 4L retrospective. Applying the Skill to #1404 is a separate Change of the Change Isolation capability (`application-1404.md`).
