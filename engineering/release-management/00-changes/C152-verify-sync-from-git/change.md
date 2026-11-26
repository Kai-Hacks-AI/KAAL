# C152 change

## PLAN

Records the Defect release/D20 and its Case T1556, parked RED. The approval of this pull request is the go for the DO. No flag, ruleset, required check or WIRE.

### The decision from git: applicability and validity are two answers

One pure function in `05-src/sync-review`, `appliesFromGit({ git, baseTipRef, mainRef, head })`, answers two things that are never merged:

- **Applicability, `applies`: is this an attempt at a SYNC?** `sync` when `head` is a merge commit that brings the default branch in: exactly two parents, one of them reachable from the default branch and not from the base. `not-sync` for every other head that can be read: a commit that is not a merge, a merge of two collector commits, a merge whose parents are all on the collector. `unknown` when a fact cannot be read (a missing ref or object) **or the shape is ambiguous** (more than two parents, both parents on the default branch): unknown is never not-sync.
- **Validity, `valid`: is the attempt a good SYNC?** Only asked when `applies` is `sync`. It is valid when the other parent is the **current** tip of the base. A SYNC prepared against an older collector tip stays `applies: sync` when the collector advances; it is `valid: false` with the reason `stale base`, and verify Sync judges it (a finding), it never turns into `not-sync` or a PASS because the base moved.

Applicability decides whether the control judges; validity is part of what it judges.

### What changes in the DO

1. `cli.mjs verify` runs `appliesFromGit` first. For `not-sync` it says `PASS: not a SYNC, nothing to verify` with applies false and judges nothing; for `unknown` it says UNKNOWN; for `sync` it judges as today and adds validity: a stale base is a finding.
2. The three jobs of `sync-review.yml` lose the title condition and keep only the base condition (a base under `kaal/`, `hotfix/` or `wire/`); `approve` and `review` take the verdict of verify as data, as today, and act only when it says applies true.
3. `isSync` of the command line reads the applicability of the verdict, not the title.

### The write areas

Source and its unit tests only in the DO; the Case is the PLAN's and unchanged. The workflow source change reaches `.github` through a WIRE with the Owner's go.

### Cases

T1556 (parked RED): over a real throwaway git repository, a merge of main into the collector is `sync` and valid whatever the title; a plain commit titled `SYNC: ...` is `not-sync`; a merge of two collector commits is `not-sync`; a SYNC prepared against an older collector tip, after the collector advanced, is still `sync`, `valid: false` for a stale base; an octopus merge is `unknown`; an absent ref is `unknown`.

### Not in this Change

No WIRE, flag, required check or ruleset. The `Reason` body requirement of a SYNC is not decided from git and does not belong to this control: it moves to verify Envelope (release/CTL11), which reads bodies against the declared template, and verify Sync stops reading the body for it when that is installed. No change to it in this Change. The parked form is the carrier the lanes have today, not a model (release/C136).

### Amendment: T1556's octopus

The parked Case built its octopus with a side line that the collector already held, so git dropped the redundant parent and the head was a plain two-parent merge, a valid SYNC by this PLAN's own rule. The Case now uses a second side line that is not merged yet and asserts the head has three parents, so it pins what it says: an ambiguous shape is `unknown`. No expectation of the PLAN changes.

T757 (release/C58) pinned the title condition of the three jobs (`startsWith(...title, 'SYNC:')` three times). It is amended here, parked: no job reads the title, and the base condition stays. The DO satisfies it without changing it. The other Cases of the sync review (T754 to T759, T791 to T793, T851 to T855, T936) hold as they are, and the DO runs them.
