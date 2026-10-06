# Enforcing admission: intent

Realize, in the support engine that hosts the lineage, the admission semantics that the KAAL Change `genesis/26/10/05/03` already defines and delivered as `check-kaal-admission`. This is the second of two Changes, in sequence: the semantics first, the machinery that enforces them second. It consumes a rule that exists; it does not define it.

## Intent

A proposal into a lineage branch is an admission. After this Change the support engine asks the KAAL-native predicate whether the proposal introduces exactly one new closed Change, and refuses it otherwise, so that a partial Change cannot join the lineage.

## What changes

- A control, `contain-change`, that supplies the predicate with the two states it compares (the lineage branch's `.kaal` and the proposal's) and passes on its verdict, only for proposals into a lineage branch. What it establishes, in plain words: the candidate contains exactly one new closed Change, and previously admitted closed history remains intact. Admission semantics stay KAAL's; the control owns only that containment, and does not judge whether the Change is good or faithful to its intent, which is for review.
- The isolation control, `isolate-boundaries`, lets the sealed record of a Change accompany a protected boundary. Every admission carries a Change, so a boundary that must change alone would otherwise never be admissible. Only the record of the Change that mutates the boundary may accompany it; nothing else may.
- The support engine's own documentation.

## What does not change

- No KAAL semantics, Node, Core or sealed artifact. The predicate is consumed, not edited.
- No other control is weakened. No waiver, bypass or exemption is added: Changes are never exempt from admission.
- The ruleset that makes the control required is set by hand by the owner after this lands; it is not part of this Change.

## Stance

Small and deterministic. The control decides nothing about what a Change is, whether it is closed, or what its identity is; it only hands over two directories and the exit code. The Change record that accompanies a boundary is sealed text that no machinery reads.
