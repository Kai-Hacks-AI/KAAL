# C22 change

## PLAN

1. Add the gap G99, the Requirement F35 and the Case T1115 (plain `.test.mjs`, RED on the collector on its own assertions).
2. Keep the trial bundles (`trial-clean/`, `trial-j3/`) and the four mutation patches with their runner and their run on the final head of C21.
3. State J3 as two statements (`judgments.md` addendum below) and plan the end-to-end exercise.
4. No script, Skill word or workflow changes in the PLAN.

## DO

Not authorized by this PLAN. On its merge into the collector:

1. `judge-mode.mjs` command: read the input files inside a handler; unreadable or malformed input gives `{"verdict":"UNKNOWN","blocked":true,"reason":"unreadable-input"}` or `"malformed-input"` as JSON and exit 2.
2. The end-to-end exercise: a short script-free protocol in `exercise.md`, run with fresh read-only agents (memory off): accept an improvement, write the advanced baseline from `next`, judge the next candidate with that baseline as `previous`, and a rollback attempt. Its result is recorded as it is.
3. Re-run `mutations/run.sh` on the DO's head and record GREEN, the loaded mutation and the failing assertion.
4. Ask Testing to restate J3 in two statements at the DO's head.

## ACT

A short addition to the retro `controls/RT1`, in the collector, naming what was learned from the CRO assessment.

## J3, in two statements

- *Responsibility placement in the design*: satisfied by inspection of A20, `interface.md`, `modes.md` and F34 item 7.
- *Agent application of that placement*: partly evidenced by `trial-j3/`: reference from the base, the candidate-controlled baseline trap and the blocking conclusion, 6 of 6; comparison by a script, enforcement, stable names, 6 of 6; mode-switch ownership 4 of 6; persisting the next baseline 0 of 6; no difference between the arm with the Skill and the arm without it.
