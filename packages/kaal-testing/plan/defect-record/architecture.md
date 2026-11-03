# kaal-defect record definition: Architecture

- **testing/A29** [testing/F98–testing/F101, testing/N21]: `kaal-testing/defect` exports `check(record)` and `state(record, { model, runs })`.
  - **Where.** It is incubated in Testing's own `lib/defect.mjs`, under Testing's PLAN, DO and CHECK. It is not a package, a Skill or a separate export owner; a standalone `kaal-defect` is a later reviewed Change, and the npm package rule applies then.
  - **Imports.** It imports only `kaal-testing/model`, to read Run results; no other capability and no host module (`testing/N3`).
  - **Not deferred scope.** It does not need standalone `/red`, `/observe`, C33, C48 or composed-Plan execution, which #863 deferred. It adds nothing to 0.0.1 and is not a 0.0.1 prerequisite.
  - **Boundaries.** Requirements decides the obligation and `Serves`; Change places Cases in Plans; Guard reports; Engineering gates. None of them is imported.

## Open question (Owner, 3 Nov): a Defect with its RED Case in `main`, without a door for regression

Not decided here and not built by this PLAN; it belongs to the in-depth Defect management work. A plain RED Case breaks `main`'s CI, and a generic expected-to-fail, `skip` or `todo` marker can hide a real regression. Testing already forbids hiding: a skipped or `todo` test is RED and is reported (`testing/I1`, `testing/F2`), and an allowance leaves the Case `failed` and listed (`testing/F28`). Any answer must keep both.

Candidate approaches, to be weighed together, not as alternatives:

1. **Strict, exact expected failure.** A RED Case is admitted only as an expected failure pinned to the Case identity and version and to the Defect's `id`. If it passes unexpectedly, CI fails too, which forces the Defect to be answered (strict xfail).
2. **Ledgered expected-failure set.** The set of admitted expected failures is an explicit, versioned record that can only shrink without CPO approval. Growing it is a reviewed decision, like an Accept List entry.
3. **Separate reporting.** Defect Cases are reported apart from regression Cases (their own Plan, `testing/F101`), so the Regression Plan keeps meaning "must stay GREEN" and no Defect Case can sit inside it.
4. **Defect-only admission.** A Case is admitted only when it is the Case a confirmed Defect names (`testing/F99`); a Case with no Defect, or at another version, is a normal failure.

Questions to settle: who owns the ledger (the owning capability, with Change judging); how it differs from a FAR Accept List (a Defect is a failure not yet fixed; FAR accepts a deliberate change); how a gate or Guard reads it without Testing deciding; and what happens when the Case version changes while the Defect is open.
