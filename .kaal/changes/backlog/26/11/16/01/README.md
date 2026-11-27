# Backlog item: PLAN

Capability: Backlog. Integration scope: Backlog only.
Collector: kaal/backlog/item. Destination: main through a separate promotion.

## Request

Kai asked for a backlog capability: items can be created, a Change points at an Intent and at backlog items, and an item has a test loop but may stay undelivered. The design is `backlog-design-0.0.1.md` (project files). The Owner approved the first PLAN and requires CPO review.

## Change

PLAN of backlog/C1 under `packages/kaal-backlog`: I1, F1 to F3, N1, A1, the gaps G1 to G3 and the Cases T490 to T494 as `.red.mjs`. No code.

## Verification

Each Case run with `node --test <file>`: all five fail by assertion because `lib/check.mjs` is absent.

## Boundary

No DO, no promotion, no publication, no workspace entry.
