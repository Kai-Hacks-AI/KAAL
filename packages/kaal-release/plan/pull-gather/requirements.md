# Pull Promotion: the delivery candidates are gathered and the existing verdicts are consumed (target)

Scoped `pull/` (ids are global). Nothing of pull/F25 to F49 is relaxed. Everything is advisory and read-only. The gatherer implements neither stock readiness nor destination admission.

- **pull/F50. Every head ref of a delivery class is a candidate, and nothing else is.** `gatherDeliveries(facts)` returns `deliveries`, a list of `{class, source, name, sha, out, in}` in the shape `laneStep` takes. A head whose ref starts with `hotfix/`, `wire/` or `kaal/` becomes a candidate of the class `HOTFIX`, `WIRE` or `KAAL`, with `source` the ref, `name` the ref without the prefix and `sha` the head. Any other ref, or one with an empty name, is ignored. No `value`, `size` or `unit` is ever produced. Facts that are missing or not lists give no candidates and a finding, never a guess, and the input is not changed.
- **pull/F51. OUT is a consumed verdict, never a computed one, and its evidence is the class's own.** `out` is decided only from `facts.verdicts`, a list of `{source, verdict, revision, authority}`, and `facts.authorities`, the authority each class registers for OUT.
  - `PASS`: a verdict with `verdict` `PASS`, `revision` equal to the candidate's `sha` and `authority` equal to the class's registered one.
  - `FAIL`: a verdict `FAIL` with that revision and authority.
  - `UNKNOWN`: everything else, including no verdict, another revision, another or unregistered authority, `held` and any unrecognised value.
  - The gatherer reads nothing behind the verdict. Verdicts carrying differently shaped evidence for KAAL, HOTFIX and WIRE give the same result for the same `{verdict, revision, authority}`; no Change-folder layout is required of any class.
- **pull/F52. IN is read from the destination's own merge checks at the delivery PR's exact head.** `in` is decided from `facts.destination.required` (the check contexts `main` actually requires, as read from the host), the pull requests into `main` in `facts.prs`, and `facts.checks`.
  - No pull request into `main` whose head is the candidate's `sha`, or `required` missing or unreadable: `UNKNOWN`.
  - A PR at that head with every required context completed `success` on that `sha`: `PASS`. A required context completed with a failure on that `sha`: `FAIL`. Anything else (pending, neutral, `held`, a run on another SHA, a context missing): `UNKNOWN`.
  - No list of IN checks is held by the gatherer or its declaration: two different `required` lists give the results of each.
- **pull/F53. Facts are read by GET calls only.** The reader that fetches `facts` (heads, pull requests into `main`, check runs, the checks `main` requires) uses only read requests. It sends no request that creates, updates, merges, approves, comments or dispatches, and a request that fails or is paged out leaves what it could not read UNKNOWN, never PASS.
