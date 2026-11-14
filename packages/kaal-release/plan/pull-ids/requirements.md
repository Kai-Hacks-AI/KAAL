# Pull Promotion: where a Case sits and how it is logged (target)

Scoped `pull/` (ids are global). Nothing of pull/F25 to F36 is relaxed.

- **pull/F37. A Case file sits where its id says and CI logs it by that id.**
  - A file `packages/<package>/test/<scope>/T<n>.test.mjs` exports the id `<scope>/T<n>`.
  - No `packages/<package>/plan/<change>/T<n>.test.mjs` remains: the declaration reads such a path under a bare id that no log line carries. A Case that has gone green belongs under `test/<scope>/`; a RED Case stays `.red.mjs` under the PLAN until its DO.
  - Every Case of `kaal-release` that the declaration expects is run by a test file that CI runs, and the run prints one line per Case with the id, a mark and the Case's own result, so a failing Case is a failure and is never skipped.
  - A Case is moved, never rewritten: its id, its requirements, its assertions and its result stay the same.
