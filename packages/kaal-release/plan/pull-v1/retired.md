# What the DO of pull/C3 retired

The Script of `pull/C1` is replaced by the v1 capability. [../pull/](../pull/) stays untouched as the record of what shipped.

- **Cases retired with the code they tested:** pull/T1 to T13 and T15 to T17, the old `test/pull/fixtures.mjs`. They tested the six judgments, gap rules and holds, and the use of Show WIP's findings. T14 and T18 belong to the command (`pull/C2`) and are unaffected.
- **Requirements no longer served by the Script:** the review, protection, sequencing and attribution judgments, gap relevance (pull/F19), `readiness.gapRules`, holds, the next-step vocabulary and the `flow` input. v1 serves pull/F21 to F24.
- **Kept:** the recorded real evidence `test/pull/evidence/wire-fallback-template-2026-11-12.json` (now read by T23).
