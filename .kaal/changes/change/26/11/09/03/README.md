# PLAN: FAR Accepts are authorized by an accepted PLAN

Capability: Change. Integration scope: Change only (docs).
Collector: kaal/change. Destination: main through a separate promotion.
Base: kaal/change.

## Request

Engineering's PLAN `far-authorization-plan.md` (#1340) asks Change to revise change/F7, F10 and T15 so an Accept is authorized by an accepted PLAN, keyed to the Change and each Case's identity and digest instead of revisions, read from the PLAN's landing commit. The CPO's three conditions: (1) evidence names the exact accepted PLAN and the designated authority; (2) scope is one boundary, so promotion needs its own entry; (3) a DO cannot edit or skip its PLAN's Cases or alter an Accept, and unknown, expired or unverifiable authorization fails closed.

## Change

`packages/kaal-change/plan/far/`:
- intent: I9 (authorization before reliance), I10 (a PLAN fixes what its DO is judged by).
- requirements: F7 and F10 revised; new F12 authorization, F13 integrity, F14 lifecycle, F15 one boundary, F16 fail closed; G13 open.
- architecture: A6, A7, A8 revised; new A9 (pure `authorize`, `integrity`, `lifecycle`); ownership and graph updated.
- testing: T15, T16 revised; T17–T23 planned.

## Open for the Owner

G13: where the designated authority's decision is read from (the entry, or the approving review of the PLAN's landing). Left open; the PLAN only requires the designation to be given as data.

## Boundary

Docs only. No code, no change to `far.test.mjs`, no promotion, publication or version bump.
