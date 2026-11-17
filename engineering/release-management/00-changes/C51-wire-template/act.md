# C51 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The WIRE template kept its envelope cue and its three chapters and gained only the HOW TO WORK chapter, so the change is one added table. T680 to T683 went from RED to green with `05-src/wiring/templates/wire.md`. The rows describe only the WIRE process: the approved artifact is on main, the Worker installs it byte for byte and never develops, the Reviewer checks the Source, the Case and the diff, and for a changed ruleset file the Owner loads it beside the old, runs both and retires the old.

## Learned

An existing Case can be the real cost of a template change: T281 of release/C27 expected exactly three chapters and read the draft of its own Change, so the DO had to amend it to four chapters and point it at the draft of this Change, in the same PR as the template. Planning that amendment in the PLAN, and testing it as T683, kept it from being a surprise. The Owner's remark during review, that each template should describe only its own process, applies here too: this table names no other template and no other process.

## Lacked

A check that an installed `.github` file still equals its source after a WIRE. The Case compares the draft with the source, and the WIRE's own Verification chapter holds the byte-for-byte comparison, but nothing watches it afterwards.

## Longed For

The promotion of this collector, and the Owner's decision on when and with what scope the template is installed.

## Follow-ups

- Promote C51 in the CPO's order.
- Apply the Owner's decision on how much the other templates may say about processes outside their own, if one is made.
