# Enforcing admission: architecture

The support engine consumes the KAAL rule through one narrow seam: two directories in, an exit code out.

```
lineage branch's .kaal ─┐
                         ├─→  check-kaal-admission  →  exit 0 admitted / 1 refused (reasons)
proposal's .kaal ────────┘
```

## The control

`contain-change.sh <target-ref>` extracts the target's `.kaal` into a temporary directory (an empty one when the target has none), takes the current checkout's `.kaal` as the candidate, runs `npm run check-kaal-admission` over the pair, and exits with its status. A job in the controls workflow named `contain-change` runs `contain-change.test.sh` first and then the script, for proposals whose base is a lineage branch only. It is deliberately shaped like the control that keeps closed Changes closed, so there is one pattern for a control that consumes a KAAL command.

## The isolation adjustment

`isolate-boundaries.sh` computes what a change touches outside a protected boundary and refuses it. It now excludes from that remainder exactly the record of a Change: `.kaal/changes/`, `.kaal/seals/changes/` and `.kaal/seals/trees/`. The exclusion is a path pattern, so the control cannot know whose record it is; the control does not reimplement admission. Where `contain-change` runs, a proposal contains exactly one new Change, so a boundary change travels with the one Change that explains it. On a staging branch, where nothing is admitted, several records could travel beside a boundary; that is an honest limit of the composition and is not policed by the isolation control. A Node seal and every other path of the KAAL directory still count as outside.

## Sequence

This Change refreshes against the admitted KAAL, takes its own next free number, consumes the admission semantics that already landed, closes independently, and is the only place the enforcing machinery changes. Its own proposal is judged by the control it introduces: one new closed Change, nothing else beside a protected boundary but its record.

## What is not here

No change to the predicate, to Core or to a Node; no new KAAL concept; no ruleset edit (the owner adds `contain-change` to the required checks by hand); no handling of automated updates; no reservation of Change numbers (allocation is optimistic and collisions resolve on refresh, before sealing).
