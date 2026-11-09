# PLAN: a set of paths travels alone, as one Change rule

Capability: Change. Integration scope: Change only (docs).
Collector: kaal/change. Destination: main through a separate promotion.
Base: kaal/change.

## Request

The CI ownership assessment (D2) found the rule "a Change that touches this set of paths touches nothing else" implemented by hand in `check.mjs`/`change-isolation.sh`, in the inline shell of `guard-acceptance-boundary.yml`, and in Release Management's `isolate Change`. Kai: it belongs in Change as one reusable, parameterized capability, executed by Guard, with KAAL supplying its path sets as data; prove equivalent coverage before anything retires.

## Change

`packages/kaal-change/plan/travel/`: Intent (I26–I29), Requirements (F55–F59, G14, G15), Architecture (A25–A29, ownership, graph), Testing (T67–T73). Docs only.

## Note

`kaal-change`'s existing `/isolation` is a semantic, Graph-based judgment and not a copy of this rule; it is left as it is.

## Open for the Owner

G14: what happens to the `check.mjs` transition ledger. G15: which collectors apply which sets.

## Boundary

Docs only. No code, no retirement of any existing control, no promotion, publication or version bump. Each retirement is its own authorized Change after the equivalence table is GREEN.
