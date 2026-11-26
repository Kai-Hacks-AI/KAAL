# C152 change

## PLAN

Records the Defect release/D20 and its Case T1556, parked RED. The approval of this pull request is the go for the DO. No flag, ruleset, required check or WIRE.

### The decision from git

One pure function in `05-src/sync-review`, `appliesFromGit({ git, baseTipRef, mainRef, head })`, answers `sync`, `not-sync` or `unknown`:

- **sync** when `head` is a merge commit with exactly two parents, one of them the tip of the base, the other a commit reachable from the default branch and not from the base.
- **not-sync** for every other head that can be read: a commit that is not a merge, a merge of two commits of the collector, a merge whose second parent is not on the default branch.
- **unknown** when a fact cannot be read (a missing ref or object). Unknown is never not-sync.

### What changes in the DO

1. `cli.mjs verify` runs `appliesFromGit` first. For `not-sync` it says `PASS: not a SYNC, nothing to verify` with applies false and judges nothing; for `unknown` it says UNKNOWN; for `sync` it judges as today.
2. The three jobs of `sync-review.yml` lose the title condition and keep only the base condition (a base under `kaal/`, `hotfix/` or `wire/`); `approve` and `review` take the verdict of verify as data, as today, and act only when it says applies true.
3. `isSync` of the command line reads the applicability of the verdict, not the title.

### The write areas

Source and its unit tests only in the DO; the Case is the PLAN's and unchanged. The workflow source change reaches `.github` through a WIRE with the Owner's go.

### Cases

T1556 (parked RED): over a real throwaway git repository, a merge of main into the collector is `sync` whatever the title; a plain commit on the collector with the title `SYNC: ...` is `not-sync`; a merge of two collector commits is `not-sync`; a ref that is absent is `unknown`.

### Not in this Change

No WIRE, flag, required check or ruleset. No change to the Reason requirement (see the Defect). The parked form is the carrier the lanes have today, not a model (release/C136).
