# C12 change

## PLAN

1. Add I7, F19, F20, F21, F22, F24, N7, N8 and A10 under `packages/kaal-controls/`, F23 and A11 under `engineering/controls/`, with their Cases T770 to T779 and the gap G89. The Cases are `T<n>.red.mjs`.
2. Observe the expected RED against `main` (`evidence.md`).
3. State the route to `main` (`promotion.md`).
4. The PLAN adds no finder change, no check, no control item and no Skill text, and cites nothing that is not on `main`.

## Boundary

Product defines, Engineering deploys. The Skill and its scripts are setup-agnostic (N8): the directory to check is the only input, and everything specific to KAAL is Engineering's. In the product, scripts live in the Skill's `scripts/` folder and judgment help in its `references/` folder. The package holds the rule, the diagnostics and the recovery. `engineering/controls` runs the package's check and holds the migration guidance, never a second copy of the rule (T779). T777 proves the package boundary with fixtures of its own. T778 proves the Engineering boundary on the controls that exist in `engineering/` when it runs.

## DO

Not authorized by this PLAN. On the merge of this PLAN into the collector, which is the go for the DO:

1. Product. Add `status` to the finder and list every control with `rank`, `valid` and `problems` (A10, F20). A control the finder refused before stays listed and fails validation. Add `scripts/check-controls.mjs` (F21, F22) with `checkControls`, `DIRT` and the command. Add the `status` line, the four values in order, their cumulative meaning and the check command to `references/declaring-controls.md`. Add `references/judging-status.md` (F24): what to look at, what evidence and what leaves a claim unresolved, for each of the four. `SKILL.md` points at both and keeps its word cap.
2. Product. Give the Cases of C8 and C9 that build a control (T470 to T479, T530 to T536) a `status`, so that their controls are valid. The Cases that assert an incomplete item is refused or not listed are changed to assert that it is listed and fails validation, and the text of F13, F14, F16 and F17 points at F20 for that.
3. Engineering. Add `engineering/controls/03-architecture/A11-check-deployed/migration.md`, which points at the product check and reference and tells an owner to choose the status the evidence supports. It never offers a default value.
4. Existing declarations. The finder on `main` refuses a `status` field, so `release/CTL1` and `release/CTL2` cannot get their line before the finder. After it, a control without a status stays listed and fails validation, so no mass update of other controls is a prerequisite. The Cases of release read `refused`, and a control that fails validation is in it, so the two lines go in with the DO to keep them green. Release adds the one `status:` line to each, either in the DO pull request or in a pull request of its own that is merged into the collector together with it. T540 and T600 compare those files with their PLAN drafts, so they ignore the `status:` line, with a comment that the draft predates the mandatory status. No other control is edited here, and the check holds no list of them (F22).
5. Rename the Cases from `T<n>.red.mjs` to `T<n>.test.mjs` when they are green.

## ACT

1. A 4L retrospective of the Change, delivered to `main`.

## Left open

- Controls on other collectors (CTL3 to CTL9) declare their `status` when they next sync with `main`. Until then the finder lists each one, the check names each missing status with the recovery, and nothing is invented. The Engineering Case reports them visibly when it runs.
- The Skill points at the `kaal-testing` Skill for what verification and validation mean. That is another Skill, not the repository, and it is left as it is.
- Whether a claimed status is true is decided by evidence the owner can show (controls/F12), judged with the help of the Skill (F24), not by the check.
- Running the check on GitHub, requiring it, or any enforcement are separate Changes and are not authorized here.
