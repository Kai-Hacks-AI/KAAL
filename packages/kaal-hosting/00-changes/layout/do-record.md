# Layout DO record: what moved and what changed in each Case file

Evidence for the Owner's ruling (path-only supersession of immutable Cases, listed before and after). Every Case keeps its identity: the 192 `it(...)` titles, compared as a multiset between `kaal/hosting` (`test/`) and this change (`04-test/`), are identical, and no Case was added, removed or reworded. Only path clauses (where a file lives, how a path is built) and the fixtures that mirror the old layout changed.

| Case or tool file | Before | After | Lines changed (+/-) |
|---|---|---|---|
| `build.mjs` | `(new)` | `04-test/engineering-check/build.mjs` | +44/-0 |
| `boundary-check.test.mjs` | `test/plan/boundary-check.test.mjs` | `04-test/engineering-check/plan/boundary-check.test.mjs` | +8/-8 |
| `boundary.test.mjs` | `test/plan/boundary.test.mjs` | `04-test/engineering-check/plan/boundary.test.mjs` | +10/-10 |
| `directory-listing.test.mjs` | `test/plan/directory-listing.test.mjs` | `04-test/engineering-check/plan/directory-listing.test.mjs` | +5/-5 |
| `interface.test.mjs` | `test/plan/interface.test.mjs` | `04-test/engineering-check/plan/interface.test.mjs` | +13/-13 |
| `ownership.test.mjs` | `test/plan/ownership.test.mjs` | `04-test/engineering-check/plan/ownership.test.mjs` | +2/-2 |
| `portability.test.mjs` | `test/plan/portability.test.mjs` | `04-test/engineering-check/plan/portability.test.mjs` | +10/-10 |
| `release.test.mjs` | `test/plan/release.test.mjs` | `04-test/engineering-check/plan/release.test.mjs` | +34/-29 |
| `usage-skill.test.mjs` | `test/plan/usage-skill.test.mjs` | `04-test/engineering-check/plan/usage-skill.test.mjs` | +2/-2 |
| `attribution-branches.test.mjs` | `test/publisher/attribution-branches.test.mjs` | `04-test/engineering-check/publisher/attribution-branches.test.mjs` | +0/-0 |
| `attribution-continuations.test.mjs` | `test/publisher/attribution-continuations.test.mjs` | `04-test/engineering-check/publisher/attribution-continuations.test.mjs` | +0/-0 |
| `attribution-mutations.mjs` | `test/publisher/attribution-mutations.mjs` | `04-test/engineering-check/publisher/attribution-mutations.mjs` | +6/-6 |
| `attribution-prefixes.test.mjs` | `test/publisher/attribution-prefixes.test.mjs` | `04-test/engineering-check/publisher/attribution-prefixes.test.mjs` | +0/-0 |
| `attribution-ternary.test.mjs` | `test/publisher/attribution-ternary.test.mjs` | `04-test/engineering-check/publisher/attribution-ternary.test.mjs` | +0/-0 |
| `defect-mutations.mjs` | `test/publisher/defect-mutations.mjs` | `04-test/engineering-check/publisher/defect-mutations.mjs` | +6/-6 |
| `defects.test.mjs` | `test/publisher/defects.test.mjs` | `04-test/engineering-check/publisher/defects.test.mjs` | +44/-22 |
| `directory-listing.test.mjs` | `test/publisher/directory-listing.test.mjs` | `04-test/engineering-check/publisher/directory-listing.test.mjs` | +1/-1 |
| `manifest.mjs` | `test/publisher/manifest.mjs` | `04-test/engineering-check/publisher/manifest.mjs` | +12/-12 |
| `release-record.test.mjs` | `test/publisher/release-record.test.mjs` | `04-test/engineering-check/publisher/release-record.test.mjs` | +49/-27 |
| `scan.test.mjs` | `test/publisher/scan.test.mjs` | `04-test/engineering-check/publisher/scan.test.mjs` | +2/-2 |
| `sibling-footprint.test.mjs` | `test/publisher/sibling-footprint.test.mjs` | `04-test/engineering-check/publisher/sibling-footprint.test.mjs` | +1/-1 |
| `usage-mutations.mjs` | `test/publisher/usage-mutations.mjs` | `04-test/engineering-check/publisher/usage-mutations.mjs` | +3/-3 |
| `verify.test.mjs` | `test/publisher/verify.test.mjs` | `04-test/engineering-check/publisher/verify.test.mjs` | +52/-30 |
| `allocation.test.mjs` | `test/embed/allocation.test.mjs` | `04-test/package-check/allocation.test.mjs` | +0/-0 |
| `architecture.test.mjs` | `test/embed/architecture.test.mjs` | `04-test/package-check/architecture.test.mjs` | +3/-3 |
| `conformance.test.mjs` | `test/embed/conformance.test.mjs` | `04-test/package-check/conformance.test.mjs` | +0/-0 |
| `fixture-ownership.test.mjs` | `test/embed/fixture-ownership.test.mjs` | `04-test/package-check/fixture-ownership.test.mjs` | +0/-0 |
| `harness.mjs` | `test/embed/harness.mjs` | `04-test/package-check/harness.mjs` | +0/-0 |
| `hosting.test.mjs` | `test/embed/hosting.test.mjs` | `04-test/package-check/hosting.test.mjs` | +1/-1 |
| `intent.test.mjs` | `test/embed/intent.test.mjs` | `04-test/package-check/intent.test.mjs` | +7/-5 |
| `requirements.test.mjs` | `test/embed/requirements.test.mjs` | `04-test/package-check/requirements.test.mjs` | +0/-0 |
| `usage-harness.mjs` | `test/embed/usage-harness.mjs` | `04-test/package-check/usage-harness.mjs` | +1/-1 |
| `verify.mjs` | `test/verify.mjs` | `04-test/package-check/verify.mjs` | +49/-29 |

