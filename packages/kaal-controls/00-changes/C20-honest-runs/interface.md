# C20 interface

## Records

A record may carry `handled`, one sentence or a pointer saying what the non-GREEN run was traced to: a defect, a fix, a run that was wrong, a false alarm of the control. Only a record whose outcome is RED or UNKNOWN is read for it. A record carries `by`, who or what ran the Case and wrote the record: a runner, a person, a pipeline. The base record of a `:fail` kind is the control's failure on purpose and is not a run to account for.

## What counts

A record with no non-empty `by` is not counted: the verdict lists it in `unrecorded`. A RED or UNKNOWN record of a Case of the control without `handled` is `unhandled`: the verdict is `UNKNOWN` with reason `unhandled` and lists them in `unhandled`, even when the minimum is met. A record with `handled` is listed in `handledRuns` with its text, counts toward no kind and does not block. The reasons keep their order: `no-minimum`, `no-records`, `unhandled`, `below-minimum`, `met`.

## State line

`demo/CTL1 · claimed running · computed designed · fixture 3/3 · provoked 1/1 fail · UNKNOWN unhandled · 2 unhandled`

## Reference

`references/judging-status.md` gains what a record holds (`by`, `handled`), and one rule the script cannot check: whoever records a run is not whoever wrote the mechanism it runs against or the Cases that run it, and a run is never recorded from memory. It keeps `SKILL.md` within its 600 words.
