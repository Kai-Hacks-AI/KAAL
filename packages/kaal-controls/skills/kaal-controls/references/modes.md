# Modes of a check

A check gives one answer: the thing is in its specification, or it is out. An out answer names what is missing and what is too much, as findings, each a name that stays the same from run to run. A check that could not judge gives no answer, and that is unknown, never a pass.

What the check does with its answer is its mode:

- **Detective** reports the findings and blocks nothing.
- **Advisory** warns where the author is acting and blocks nothing.
- **Preventive** blocks the action when there is any finding.
- **Ratchet** is preventive against a baseline: it blocks only a finding that is not in the baseline. Its purpose is to raise the target step by step, never to allow more.

The type of a control is its design and does not change with the mode. The claim does: only a preventive or ratchet mode may be said to prevent, a ratchet only what is new. A detective or advisory mode reveals; say that, and not that it protects.

## The ratchet

The baseline is the allowance, the findings known and tolerated. It is held across accepted runs against a reference, the baseline last accepted:

1. **Preserve.** The baseline holds nothing the reference did not hold. A baseline only shrinks.
2. **Advance.** The baseline is the reference minus the findings no longer found. An allowance kept for a finding that is gone would excuse it when it came back, so it fails. A finding that was resolved and returns is new and blocks; adding it back to the baseline is growth.
3. **Unknown blocks.** With no reference, a reference that cannot be compared, or a check that could not judge, the answer is unknown and blocks. Missing evidence is never success.

A ratchet states its exit: what it becomes when its baseline is empty, normally the plain preventive check, with the baseline removed. A ratchet with no exit is not accepted.

`scripts/judge-mode.mjs` does the comparison: `node judge-mode.mjs --mode <mode> --findings <file> [--baseline <file> --previous <file>]`, JSON lists of names in, a verdict out (`PASS`, `REPORT`, `WARN`, `FAIL`, `UNKNOWN`), exit 0 when nothing is blocked, 1 when blocked, 2 when it could not judge. It also gives the baseline the next run must hold.

## What it leaves to you

The script compares. You supply: which accepted state the reference is read from, stable finding names, writing the next baseline where you keep it, making the verdict stop the action, who may change a mode, and the evidence for each of these.

## Questions to ask of a check you find

What is its answer, and does it flag both what is missing and what is too much? Which mode does it run in here? What does it stop, and for whom? If it is a ratchet: what is the baseline, where is the reference read from, and what is its exit?
