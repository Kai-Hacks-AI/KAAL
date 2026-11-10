# PLAN: FAR Accepts are authorized by an accepted PLAN

Capability: Change. Integration scope: Change only (docs).
Collector: kaal/change. Destination: main through a separate promotion.
Base: kaal/change.

## Request

Engineering's PLAN `far-authorization-plan.md` (#1340) asks Change to revise change/F7, F10 and T15 so an Accept is authorized by an accepted PLAN, keyed to the Change and each Case's identity and digest instead of revisions, read from the PLAN's landing commit. The CPO's three conditions: (1) evidence names the exact accepted PLAN and the designated authority; (2) scope is one boundary, so promotion needs its own entry; (3) a DO cannot edit or skip its PLAN's Cases or alter an Accept, and unknown, expired or unverifiable authorization fails closed.

## Change

`packages/kaal-change/plan/far/`:
- intent: I24 (authorization before reliance), I25 (a PLAN fixes what its DO is judged by).
- requirements: F7 and F10 revised; new F50 authorization, F51 integrity, F52 lifecycle, F53 one boundary, F54 fail closed; G13 open.
- architecture: A6, A7, A8 revised; new A24 (pure `authorize`, `integrity`, `lifecycle`); ownership and graph updated.
- testing: T15, T16 revised; T60–T66 planned; the pre-DO test Change is a PLAN-type Change that replaces the superseded T10, T15, T16 Cases openly and adds T60–T66.

## Open for the Owner

G13: where the designated authority's decision is read from (the entry, or the approving review of the PLAN's landing). Left open; the PLAN only requires the designation to be given as data.

## Boundary

Docs only. No code, no change to `far.test.mjs`, no promotion, publication or version bump.
