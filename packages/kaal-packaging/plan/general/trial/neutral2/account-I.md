# Boundary account: `acme-semver-range` 2.0.1

Account written by its owner. The package is built, packed (digest `sha256:4b1d0c7a2e55f93b6a0d8f4c1e2a7b39d5c60e8f71a4b2c9d3e6f08a1b7c5d24`), and installed into a fresh consumer on Linux and on Windows, Node 24.

## Boundaries

| # | Direction | Interaction | Contract owner and identifier | Obligation |
| --- | --- | --- | --- | --- |
| I1 | incoming | `satisfies(version, range)` API | acme-semver-range/F1 | Return true when `version` (exact `MAJOR.MINOR.PATCH`) satisfies `range` (comparators `<`, `<=`, `>`, `>=`, `=` joined by spaces), else false. A malformed version or range throws `TypeError` naming the argument. |
| I2 | outgoing | none | none | The package imports no dependency and reads no file, environment variable or network. |

## Test Plan (package-owned)

| Case | Boundary | Exercises | Fixture / expectation |
| --- | --- | --- | --- |
| T1 | I1 | each comparator, one passing and one failing input | table in `test/embed/satisfies.test.mjs` with 10 rows |
| T2 | I1 | malformed version (`"1.2"`), malformed range (`">=x"`) | each throws `TypeError` naming `version` or `range` |
| T3 | I2 | imports and reads | the test lists the installed package's files and fails if any import specifier is not relative, or any file names `process.env`, `fetch` or `fs` |

## Evidence record

Installed runs of `npm test` in the fresh consumers: Linux, "3 passing"; Windows, "3 passing". The digest above is of the packed tarball those consumers installed.
