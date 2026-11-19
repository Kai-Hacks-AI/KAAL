# C1 change

## PLAN

1. Add the gap G114, the Intent I1, the Requirements F1 to F3 and N1 and the Architecture A1 under `packages/kaal-defect/`. Their Test Cases T1210 to T1214 sit beside the element they test as `T<n>.red.mjs`.
2. Observe the expected RED against `main` (`evidence.md`) and show that each Test Case can pass on a throwaway copy that holds `draft/`.
3. The PLAN adds no package file: no `package.json`, no Skill, no script. `draft/` holds the intended Skill and check for review only.

## Ids

Proposed, to be confirmed by the allocator: Change defect/C1, Intent defect/I1, Requirements defect/F1 to F3 and N1, Architecture defect/A1, Test Cases T1210 to T1214, gap G114. They skip the ids the parked engineering Change holds (T1171 to T1179, G113).

## What a Defect is

- A Defect is a negative Requirement: what must not be the case, raised from the side. Its root sits beside Intent, not under it.
- The route is Finding, then Test Case, then Defect, then a Change or a HOTFIX. A Finding that no Test Case proves is not yet a Defect.
- The edge is Test Case verifies Defect. A Defect lists no Test Case. A `tests` list on a Defect is a copy of that edge and is not read.
- Identity is `<capability>/D<n>`, counted per capability. The record stays with the context that raised it; Architecture may place it elsewhere (see kaal-architecture) and never moves it.

## What kaal-defect owns, and does not

Owns: the definition, the identity rule, and the check below. Testing owns the Test Case and the run (see kaal-testing). Release owns the HOTFIX that needs one Defect with a Test Case RED on main and GREEN on the hotfix branch (see kaal-release). Requirements owns the Requirement the Defect negates.

## The check

`check-defects.mjs <dir>` reads Defect records and Test Cases in a tree. A Defect with no Test Case that names it in `tests` is `unproven`; a Defect id that does not fit `<capability>/D<n>` is `invalid`. Any such finding makes it exit 1. It reads the Test Case side only. It does not run a Test Case and so does not judge RED on main; that needs run records and is left open.

## DO

Not authorized by this PLAN. On the merge of this PLAN into the collector, which is the go for the DO: add `package.json` (private until published by the Owner's go), the Skill and the check as in `draft/`, and rename the Test Cases to `.test.mjs` when they are green. No control is registered and nothing is published.

## ACT

A 4L retrospective in `act.md` before the promotion.

## Left open

1. **RED on main.** Judging that a Defect's Test Case is RED on main and GREEN on the fix needs run records. It belongs to a later Change that uses kaal-testing's records.
2. **Hosting's `tests` lists** (hosting/D5 to D14) copy the edge. A later Hosting Change migrates them; this Change does not touch Hosting and the check does not depend on them. Hosting's records are found because they name the id, not because of the list.
3. **Registration.** Registering Defect as a kind in Core (see kaal-core) and a control for the check (see kaal-controls) are separate Changes.
4. **Where records live.** Existing records stay where they are. A folder rule is not set here.

## Not in this Change

No control, no Core kind, no workflow, no edit to Hosting, Testing, Release or the hotfix template, and no publication.
