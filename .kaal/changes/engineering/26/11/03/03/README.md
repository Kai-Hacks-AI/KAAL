# Engineering: a non-matching ledger entry must not veto a matching one

Capability: Engineering. Collector: kaal/engineering. Record number is provisional until
integration.

## Intent

Codex, on SYNC #952, found that `check()` in `engineering/change-isolation/check.mjs` appends every
non-matching entry's diagnostics to the violations even when another entry over the same path set
admits the change. So an adopted (spent) entry that stays in the ledger would refuse the next
transition over the same paths. Triage (Engineering owns the checker): the finding is valid and in
scope, so it is a Defect confirmed by a Case, then fixed here.

## Design

- RED Case first: `check.test.mjs` "admits the matching entry when the ledger also holds a spent entry
  over the same paths". Run against the unchanged checker it failed.
- Fix: collect the diagnostics of non-matching entries separately and add them to the violations only
  when no entry admits. Order and wording of the diagnostics are unchanged.
- Second Case: when no entry over the paths matches, every broken commitment is still named.

The checker is read from the target, so this change reaches `main` only through its own focused
promotion. Nothing here changes the Hosting or Foundation entries.

## Scope and authorization

One checker function, its test file and this record. No `.github` change. No synchronization,
promotion or publication.
