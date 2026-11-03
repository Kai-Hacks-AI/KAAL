# kaal-defect record definition: Architecture

- **testing/A29** [testing/F98–testing/F101, testing/N21]: `kaal-testing/defect` exports `check(record)` and `state(record, runs)`.
  - **Where.** It is incubated in Testing's own `lib/defect.mjs`, under Testing's PLAN, DO and CHECK. It is not a package, a Skill or a separate export owner; a standalone `kaal-defect` is a later reviewed Change, and the npm package rule applies then.
  - **Imports.** It imports only `kaal-testing/model`, to read Run results; no other capability and no host module (`testing/N3`).
  - **Not deferred scope.** It does not need standalone `/red`, `/observe`, C33, C48 or composed-Plan execution, which #863 deferred. It adds nothing to 0.0.1 and is not a 0.0.1 prerequisite.
  - **Boundaries.** Requirements decides the obligation and `Serves`; Change places Cases in Plans; Guard reports; Engineering gates. None of them is imported.
