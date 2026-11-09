# PLAN: lay Engineering's controls out like a package

Status: PLAN, nothing below is built. Owner decision on 9 Nov 2026: decide this layout first; the gate ports' Architecture edits (including the closed #1318) wait for it.

## Why

A package such as Foundation keeps one folder per link of the chain: `00-changes`, `01-intent`, `02-requirements`, `03-architecture`, `04-test`, `06-defects`. Engineering's controls hold the same chain, but as sections of one file, `engineering/controls/README.md` (I1, F1, A1 and "Assurance" per control). The earlier C3 PLAN in that README already proposed a directory per control with flat files, and that was never delivered: today only the README exists. The two shapes differ, which blocks tracing a port's chain with the same tool for a package and a control.

## Proposal (to decide)

One directory per control, numbered like the package, Cases beside what motivated them (the Case layout rule):

```
engineering/controls/<control>/
  <Name>.md          the Control Node: Has edges to its Intents
  01-intent/intent.md
  02-requirements/   functional, non-functional (F..., N...)
  03-architecture/   A... naming code:, workflow:, guard-check: references
  04-test/           index of the Cases that verify the claims, by reference
  06-defects/        Defects (empty until one exists)
```

Cases stay next to the code (for example `engineering/github/ports/promotion-source.parity.test.mjs`); `04-test` only refers to them by `test:<path>#<describe>`. Change records stay in `.kaal/changes/engineering/`, as Engineering's own folder holds only what improves Engineering.

## Decisions for the Owner

1. **Numbered folders (package-like) or the C3 flat files** (`intent.md`, `requirements.md`, `architecture.md`, `testing.md`)? Recommendation: numbered, so one traceability computer reads both.
2. **The term "Assurance".** It is the existing README heading for how each claim is checked. In the new layout it disappears as a heading: the claims' state is read from the Cases in `04-test` by trace.
3. **Brackets or typed edges.** Today `[F1]` brackets are the traces. Keep them now; typed edges follow when Requirements and Architecture define them.
4. **Migration.** One control first (promotion-source, the pilot), bytes of each section unchanged, as its own Change. The other six follow once it is reviewed. The ports' Architecture edits then land in the new place, once.

## Not in this PLAN

No file is moved, no Node re-id'd, no promotion, version bump, SYNC, ledger entry, release dispatch or publication.
