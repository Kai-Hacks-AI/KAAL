# The isolation verdict no longer depends on the order of the selected scope

Capability: Change. Integration scope: Change only.
Collector: kaal/change. Destination: main through a separate promotion.
Base: kaal/change after the two RED Defect Cases (#1249).

## Request

Defect 1 of #1249 (Codex finding on #938): `isolate()` judged an unimpacted owner
as `violated 'unsupported-scope'` or `unknown 'scope-impact-unresolved'` depending
on whether an earlier owner in the scope had already added an `unknown` finding
(for example a selected owner with no source). The same scope in another order gave
another verdict.

## Change

- `lib/isolation.mjs`: whether the evidence is incomplete is decided once, before any
  selected owner is judged, so no owner's finding can change another owner's verdict.
- `test/embed/isolation.test.mjs`: new gating Case `change/T58 [change/F44]` requires
  equal assessments and findings for reordered scopes. It was RED on the old library and
  is GREEN now.
- `test/plan/defect-scope-order.test.mjs` is removed: its report-only Case moved into
  the gating test.
- `docs/testing.md` gains the T58 row; `test/verify.json` is regenerated (new digests
  for the three changed files, `change/T58` in the cases list).

## Design decision for the CPO

An unimpacted owner is now a violation (`unsupported-scope`) regardless of another
owner's missing source. Before, it could be downgraded to `unknown` by scope order.
A violation is the stricter, order-independent reading.

## Verification

From `packages/kaal-change`: `npm test` verified; `test:collector` 94 pass;
`test:publisher` 6 pass; manifest current. Root `test:engineering`: 277 pass.

## Boundary

No promotion, publication or version bump. The lane-discovery fix and the Graph
optional-peer correction are separate Changes.
