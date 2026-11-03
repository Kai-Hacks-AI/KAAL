# kaal-defect record definition: Architecture

- **testing/A29** [testing/F98–testing/F101, testing/N21]: `kaal-testing/defect` exports `check(record)` and `state(record, { model, runs })`.
  - **Where.** It is incubated in Testing's own `lib/defect.mjs`, under Testing's PLAN, DO and CHECK. It is not a package, a Skill or a separate export owner; a standalone `kaal-defect` is a later reviewed Change, and the npm package rule applies then.
  - **Imports.** It imports only `kaal-testing/model`, to read Run results; no other capability and no host module (`testing/N3`).
  - **Not deferred scope.** It does not need standalone `/red`, `/observe`, C33, C48 or composed-Plan execution, which #863 deferred. It adds nothing to 0.0.1 and is not a 0.0.1 prerequisite.
  - **Boundaries.** Requirements decides the obligation and `Serves`; Change places Cases in Plans; Guard reports; Engineering gates. None of them is imported.

## Open question (Owner, 3 Nov): how a Defect and its RED Case enter `main`, and how the number is driven down

Not decided here and not built by this PLAN; it belongs to the in-depth Defect management work.

**The problem.** A plain RED Case breaks `main`'s CI, and a generic expected-to-fail, `skip` or `todo` marker can hide a real regression. Testing already forbids hiding: a skipped or `todo` test is RED and is reported (`testing/I1`, `testing/F2`), and an allowance leaves the Case `failed` and listed (`testing/F28`). Any answer must keep both.

**The Owner's model: accepted defects with a ratchet.**

- **Accepted defect.** The structured way a Defect and its RED Case enter `main`: a record that a known Defect (`testing/F98`, confirmed under `testing/F99`) is accepted for now. It is not a skip. The Case stays RED and visible.
- **Ratchet.** The accepted set can only shrink. A new entry needs explicit acceptance; removal needs no approval and is the goal. A Defect leaves the set only when its Case turns GREEN at the same version (`testing/F99`, `F100`), and nothing re-enters without the same explicit acceptance.

**Mechanisms under that model**, to be weighed together, not as alternatives:

1. **Strict, exact admission.** An entry is pinned to the Defect's `id` and the Case's identity and version. If the Case passes unexpectedly, CI fails, which forces the entry out (strict xfail). A RED Case with no entry, or at another version, is an ordinary failure.
2. **A ledger of accepted defects.** The set is an explicit, versioned record whose size can only go down without CPO approval. Growth is a reviewed decision, like an Accept List entry.
3. **Separate reporting.** Accepted Defect Cases are reported apart from regression Cases (their own Plan, `testing/F101`), so the Regression Plan keeps meaning "must stay GREEN" and no accepted Case can sit inside it.
4. **Defect-only admission.** A Case is admissible only when it is the Case a confirmed Defect names (`testing/F99`).

**A concrete instance** is engineering/D1 with its Case engineering/T82 (#1002). The Case is RED by design and wired into no suite, so CI never runs it. That keeps `main` green, but nothing shows a silent pass or a rotting Case, and the Defect is never marked answered. Under the model, D1 would be an accepted-defect entry whose Case is run and reported, and a pass would fail CI until the entry is removed. The instance also shows that the correction may change the shape of the code the Case reads, so "GREEN, unmodified" needs a Case that finds its subject by intent, or a new Case version with its own confirming Run (`testing/F99`).

**Open points.**

- **Ownership.** Who owns the ledger: the owning capability, with Change judging acceptance and Testing supplying only the evidence rules (`testing/F101`).
- **Relation to the FAR Accept List.** A FAR entry accepts a deliberate regression of established behaviour; an accepted defect records a failure not yet fixed. Whether they share a form, and whether the ratchet applies to both, is open.
- **Reading it.** How a gate or Guard reads the ledger without Testing deciding.
- **Case version changes.** What happens to an accepted entry when the Case version changes while the Defect is open.
