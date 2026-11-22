# Ratchet

A ratchet is a temporary, special way of running a preventive control. It is not a fifth type: the type of a control is its design, and a ratchet is a mode it operates in for a while. Use it when a rule is right but the thing it governs does not meet it yet, so blocking everything now would stop all work.

## What a ratchet is

A check gives findings: what is missing and what is too much, each a name that stays the same from run to run. A ratchet records the findings that exist today as an allowance, the baseline, and then:

1. **No new regressions.** A finding that is not in the baseline blocks. A finding in the baseline passes.
2. **The allowance only shrinks.** The baseline holds nothing the last accepted baseline did not hold.
3. **Resolved means removed.** The baseline is the last accepted baseline minus the findings no longer found. An allowance kept for a finding that is gone would excuse it if it came back, so it fails. A finding that was resolved and returns is new and blocks; putting it back into the baseline is growth.
4. **Unknown blocks.** With no accepted baseline to compare to, one that cannot be compared, or a check that could not judge, the answer is unknown and blocks. Missing evidence is never success.

A claim follows the mode: a ratchet stops what is new and nothing else. It does not say the rule holds. "New" means a finding name not in the baseline: a known finding that gets worse under the same name passes, so make finding names fine enough to matter.

The rule is strict on purpose: a change that resolves a finding must also remove its allowance in the same change, otherwise the stale allowance fails.

## Keep it removable

Build the ratchet as a filter in front of the verdict, not inside the check. The check stays pure and only emits findings. The ratchet step subtracts the allowance from those findings and keeps the allowance honest; what remains is judged like any preventive check. With an empty baseline the filter removes nothing, so it is an identity. Ending the ratchet is then deleting the filter step and the baseline, and the check and its Cases are not touched. `applyBaseline` in `scripts/judge-mode.mjs` is that filter. Use it only with the verdict that also blocks on a grown baseline, a stale allowance and an unknown answer, not on what remains alone: a grown baseline leaves nothing remaining and would pass. `judgeMode` does this.

## How it ends

A ratchet is temporary and says how it ends. When the target is achieved and the baseline is empty, remove the baseline and everything made only for the ratchet, and continue as an ordinary preventive control. A ratchet with no stated exit is not accepted (only its presence is checked, once per control, and nothing forces the ratchet to end, so someone must notice an empty baseline): declare `exit:` as one sentence on what the control becomes when its baseline is empty.

## The script

`scripts/judge-mode.mjs` does the comparison: `node judge-mode.mjs --mode <detective|preventive|ratchet> --findings <file> [--baseline <file> --previous <file>]`, JSON lists of names in (`previous` is the last accepted baseline), a verdict out (`PASS`, `REPORT`, `FAIL`, `UNKNOWN`), exit 0 when nothing is blocked, 1 when blocked, 2 when it could not judge. Treat 2 as a stop, and a missing or malformed input file as a stop. For a ratchet it also gives the baseline the next run must hold, and says when the baseline is empty and the control becomes preventive.

You supply the rest: where the last accepted baseline is read from, stable finding names, writing the next baseline, making the verdict stop the action, who may change the mode, and the evidence for each.
