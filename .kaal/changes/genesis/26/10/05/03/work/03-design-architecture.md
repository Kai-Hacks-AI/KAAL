# Admission into the lineage: architecture

Partial Changes do not enter the lineage; admission is the boundary at which a completed, retrospectively examined, sealed Change joins it.

## The rule

One deterministic predicate over two KAAL directories:

```
admit(baseline, candidate) → admitted | refused (reasons)
```

A Change of the candidate is **new** when the baseline holds neither a Change at its address nor a closed Change of its identity. Let `closed(X)` be the identities of the Changes closed in X (what `list-sealed-changes` already reports).

```
admitted  ⇔  exactly one new Change c
              ∧  state(c) = CHANGE CLOSED, no problems
              ∧  every Change closed in the baseline is still closed here with the same identity
```

- Zero new Changes is the no-Change case (R5), more than one is the multi-Change case (R3), and a new Change that is not closed is the incomplete or unsealed case (R4). Each refusal says which.
- Previously admitted history is what the existing history control already protects; the predicate only asks it.
- Nothing is said about Changes that were already in the baseline and are not closed. The predicate judges what an admission introduces, and has no exception for anything. Coming into force after the Changes still in flight have finished is a matter of when the control is switched on.
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

## Boundary isolation (decided)

A protected boundary must change alone, and every admission carries a Change. The sealed Change record under `changes/` may accompany an isolated boundary, and nothing else may. That is a narrow edit to a host control and is not part of what KAAL decides.

## Consequences for Changes in several steps

A Change that needs a bridge, a protected-boundary step and a bridge removal is staged on a non-lineage line and admitted whole; its isolated parts may share one Change record with it (above). This Change itself is one such Change: its steps (design, the predicate, its tests, the documentation) were staged together and it is proposed once, closed.

## What this Change carries

`helpers/admission.ts` in the Change-sealing engineering machinery, with the command `check-kaal-admission <baseline-kaal-dir> <candidate-kaal-dir>` (exit 0 admitted, 1 refused with reasons, 2 usage), acceptance tests that run the command against hand-written KAAL directories (one new closed Change admitted; none, two, and each open stage refused; closed history altered or removed refused; a closed Change moved whole is not new; Changes already in the baseline and not closed are not judged), the engineering README, and the Changing KAAL skill's wording. Alongside, and outside what Work describes, the host's own controls consume the command and let the Change record accompany an isolated boundary. Nothing in Core, in a Node, or in any sealed file changes.

## What the design does not do

It adds no phase metadata, no status files, no registry of open Changes, no new retrospective, no host identifier in KAAL, and no way to remove or replace a seal. It does not make a Change describe its diff; it makes sure a Change exists, is complete, and arrives with it.
