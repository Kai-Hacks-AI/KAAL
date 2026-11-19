# C94 baseline

The baseline is the collector `kaal/release/verify-hotfix` at 7712758 (the merged PLAN of 19 Nov), which is `main` at 189662e plus the PLAN. `main` has since moved on by four commits, among them the Run of Cases (testing/C63, #2012), which this control uses. A SYNC of `main` into the collector is therefore due before the DO (`packages/kaal-testing/lib/run.mjs` and the `kaal-testing` bin are absent on the collector).

- The Defect chapter of a Hotfix is checked for content and for the shape of the reference by the envelope judge (release/F17, release/CTL11), not followed to a record.
- Defects are recorded per capability in `<home>/06-defects/D<n>-*.md`, with a JSON record whose `tests` list names the reproducing Cases (for example `packages/kaal-hosting/06-defects/D10-multiline-conditional-selector.md`). Their Cases are `node:test` files whose test names lead with `<namespace>/T<n>`.
- `main` is GREEN. A RED Case is therefore not on `main` to be found: a Hotfix brings its Defect record and its Case itself. On a Hotfix branch the first commit is RED and a later commit may be GREEN.
- The Run of Cases (`kaal-testing run`, testing/F138 to F145) runs Case files with `node --test`, attributes tests to a Case by their leading `<namespace>/T<n>`, classifies RED only for an assertion failure and everything else that is not a pass as UNKNOWN, exits 0 whenever a report is produced, and requires Node 24.
- No control reads a Hotfix against its Defect or runs its Case. Hotfix pull requests go into a `hotfix/<name>` base from a head not under `hotfix/` (release/C67).
- release/C31 (`kaal/hotfix/defect-only-diff`, deleted, PR #1712 closed) held a judge module and two Cases that never reached `main`, and read the Defect and its Case from the base.
- release/CTL1 to CTL20 are the controls of the release capability; CTL19 and CTL20 are the pattern for a detective control with a workflow source.
