# Defect: kaal-testing's runtime dependency c8 brings in moderate advisories

**Status:** open, proven RED. Not answered until the Case below goes GREEN.

## Finding

`npm audit` on `main` reports two moderate advisories (the two Dependabot alerts GitHub shows on push):

- `minimatch` < 11.0.1, GHSA-g3hv-75wg-m249 (denial of service through globparts amplification).
- `glob` 9.0.0 to 14.0.1, GHSA-3g3m-2fjr-6pw4 (an AbortSignal cancellation does not stop filesystem traversal).

Both arrive only through `kaal-testing` → `c8@12.0.0` → `test-exclude@8.0.0` → `glob@13.0.6` / `minimatch@10.2.6`. `c8` and `test-exclude` are at their newest releases, so no upgrade clears them.

## Consumer exposure (verified)

`kaal-hosting` and `kaal-testing` were packed with `npm pack` and installed into an empty project. `npm audit` there reports the same chain, so a consumer installing `kaal-testing` inherits the advisories. `c8` is declared in `dependencies` of `packages/kaal-testing/package.json` and `lib/coverage.mjs` resolves `c8/bin/c8.js` at runtime, so it is a real runtime dependency of the coverage feature today.

## Placement (proposed, for Architecture to confirm)

Owner: Testing (the only declarer of `c8`). Related: Packaging (embedded packages stay dependency-free except Foundation and Hosting); Security (SECURITY.md: the Owner triages every alert; a valid alert stays open while remediated).

## Proof

`packages/kaal-testing/test/defects/c8-audit.red.test.mjs`: the installed consumer tree of `kaal-testing` has no moderate-or-worse `npm audit` finding. RED today; deliberately not wired into `npm test` until the fix Change.

## Fix routes (a separate Change)

1. Move `c8` out of kaal-testing's runtime dependencies to the Engineering level (needs a decision on how `lib/coverage.mjs` finds c8 without it).
2. Interim for the repository only: root `overrides` for `glob` and `minimatch`. Does not protect consumers.
3. Wait for an upstream release.
