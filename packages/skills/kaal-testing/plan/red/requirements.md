# RED Evidence and Feature-Accepted Regressions: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **testing/N1** [testing/I3]: Classification and evaluation are pure and deterministic. They read nothing from the host, write nothing, and do not read the clock. Given the same observed runs, FAR outcome and policy, they give the same result.
- **testing/N2** [testing/I1]: A Test Case's identity is the capability-qualified `<capability>/T<n>` at the start of its leaf test title, such as `guard/T50`. It is never the test's position or its full title, so a reworded title keeps its identity.
- **testing/N4** [testing/I2, testing/I3]: One interpreter of runner events, and one notion of an observed run.
  - **Events.** Testing reads a `node:test` run only through its own reporter (`testing/A5`, `testing/C8`). No second reading of runner events exists.
  - **Observed runs.** A run counts as evidence only when it is an observed run that Testing produced in this process, under `testing/F8`'s provenance rule. A copied run, or one read back from JSON, is a claim, and counts as no run.

## Functional

- **testing/F1** [testing/I1]: `observe({ files, cwd })` runs the given test files under Testing's reporter. It returns an observed run, which records:
  - each file it was given, in one of three states:
    - **observed absent**, when no such file exists under `cwd`;
    - **complete**, with the SHA-256 of its bytes as run, when there is positive evidence that the file ran to the end: the runner reported the file's own summary, and no suite in it and not the file itself failed for a reason other than its subtests failing;
    - **incomplete**, with its SHA-256, in every other case, such as a file that failed to load, a suite whose declaration threw, a runner that stopped, or a file that reported no summary;
  - each test the runner executed, as `testing/F7` defines it: the file, the full suite path, and the outcome `pass`, `fail`, `skip` or `todo`.

  `accept` is the same observation, extended with packing, installation and provenance (`testing/F7`, `testing/F9`).
- **testing/F2** [testing/I1, testing/N2]: `outcomes(run)` reads an observed run by identity.
  - **Test Cases.** Each leaf test whose title starts with an identity is a Test Case. Suites are not Test Cases.
  - **GREEN and RED.** A test that passed is GREEN. Anything else is RED: one that failed, one that was skipped, or one marked `todo`. A skipped or `todo` test keeps its marker in the report, and is never GREEN.
  - **Unidentified.** A leaf test without an identity, such as a Code test, is not a Test Case. When it does not pass, it is an Unidentified RED, reported under its title and file.
  - **Duplicates.** An identity that occurs twice in one run is a finding.
  - **Not observed.** A value that is not an observed run gives no outcomes and one finding.
- **testing/F3** [testing/I2]: `classify({ head, base, far })` compares two observed runs of the same lane: the candidate (`head`) and its base (`base`, for a collector `main`). It classes every Test Case and every Unidentified RED in `head`. Each Test Case of `head`:
  - **GREEN** when it passed. It is reported as new GREEN when it is new by the rule below.
  - **Regression RED** when it is RED and the base observed it GREEN.
  - **Persisting RED** when it is RED and the base observed it RED.
  - **Feature RED** when it is RED and new. A Test Case is new only when the base observably lacked it. Either its file was observed absent on the base, or that same file was observed complete on the base (`testing/F1`) and the identity did not occur. The absence of a failure is never evidence of completion.
  - **Unknown baseline** when it is RED and the base gives no evidence either way. That covers a base that is not an observed run, a file the base was not given, and a base file observed incomplete. Unknown evidence is never read as absent or new (`testing/I2`).

  In addition, each Test Case the base observed GREEN that does not occur in `head` is a **Missing RED**: established behavior that is no longer tested.
- **testing/F4** [testing/I1, testing/I3]: `far` is the structured outcome of a Change's FAR decision, as Change hands it on. It is a list of decided entries. Each entry names:
  - `change`: the Change that decided it, as a capability-qualified Change id, such as `sample/C2`;
  - `tests`: the Test Case identities whose regression the Owner accepted, at least one.

  Testing checks only the shape it consumes. A malformed entry is a finding and accepts nothing. Who may decide, the decision's record, its authority and its scope belong to Change. Which decisions a gate hands in belongs to Engineering.
- **testing/F5** [testing/I1, testing/I3]: An accepted entry applies only to a Regression RED or a Missing RED with a listed identity.
  - **What it changes.** It marks that RED as accepted, under the deciding Change. It stays RED.
  - **What it never covers.** It never applies to a Feature, Persisting, Unidentified or Unknown-baseline RED, nor to any other identity.
  - **Stale entries.** A listed identity that is not a Regression or Missing RED in the run is reported as stale, so that Change can retire it.
- **testing/F6** [testing/I1]: `report(classification)` lists every RED with its identity, class and file. Each accepted RED also carries its deciding Change. The report then lists the stale entries and the findings. Counts give REDs by class, then accepted REDs, then GREEN and new GREEN. An accepted RED is counted as RED, and is never counted or shown as GREEN.
- **testing/F10** [testing/I3]: `evaluate(classification, policy)` returns `{ pass, blocking }`.
  - **The policy.** `policy.block` lists the classes a gate refuses: `regression`, `missing`, `feature`, `persisting`, `unknown` and `unidentified`.
  - **Blocking.** `blocking` is the sorted set of identities, and of titles of Unidentified REDs, in a blocked class, less the accepted Regression and Missing REDs.
  - **Always blocking.** Every finding blocks, whatever the policy: a duplicate identity, a run that is not observed, and a malformed FAR entry.
  - **Pass.** `pass` is true exactly when `blocking` is empty.
  - **Single subtraction.** Acceptance subtracts single identities, so accepting one regression never unblocks another.
  - **Malformed policy.** A policy naming no known class, or naming an unknown one, is a finding, so evaluation fails closed.
