# C37 ACT: retrospective (4L)

Written by the agent that carried the Change.

## Liked

- One judge, two places: the local script is eight lines that run the same `judge.mjs` for Developing, so the local check and the CI check cannot drift.
- Declaring the `.githooks` tree as an exact list (sha256 or source, mode) made every departure a one-line finding, and the Owner's chain of challenges (each stage names what an earlier one should have caught) fell out of one extra required check in `integrating`.

## Learned

- The Owner's first correction (a neighbour must not judge `.githooks`) was cheaper at the PLAN than in the code: the Wiring job already stood without it, so the move only added a job.
- A check that judges the real tree is red until its own install lands. The WIRE therefore comes before the workflow, and the Case that reads the real tree (T518) ships RED with the DO and turns GREEN with the WIRE.
- File modes are not reliable on Windows checkouts, so the mode comparison is skipped there; the sha256 comparison always runs.

## Lacked

- Evidence that a hook actually ran before a push: the check proves installation and integrity of the declared tree, not execution (CPO interpretation at the PLAN). A later Change may add it.
- The `post-checkout` hook, the earliest local point, needs a second dispatcher file.
- Level 2 and 3 (live equals source) as a standalone test.

## Longed For

- The WIRE of the local script, then the `Developing` entry in the workflow, then the Owner's update of the live `integrating` ruleset.

## Follow-ups

- `post-checkout` self check (own Change); execution evidence of the hooks at Integration (own Change); the standalone live-versus-source test for rulesets.
