# C21 interface

## Modes

A station mode is one of four. It says what the control does with the answer of its check at that station:

| Mode | The answer is | Blocks |
| --- | --- | --- |
| detective | reported | nothing |
| advisory | shown as a warning where the author is acting | nothing |
| preventive | enforced: any finding stops the action | the action |
| ratchet | enforced against a baseline: a finding not in the baseline stops the action | what is new |

A control's type is its design and stays. A control of type preventive can run detective at a station while it is being tried, and that is how it is claimed: it reveals and does not prevent.

A control that has a ratchet at any station declares `exit`, one sentence saying what it becomes when its baseline is empty. A control with a ratchet and no `exit` is listed with the problem `a ratchet has no exit`.

## What the check gives

One answer: in or out of its specification, with the findings, each a name that stays the same from run to run. A finding is either something missing or something too much. A check that could not judge gives no findings list at all, and that is unknown, never a pass.

## The script

`scripts/judge-mode.mjs` exports `judgeMode({ mode, findings, baseline, previous })` and runs as a command over JSON files: `node judge-mode.mjs --mode <mode> --findings <file> [--baseline <file> [--previous <file>]]`. It prints the verdict as JSON and exits 0 when nothing is blocked, 1 when the action is blocked and 2 when it could not judge.

| Mode | Verdict | Blocked | Also says |
| --- | --- | --- | --- |
| detective | `REPORT` with findings, `PASS` without | never | |
| advisory | `WARN` with findings, `PASS` without | never | |
| preventive | `FAIL` with findings, `PASS` without | with findings | |
| ratchet | `FAIL` with a finding not in the baseline or a baseline that grew, `PASS` otherwise | on `FAIL` | `known` (in the baseline), `new`, `resolved` (in the baseline, no longer found: to be removed), `spent` and `next: 'preventive'` when the baseline is empty |
| any, findings not given | `UNKNOWN` | in preventive and ratchet | |

`previous` is the baseline of the last run. A baseline holding a finding that `previous` does not is a baseline that grew: it only shrinks, so that is `FAIL` with reason `baseline-grew`. A finding that was resolved and removed from the baseline and appears again is new.

## Reference, instructions file

`references/modes.md`: the four modes, that the type stays, that the claim follows the mode (only preventive and ratchet may be said to prevent, and a ratchet only what is new; detective and advisory only reveal), what a ratchet must state as its exit, and the questions an agent asks of a check it finds. `SKILL.md` gains one pointer line. `AGENTS.md` at the package root, which `files` ships beside `skills`, says in a few lines when to read the Skill and where it is, and repeats none of it.
