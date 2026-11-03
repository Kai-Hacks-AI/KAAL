# Boundary account: `acme-envfile` 1.2.0

Account written by its owner. The package is built and published to the owner's internal registry.

## Boundaries

| # | Direction | Interaction | Contract owner and identifier | Obligation |
| --- | --- | --- | --- | --- |
| G1 | incoming | `parse(text)` API | acme-envfile/F1 | Return an object of the `KEY=value` pairs in `text`; ignore blank lines and lines starting with `#`. |
| G2 | incoming | `load(path)` API | acme-envfile/F2 | Read the file at `path` as UTF-8 and return `parse` of its content. |
| G3 | outgoing | reads files with Node `fs` | Node `fs` | Read only. |

## Test Plan (package-owned)

| Case | Boundary | Exercises | Fixture / expectation |
| --- | --- | --- | --- |
| T1 | G1 | success: three pairs, one comment | `test/fixtures/basic.env`; expects three keys |
| T2 | G2 | success: loads `basic.env` | expects the same object as T1 |

## Evidence record

Run by the owner on 2 Nov in the source checkout on Linux, Node 24: `npm test`, "2 passing". The owner reports that the published 1.2.0 package "works the same". No installed run is recorded.
