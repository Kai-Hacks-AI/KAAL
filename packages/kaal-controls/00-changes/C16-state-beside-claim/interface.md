# C16 interface

## Functions

`computedState(control, verdict)`: `invalid` when the control is not valid, `tested` when the verdict is PASS, else `designed`. Implemented and running are never computed.

`stateLine(control, verdict)`: one line, `<id> · claimed <status> · computed <state> · <kind> <have>/<runs>[ fail] ... · <VERDICT> <reason>`, in the order the control declares its kinds.

## Command

`evidence.mjs <directory> [--records <path>] [--json]` prints a line for each control that declares `evidence`, whatever its status. `--json` prints the verdicts as before. Exit 1 only when a control claims `tested` and its verdict is not PASS.

## Example

`demo/CTL1 · claimed running · computed designed · fixture 2/3 · merge 1/2 · provoked 0/1 fail · UNKNOWN below-minimum`

## Reference

`judging-status.md`: the computed state is what the evidence shows; the claim stays a claim. No new line in `SKILL.md`.
