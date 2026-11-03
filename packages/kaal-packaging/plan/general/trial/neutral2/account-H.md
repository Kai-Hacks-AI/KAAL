# Boundary account: `acme-slug` 0.9.0

Account written by its owner. The package is built, packed (`acme-slug-0.9.0.tgz`, sha256 recorded below) and installed into a fresh consumer on Linux, Node 24.

## Boundaries

| # | Direction | Interaction | Contract owner and identifier | Obligation |
| --- | --- | --- | --- | --- |
| H1 | incoming | `slug(text)` API | acme-slug/F1 | Return `text` lower-cased, with each run of characters outside a-z and 0-9 replaced by one `-`, and no leading or trailing `-`. |
| H2 | outgoing | imports `acme-shared` (`file:../acme-shared`) | acme-shared/F4 | Use its `normalize(text)` before slugging. |

## Test Plan (package-owned)

| Case | Boundary | Exercises | Fixture / expectation |
| --- | --- | --- | --- |
| T1 | H1 | ASCII words | `slug("Hello World")` expects `hello-world` |
| T2 | H1 | punctuation runs | `slug("a -- b")` expects `a-b` |
| T3 | H2 | normalizes first | the expected value in `test/expected.json` is produced by running `slug` once with the current code and saving the result; the Case compares later output with it |

## Evidence record

Pack digest sha256: `9c1f...e0a7` (elided by the owner). Installed run on 2 Nov in a fresh consumer: `npm test` printed "3 passing". The consumer's lockfile shows `acme-shared` installed from `file:../acme-shared`.
