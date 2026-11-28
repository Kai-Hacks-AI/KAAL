# Backlog lane table: PLAN

Capability: Backlog. Integration scope: Backlog only.
Collector: kaal/backlog/lanes. Destination: main through a separate promotion.

## Request

Kai asked on 28 November that backlog items and identity claims reach main by the same fast-lane mechanism, implemented once, alone or together. Change agreed the shape with Backlog (change/C250, #3020).

## Change

PLAN of backlog/C1800 under `packages/kaal-backlog`: I3, F9 to F12, A3, the gaps G7 and G8 and the Cases T6600 to T6604 as `.red.mjs`. No code.

## Verification

Each Case run with `node --test <file>`: all five fail by assertion because `qualify` does not read a lane table.

## Boundary

No DO, no claim entry, no branch kind, ruleset, workflow, template or WIRE, no activation.
