# The KAAL Package contract: Testing

The DO writes these cases in `packages/kaal-packaging/test/plan/package.test.mjs`. Each one runs the conformance suite (packaging/A7) against fixture packages that the test packs and installs into a scratch host. Each is first observed RED against a deliberately wrong suite. A RED that shows only a missing module counts as blocked, not as evidence.

| Test | Checks | Fixture the suite must fail, naming the cause |
| --- | --- | --- |
| packaging/T15 | F7: name, exact version and exact registry dependencies | A `file:` dependency. A range such as `^1.0.0` |
| packaging/T16 | F8: the shipped documents are present and non-empty at their paths, and the README links `docs/operations.md` | A package missing `docs/limitations.md`. One whose `docs/requirements.md` is empty. One that ships Operations only in its README, or whose README does not link `docs/operations.md` |
| packaging/T17 | F9, N9: the installed `npm test` executes the Embedded verification against the installed copy, without the checkout, and runs no Engineering test | A test that imports from this repository by relative path. A `test` script that runs the publisher suite |
| packaging/T18 | F10: the entrypoint's line conforms to Testing's verifier contract | A line that says `verified` with a case failed. A line with no cause |
| packaging/T19 | F11: an installed file that differs from the manifest, and a declared case that is not run, are each reported, never verified | A changed shipped file. A manifest that declares three cases, of which two run |
| packaging/T20 | F12: the runtime and platforms are declared | A package with no `engines` |
| packaging/T21 | F13: a shipped Requirement with neither a case nor an allocation is reported unresolved | A Requirement no case cites |
| packaging/T22 | N7: the consumer's project is byte-identical after verification | A verifier that writes a cache file beside the consumer's `package.json` |
| packaging/T23 | N8: the installed verification runs with only the package's declared runtime dependencies | A verifier that imports `kaal-testing` without declaring it |
| packaging/T24 | N9: a case that passes on presence alone is detected | A suite case that checks only that `docs/requirements.md` exists, run against a fixture whose requirements contradict its behaviour |
| packaging/T25 | N10: every generic Requirement that depends on another owner's meaning cites that owner's ID, and each cited ID exists on its branch | A Requirement that defines `unknown` itself. A citation of `testing/F99` |
| packaging/T26 | F14: the source workspace declares its Test Plan, the Embedded verification is among its suites, and its `npm test` follows the declaration | A workspace whose `npm test` runs no declared suite. A plan that omits the Embedded verification |

**Trace.** Every generic Requirement has a discriminating case:

| Requirement | Case |
| --- | --- |
| packaging/F7 | T15 |
| packaging/F8 | T16 |
| packaging/F9 | T17 |
| packaging/F14 | T26 |
| packaging/F10 | T18 |
| packaging/F11 | T19 |
| packaging/F12 | T20 |
| packaging/F13 | T21 |
| packaging/N7 | T22 |
| packaging/N8 | T23 |
| packaging/N9 | T17, T24 |
| packaging/N10 | T25 |

A tampered installed file in T19 is reported unknown, not failed, per testing/F43. T16 checks `docs/operations.md` and the README's link to it (D2). T17 and T26 follow the context model (D1, packaging/A11): the installed context in T17, the source workspace in T26. Packaging tests neither the root nor an external repository.

Every result is verified, failed or unknown, in Testing's terms. A package that the suite cannot decide is unknown, never verified.

## RED evidence (packaging/C5)

Before `kaal-packaging/conformance` existed, every case failed as blocked (`ERR_PACKAGE_PATH_NOT_EXPORTED`), which is not evidence. The discriminating RED came from 23 deliberately wrong suites, each one change to `lib/conformance.mjs`, run against all thirteen cases on Node 24.22.1 with npm 11.19.1. Every one was caught:

| Wrong suite | Caught by |
| --- | --- |
| F7 accepts any version or range | T15 |
| F8 accepts an empty document | T16 |
| F8 ignores the README link | T16 |
| F9 ignores a verifier that reaches into the checkout | T17 |
| F9 verifies a run that reported no result | T17 |
| F10 ignores a result that contradicts the exit | T18 |
| F10 ignores failed cases under `verified` | T18 |
| F10 accepts a result without a cause | T18 |
| F11 ignores a changed file | T19 |
| F11 ignores declared cases that did not run | T19 |
| F11 reports a changed file as failed, not unknown | T19 |
| F12 accepts undeclared platforms | T20 |
| F13 verifies an untraced identifier | T21 |
| N7 ignores a changed consumer | T22 |
| N8 trusts any import | T23 |
| N9 accepts `verified` with no case run | T24 |
| N9 accepts `verified` without a count | T24 |
| N10 accepts a citation its owner does not define | T25 |
| N10 accepts a restated Testing term | T25 |
| N10 verifies an unresolved citation | T25 |
| F14 accepts a plan without the Embedded verification | T26 |
| F14 accepts an `npm test` that states no suite | T26 |
| F14 accepts an undeclared suite | T26 |

The first run left two survivors in F9: T17's checkout fixture failed at run time, so the static check was never the deciding one. T17 now installs that fixture inside a checkout, where the import resolves and the run succeeds, and only the suite's own check fails it.
