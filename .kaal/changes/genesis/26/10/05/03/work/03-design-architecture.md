# Admission into the lineage: architecture

Partial Changes do not enter the lineage; admission is the boundary at which a completed, retrospectively examined, sealed Change joins it.

## The rule

One deterministic predicate over two KAAL directories:

```
admit(baseline, candidate) → admitted | refused (reasons)
```

Let `closed(X)` be the identities of the Changes closed in X (what `list-sealed-changes` already reports) and `changes(X)` the Change directories of X.

```
new      = closed(candidate) − closed(baseline)
carried  = Changes of the candidate present, by address, in the baseline
loose    = changes(candidate) − carried − (the Changes whose identity is in new)

admitted  ⇔  |new| = 1  ∧  loose = ∅  ∧  state(c) = CHANGE CLOSED, no problems, for the new Change c
              ∧  the existing history control passes for (baseline, candidate)
```

- `|new| = 0` is the no-Change case (R5). `|new| > 1` is the multi-Change case (R3). A non-empty `loose` is an incomplete or unsealed Change (R4). Each refusal says which.
- `carried` Changes are judged by what already judges them: a closed one must keep its identity (the existing control), an open one that is already in the baseline stays free. That second clause exists only for Changes already in flight and becomes empty by itself.
- Identification is by identity, so a closed Change moved as a whole to another address is not new, and a staged Change renumbered before closing is simply allocated again.

## Composition, nothing new beneath

| need | existing primitive |
|---|---|
| closed, no problems, both retros, Work sealed first | the process evaluator (`state`), unchanged |
| identities of closed Changes | `list-sealed-changes` / `closedChanges` |
| closed history intact | the control that keeps closed Changes closed, plus `check-kaal-changes` |
| identity of a Change | Sealing's one grammar, never recomputed here |

The new piece is only the set arithmetic above, plus its refusal messages. It is provisional engineering machinery that sits next to the other Change commands and shares their modules, so there remains one evaluator and one identity. It ships nowhere and creates no Node, no Skill and no Core API: Core is untouched. A command of the same shape as the others, taking two KAAL directories and exiting 0 or 1, is the intended surface (name: `check-kaal-admission`, provisional).

## Where the lines fall

| deterministic KAAL machinery | host glue |
|---|---|
| the predicate, its reasons, and everything it reads | produce the baseline directory and the candidate directory |
| the process evaluator, sealing and identity | run the predicate when something proposes to join the lineage |
| | report the verdict as a check and make it required for the lineage |
| | decide which line of work is the lineage |

The host glue is a thin consumer in the same shape as the existing control for closed Changes: it extracts the baseline's KAAL directory, runs the predicate and hashes nothing. It is the only part that knows hosting concepts, and it lives with the other host controls, outside KAAL.

## Staging

Steps of a Change run on a line of work that is not the lineage. The Change is open there, its Work may change, and ordinary checks apply; the admission predicate is not asked. When the Change is finished (Work sealed, `retro-work.md`, `retro-observe.md`, Change sealed) the finished state is proposed as one admission. How the host names or hosts a staging line is the host's affair and is not stated here.

```
step · step · step      (staging; open Change; not lineage)
                ↓  work sealed → retros → Change sealed
             admission  →  predicate  →  lineage
```

## Retrospectives

Closure already requires `retro-work.md` and then `retro-observe.md` (the evaluator's order), so the two-perspective model is an existing property of closure and admission inherits it as a fact about a closed Change. Writing either retro after admission is impossible by construction: a closed Change cannot change, and an unclosed one cannot be admitted. The observer's seat is a convention of Changing KAAL; the predicate cannot see who wrote a file.

## Boundary isolation (open)

A protected boundary must change alone, and every admission carries a Change (R8). The proposed resolution is that the Change record under `changes/` may accompany an isolated boundary and nothing else may. That is a narrow edit to the isolation control, which itself must travel alone. The alternative is a Change-less class for isolated boundaries, which gives up R5; it is not proposed.

## Consequences for Changes in several steps

A Change that needs a bridge, a protected-boundary step and a bridge removal is still staged on a non-lineage line and admitted whole only if its isolated parts may share a Change record (above). If the isolation rule stays absolute, such work is several admissions, each a closed Change in its own right and each leaving the lineage green: a design Change, then one Change per consistent state. This Change takes that second reading for itself: it is design only, admitted when closed, and an implementation is a Change of its own.

## What the design does not do

It adds no phase metadata, no status files, no registry of open Changes, no new retrospective, no host identifier in KAAL, and no way to remove or replace a seal. It does not make a Change describe its diff; it makes sure a Change exists, is complete, and arrives with it.
