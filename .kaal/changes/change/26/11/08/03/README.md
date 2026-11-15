# Two known-RED Defect Cases for Change (Codex findings on #938)

Capability: Change. Integration scope: Change only.
Collector: kaal/change. Destination: main through a separate promotion.
Base: kaal/change after the relocation (#1247).

## Request

Codex reviewed #938 with two valid findings that were out of that PR's scope. Per the
Codex rule, each becomes a Defect confirmed by a RED Test Case, placed with the
owning capability, and fixed by a separate Change.

## Defects

1. **Scope order.** `isolate()`'s verdict (assessment and findings) depends on the
   order of the selected scope when it names an unimpacted owner and an owner with
   no source. The Case builds the proposal per ordering with `example({ scope })`
   and requires equal assessments and findings. It fails today.
2. **Lane discovery.** `engineering/lanes/suites.mjs` runs every uncovered `test:*`
   script of a workspace with no arguments, and discovers kaal-change's
   `test:package-only`, which needs a packed manifest and a fresh consumer
   directory. The Case requires that the probe is not offered to automatic
   discovery while `test:publisher` still is. It fails today with
   "lane would run these with no arguments: test, test:publisher, test:package-only,
   test:collector".

## Boundary

Both Cases are report-only: neither is in any gating script, so Guard sees no new
failure. They sit in `test/plan/` and are run by hand. The fixing Changes turn them
GREEN and move them into gating tests. A known-RED Case is escalated to the Owner
when its capability is promoted or published, not before. No product code changes
here. No promotion, publication or version bump.
