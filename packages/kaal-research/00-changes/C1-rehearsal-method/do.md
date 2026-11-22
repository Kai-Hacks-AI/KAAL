# C1 DO: rehearsal method

## What was done
- Moved the three scripts (parse, find-rehearsals, judge-rehearsal) from `draft/` into `skills/kaal-research/scripts/`; `draft/` is removed.
- Wrote `skills/kaal-research/SKILL.md` with `references/rehearsal.md` (record fields, when a claim may be `yes`) and `references/example-rehearsal.md`. The Skill is KAAL-agnostic.
- Added `scripts.test` (`node --test test/cases.test.mjs`), `test/cases.test.mjs` and `LICENSE`, as in kaal-retro.
- Ran the rehearsal and recorded it as `02-learnings/rehearsals/RH1/RH1.md` with its evidence.

## Result
- All 5 Cases (T1383 to T1387) GREEN; the Cases keep their ids and are not renamed.
- The Skill passes the Agent Skills standard check.
- RH1 is judged well-formed by the Skill's own judge and listed by the finder.
- RH1 verdict: inconclusive (about effect). Six fresh agent runs, three per arm, blinded honesty judge.
  - Form: skill arm 3 of 3 well-formed, example-only 2 of 3 (one favourable verdict resting on a `partly` claim).
  - Honesty: example-only kept 22 of 24 judged points, skill 19 of 24; none missed in either arm.
  - The example, shared by both arms, carries most of the honesty. The Skill's form advantage comes partly from agents running the judge script themselves.

## Deviations
- The example moved from F1/example/RH1.md into the Skill's references; T1383 reads it from the new path.
- No AGENTS.md at the package root.
- LICENSE added.

## Learnings for later
- The trial setup gave agents an unclear role (5 of 6 unsure).
- The judge script and the blinded judge disagree on r1's overstatement.
- Exposure is agents' self-report, not a trace; the script confound should be separated in a later rehearsal.
