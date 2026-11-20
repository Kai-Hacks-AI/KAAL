# C48 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The control was written as a detective report per stage, required by no ruleset, so the Change stayed small and could not lower any protection. The review rounds removed every `required_status_checks` change from the PLAN, and Case T581 now proves that no ruleset source names the control. The adapter stays a thin step that turns the action's outcome into a report.

## Learned

A review verdict that names the files still to correct has to be applied everywhere at once: I removed the ruleset key from one file and missed three others, which cost a round. A scanner flags a pattern built from text, so Case T581 compares plain lines. Detective and preventive are two controls with two Owner decisions; mixing them in one Change blocks both. One clean run of a workflow is no evidence for retiring `dependency-review.yml`.

## Lacked

A real merge-queue run: T583 stays RED until the promotion and a WIRE install the workflow and `acceptance.md` records a run URL. The CTL item for the control, which waits for controls/C9 and C10 on main. A way to read the old workflow and the new one side by side for equivalence.

## Longed For

The workflow installed under `.github/workflows/` through a WIRE, with a recorded run per target route, a finding case, a clean case and the merge queue. The old `dependency-review.yml` retired only after that evidence. A separate preventive control, if the Owner decides one.

## Follow-ups

- Promote the collector, then WIRE `wire/analyze-vulnerabilities`.
- Record a merge-queue run in `acceptance.md` and turn T583 green (G71).
- Add the CTL item once controls/C9 and C10 are on main.
- Retire `dependency-review.yml` only after the equivalence evidence.
