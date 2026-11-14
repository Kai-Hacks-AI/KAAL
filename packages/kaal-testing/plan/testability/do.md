# Testability Assessment: DO (testing/C60)

`testing/C60` is the DO of `testing/C59` (#1541, approved at 694ac0d).

## What it delivers

- The section "Assessing a test against its claim" in `skills/kaal-testing/SKILL.md`, between "Before writing a test" and "The three loops". Its text is `proposed-skill-section.md`, unchanged.
- The Cases testing/T156 to T160, renamed from `.red.mjs` to `.test.mjs` with no change to their content, run from `test/plan/testability.test.mjs` and added to Testing's `npm test`.
- The trial on the installed text, in `trial/do/`: the key (the pilot 2 key, unchanged), the two prompts, two runs per arm with the raw outputs unedited, the records, and `comparison.json`.

Nothing else of the delivered package changes. No export, Node, Skill, workflow or dependency is added.

## Results

`npm test -w kaal-testing`: 83 passed, 0 failed, including T156 to T160. Before the trial records existed T158 and T159 were RED, and T156, T157 and T160 went GREEN with the section.

The trial, four fresh agents on the installed section (claude-sonnet-5-5):

| Claim | Key | Baseline x2 | Skill x2 |
| --- | --- | --- | --- |
| E1 | deterministic | deterministic, deterministic | deterministic, deterministic |
| E2 | judgment | judgment, judgment | judgment, judgment |
| E3 | pushback, Requirements | same | same |
| E4 | pushback, Architecture | judgment, judgment | judgment, judgment |

`rejectsCase` on E4: baseline false, false; Skill true, true.

What it shows, and what it does not:
- The approach labels do not separate the arms. The one difference is whether the Case is rejected: both Skill runs rejected the T3-style Case as brittle and said to record the author's key beside an independent answer, and both baseline runs judged the criterion but did not reject it. That is the Skill's rule "Reject a brittle Case" taking effect, in two runs.
- E4 differs from the key in all four runs, as in pilot 2, and is recorded as a disagreement. Architecture's key for T3 is untouched, and so is this trial's key.
- E1 was deterministic in all four runs, so the pilots' E1 differences were run-to-run variation, not an effect of the Skill.
- Neither arm differs on E2 and E3. The trial does not show the Skill improves agent quality overall. Its limits are in `comparison.json` and its disagreements are kept.

## Not claimed

No closure of the T3/S4 disagreement. No promotion, publication or collector qualification.
