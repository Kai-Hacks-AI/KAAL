# Core/C46 DO: one normalized verification report

Applies the approved C44 T91 hunk (`test/plan/release.test.mjs` only) and the
C45 supplemental patch (T96 in `test/acquisition.test.mjs`, and the Core
Acceptance parser in `engineering/acceptance/embed.test.mjs`) to the collector
`826cf46`. C44's T43/T47 lifecycle hunks are not applied: they belong to
mandatory initialization, a later stage.

## Change

- `test/verify.mjs` prints exactly one final line, `kaal-core-verification `
  and JSON `{result, exit, candidate{name,version,manifest}, cases[{file,name,outcome}], causes[]}`.
  The separate `kaal-core-execution:` record and the human result line are gone.
  Outcomes are `pass`, `fail`, `skipped`, `todo`, `not run`. Verdict logic, manifest
  checks, scratch execution and exit statuses are unchanged: one execution, one report.
- Delivered docs (`docs/operations.md`, `testing.md`, `architecture.md`,
  `limitations.md`) describe the implemented report. Historical plan prose is left as history.
- `test/verify.json` is regenerated explicitly with `npm run manifest`.
- No runtime API, dependency, package identity or workflow changes. No Testing or
  Packaging dependency or copied model is added.

## Evidence (Linux, Node 24.22.1, `npm ci` from the lock)

- Intended RED before the verifier change: T91 failed with the old two-record output.
- After: T91 passes; T96 (run through npm) passes 3/3; T97 and `manifest --check` pass;
  T106 and T98 pass; source `npm test` is verified (12 declared, all pass).
- Still RED by design, owned by later stages: T99 (C42 navigation, #827), T100/T101
  (mandatory initialization) and T105 (full release enrollment).
- Not claimed here: native Linux/macOS/Windows installed acceptance (CI), full release GREEN
  (T79), Packaging F14's dispatcher mismatch (T80 preserved).
