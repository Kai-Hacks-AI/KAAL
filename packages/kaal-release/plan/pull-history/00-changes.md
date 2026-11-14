# Pull Promotion: read the history of a synchronized collector (Change A to B)

This is `pull/C7`, a PLAN Change. It ships no code. It corrects a defect in pull/C4 found by the first qualification run on a synchronized collector, and it carries out the CPO's decision "FIX FIRST" (review on #1577). It authorizes preparation of the correction, not promotion or publication.

## A: the present

The host gatherer reads the collector's commits since the merge base (the host's three-dot comparison) and accepts them only as one first-parent line that starts at the merge base. After the collector merges `main` (the SYNC every promotion needs) the merge base moves to the new `main` head, and the comparison lists older collector commits whose first-parent chain starts at an older commit. The gatherer reports "could not order the history", so every synchronized collector is "not judged". `kaal/release/plan` at `e1077a1` shows it.

## B: the target

The history is the collector's first-parent ancestry from the head back to the first commit already contained in `main`. A SYNC merge commit may stand on that line, but what it merged from `main` is not collector work and is not read as evidence. Order stays the position on the line, never a time. A history that cannot be read as one complete line fails closed: the collector is not judged. See [requirements.md](requirements.md) and [testing.md](testing.md).

## Not in this Change

No weakening of any rule: scoped PLAN and DO, the exact-head CHECK, Case completeness and exactly one concluding collector-level ACT stay as approved. No hook, CI, ruleset or Guard change; read-only. No promotion of `kaal/release/plan` (#1577 stays in draft until this lands, the collector is synchronized again and the qualification is re-run).

## Order

PLAN (this), then DO (the gatherer's history rule and the revised assertion in T14), then ACT, then a fresh concluding ACT of `kaal/release/plan`, then live integration evidence on the synchronized collector.