## What each kind of change is

- Path depth and import clauses: the Cases reach the package one folder deeper (`../../..`), and import the built scripts from `dist/skills/kaal-hosting/scripts/`.
- Fixtures that mirror the layout (`release.test.mjs` consumer and manifest fixtures, `defects.test.mjs`, `release-record.test.mjs`, `verify.test.mjs`): they now build a source tree and an installation in the new layout instead of the old one. Their assertions and titles are unchanged.
- `verify.mjs` and `manifest.mjs` (tools, not Cases): they know both places (source workspace and installation) and normalize Case identities to `test/package-check/<file>`, so one manifest serves a source run and an installed run.

## What the DO found about itself

- An early draft of the `test` script started the verifier with `node -e`. Node's test runner hands an inherited `--eval` to every case process it spawns, so each case re-ran the whole verifier and the process count grew without bound. This is a defect of this change, not of a released package and not of the container. T26 now asserts the `test` script runs a file and never evaluates inline code; the script is `node dist/test/package-check/verify.mjs` with a `pretest` that builds `dist/` only in a source workspace.

## Results at this head

- `npm run test:publisher`: 193 Cases at the top level (192 pass, 1 skipped: T135, which needs a host that enforces read-only directories and does not run as root), plus the 15 release Cases (all pass), plus the mutation scripts (usage, defect, attribution: every mutation killed).
- `npm test` in the source workspace: verified, exit 0.
- Installed from the real tarball into a fresh consumer: `npm explore @kaihacksai/kaal-hosting -- npm test` is `verified`, exit 0, 112 delivered Cases from 7 files; `npx kaal-hosting-boundary --target <dir>` runs and returns a complete scan.
- Packaging's structure checker, given the real `npm pack` file list (48 files) and the real build: `verified`, no findings. This is the soft conformance assessment the Owner asked for; enforcement becomes hard when Packaging's checker is integrated into Engineering.
- Consumer contract unchanged: the exports map, the `kaal-hosting-boundary` command, `npm test` as the verification command and the Extension Node `kaal/Hosting.md` resolve as before (T21 to T31, T75).
