# C104 change

## PLAN

1. Add the interface in `interface.md`, rewrite the Case T583 and add the Cases T1267 to T1269, all RED.
2. Observe the expected RED and that each Case can pass with the drafts (`evidence.md`).
3. The PLAN adds no source file, changes no workflow, no `.github` file and no ruleset.

## The approach

A stored run record is a fallback, and one that points at a GitHub run loses its evidence when the run expires. A record that stays would also have to be judged and stamped as trusted. The acceptance is instead re-derived each time from a current run:

- `judgeAcceptance` is a pure function over facts from the host. PASS: the newest merge-queue run into `main` reports `analyze Vulnerabilities (Promoting)` from the expected integration (15368) with a verdict. FAIL: a recent run exists and does not. UNKNOWN: no facts, no run, a run older than 14 days, or unreadable facts.
- `accept.mjs` reads the facts with GET only, prints the record and stores nothing. It is run by hand now, and later by the Inspector.
- Release/T583 (tests release/G71) is rewritten: the judge and the reader exist, a fixture of a real queue run is judged PASS end to end, and no `acceptance.md` is stored.

It is a check run on demand, not a Case of the pull request suite, because it needs the host. Its verdict is current only when read.

## Ids

Change `release/C104`, Cases T583 (rewritten), T1267 to T1269, gap `release/G113`. Derived from `main` and the open collectors on 20 Nov 2026; release/C102 and C103 are the highest in use.

## DO

Not authorized by this PLAN. On the go of the Owner, into the collector of this Change:

1. Add `05-src/vulnerability-analysis/acceptance.mjs` and `accept.mjs` as `interface.md` specifies, and rename T583, T1268 and T1269 to `.test.mjs`.
2. Add `00-changes/C104-accept-analyze/equivalence.md`, equal to its draft, and rename T1267 to `.test.mjs`.

## What this does not decide

- Loading the `promoting` ruleset, and retiring `Dependency Review`, which is a WIRE.
- Whether a live old ruleset requires the context `Dependency Review`. It is not read here, and it must be checked before the workflow is deleted.
- Who runs `accept.mjs` on a schedule: that is the Inspector's, later.

## ACT

A 4L retrospective in `act.md`.
