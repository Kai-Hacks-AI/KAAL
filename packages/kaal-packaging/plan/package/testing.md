# The KAAL Package contract: Testing

The DO writes these cases in `packages/kaal-packaging/test/plan/package.test.mjs`. Each one runs the conformance suite (packaging/A7) against fixture packages that the test packs and installs into a scratch host. Each is first observed RED against a deliberately wrong suite. A RED that shows only a missing module counts as blocked, not as evidence.

| Test | Checks | Fixture the suite must fail, naming the cause |
| --- | --- | --- |
| packaging/T15 | F7: name, exact version and exact registry dependencies | A `file:` dependency. A range such as `^1.0.0` |
| packaging/T16 | F8: the shipped documents are present and non-empty at their paths | A package missing Limitations. One whose Requirements file is empty |
| packaging/T17 | F9, N9: the installed `npm test` runs against the installed copy, without the checkout | A test that imports from this repository by relative path. A `test` script that runs the publisher suite |
| packaging/T18 | F10: the entrypoint's line conforms to Testing's verifier contract | A line that says `verified` with a case failed. A line with no cause |
| packaging/T19 | F11: an installed file that differs from the manifest, and a declared case that is not run, are each reported, never verified | A changed shipped file. A manifest that declares three cases, of which two run |
| packaging/T20 | F12: the runtime and platforms are declared | A package with no `engines` |
| packaging/T21 | F13: a shipped Requirement with neither a case nor an allocation is reported unresolved | A Requirement no case cites |
| packaging/T22 | N7: the consumer's project is byte-identical after verification | A verifier that writes a cache file beside the consumer's `package.json` |
| packaging/T23 | N8: the installed verification runs with only the package's declared runtime dependencies | A verifier that imports `kaal-testing` without declaring it |
| packaging/T24 | N9: a case that passes on presence alone is detected | A suite case that checks only that `docs/requirements.md` exists, run against a fixture whose requirements contradict its behaviour |

Every result is verified, failed or unknown, in Testing's terms. A package that the suite cannot decide is unknown, never verified.
