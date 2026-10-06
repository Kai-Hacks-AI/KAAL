# Admission into the lineage: intent

Sharpen the rules for what may join the admitted KAAL lineage. This Change is complete in itself: it states intent, requirements and architecture, and carries the deterministic predicate that implements them with its tests and documentation. It is the one coherent Change that sharpens admission.

## Observation

A Change was decomposed into several implementation steps, and some of them joined the lineage while the Change was still open: no retrospectives, no seal. The lineage was used as an integration line for partial Change state. That mixes two things that should stay apart: work in progress, which is mutable and may be incomplete, and admitted history, which is sealed evidence.

## Intent

The lineage is admitted KAAL, and nothing else. Crossing into it is an admission, not an integration. The one thing that crosses is a completed, retrospectively examined, sealed Change.

```
work → complete Change → retro-work, retro-observe → seal Change → admission → lineage
```

A partial Change does not enter the lineage. What happens before the crossing (any number of steps, in any shape) is staging, and staging is not the lineage.

## Bootstrap

This Change introduces the rule it is itself subject to, so it is a bootstrap: it is admitted under the checks that exist when it crosses, and every later admission is governed by the rule. It is closed before it crosses, exactly as the rule asks.

## Stance

- Compose what KAAL already has: Changes, Work, the two retrospectives, Change sealing, the one process evaluator, and the control that keeps closed Changes closed. Add no lifecycle, no phase metadata and no new artifact type unless an existing primitive cannot express a requirement.
- The check is deterministic KAAL machinery; whatever hosts the lineage only supplies the two states to compare and enforces the verdict.
- Do not weaken sealing. Mutable Work stays distinct from sealed historical evidence.
- Keep it small.

## Out of scope

- Whatever hosts the lineage: extracting the two states, running the predicate and making its verdict required belongs to the host and is not part of this Change's Work. Everything KAAL itself must do to decide is in this Change.
- Any Change already in flight; it finishes under the rules it started with.
- Anything about how the host stages work. Staging is whatever is not the lineage.
