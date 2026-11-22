# C21 interface

## Modes

A station mode is one of three. It says what the control does with the answer of its check at that station:

| Mode | The answer is | Blocks |
| --- | --- | --- |
| detective | reported | nothing |
| preventive | enforced: any finding stops the action | the action |
| ratchet | enforced against a baseline: a finding not in the baseline stops the action | what is new |

A control's type is its design and stays. A control of type preventive can run detective at a station while it is being tried, and that is how it is claimed: it reveals and does not prevent.

A control that has a ratchet at any station declares `exit`, one sentence saying what it becomes when its baseline is empty. A control with a ratchet and no `exit` is listed with the problem `a ratchet has no exit`.

## What the check gives

One answer: in or out of its specification, with the findings, each a name that stays the same from run to run. A finding is either something missing or something too much. A check that could not judge gives no findings list at all, and that is unknown, never a pass. A finding that changes its name between runs cannot be ratcheted: that is the adopter's to keep stable.

## The ratchet contract

A baseline is the allowance, the findings that are known and tolerated. Three things are held across accepted runs, not within one run:

1. **Preservation.** The baseline of a run holds nothing that the reference baseline, the one last accepted, did not hold. A baseline only shrinks.
2. **Advancement.** After an improvement the allowance for what was resolved is gone. The baseline of a run is exactly the reference baseline minus what is no longer found: `previous ∩ findings`. A baseline that still holds a finding no longer found is a stale allowance, and it fails, because it would excuse that finding if it came back.
3. **Uncertainty.** A run that cannot show its reference, or whose reference cannot be compared, is unknown and blocks. Missing evidence is never success.

What comes of these: a finding resolved and removed from the baseline blocks as new when it returns, and putting it back into the baseline is growth and fails. The first baseline of a ratchet is the first accepted state, taken from the owner's decision; at adoption the reference is that baseline itself.

### Who does what

| Task | Owner |
| --- | --- |
| Getting the reference baseline: which accepted state it is read from | the adopter |
| Running the check and keeping finding names stable | the adopter |
| Comparing: preservation, advancement, uncertainty, and what blocks | `judge-mode` (this Change) |
| Computing the baseline the next run must hold (`next`) | `judge-mode` (this Change) |
| Writing that baseline where the adopter keeps it | the adopter |
| Making the verdict stop an action, and where | the adopter |
| Deciding when a station moves from one mode to the next, and who may | the adopter |

### What an adopter inherits and what it supplies

It inherits the comparison and the transition rule, shown by Cases T1109, T1112 and T1113 and by the sensitivity record of the CHECK, and the judgments J1 to J5 of this Change. It supplies its own evidence for: that its findings are the ones that matter and keep their names, that the reference it reads is the accepted one, that the verdict is wired to stop the action it is meant to stop, that nothing else can write the baseline, and the authorization to switch mode.

## The script

`scripts/judge-mode.mjs` exports `judgeMode({ mode, findings, baseline, previous })` and runs as a command over JSON files: `node judge-mode.mjs --mode <mode> --findings <file> [--baseline <file> --previous <file>]`. It prints the verdict as JSON and exits 0 when nothing is blocked, 1 when the action is blocked and 2 when it could not judge.

| Mode | Verdict | Blocked | Also says |
| --- | --- | --- | --- |
| detective | `REPORT` with findings, `PASS` without | never | |
| preventive | `FAIL` with findings, `PASS` without | with findings | |
| ratchet | `FAIL` with a new finding, a baseline that grew or a stale allowance; `PASS` otherwise | on `FAIL` | `known`, `new`, `stale`, `grew`, `reasons`, `next` (the baseline the next run must hold), `spent` and `then: 'preventive'` when the baseline is empty |
| ratchet, no findings list | `UNKNOWN`, reason `could-not-judge` | yes | |
| ratchet, no reference | `UNKNOWN`, reason `no-reference` | yes | |
| ratchet, a reference or baseline that is not a list of distinct names | `UNKNOWN`, reason `incompatible-reference` | yes | |
| any other mode, findings not given | `UNKNOWN` | in preventive | |

## Reference

`references/modes.md`: what a ratchet is, how it ends (the exit), that its type stays preventive and only the mode differs, that a claim follows the mode, and what an adopter supplies. `SKILL.md` gains one pointer line. No instructions file is added by this Change.
