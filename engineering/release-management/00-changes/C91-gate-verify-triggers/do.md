# C91 do

The DO adds, from the drafts in `interface.md`: `CTL20.md`, `F68.md`, `A63.md`, the third required check in `05-src/wiring/rulesets/promoting.json`, its declaration in `05-src/stages/stages.json` (traced to release/CTL20) and the amended workflow source `05-src/wiring/workflows/verify-triggers.yml` (it also runs on `merge_group`). T1129 to T1134 are renamed from `.red.mjs` to `.test.mjs` and pass.

## Cases amended

Ten Cases fixed the old shape and are amended in place to the new truth, none skipped or disabled:

- `release/C35` `helper.mjs`: the controls the declaration traces to now include release/CTL20 (release/I50). T483, T511 and T512 pass again through it.
- `release/T481`, `T482`, `T485`, `T513`, `T516`, `T733`: the exact list of required checks of Promoting is now `verify Stages (Promoting)`, `analyze Vulnerabilities (Promoting)`, `verify Triggers`; T516 counts one more check.
- `release/T1124`: the equality with the draft of release/C90 is dropped (superseded: the source is amended here and T1134 holds it to the C91 draft); the checkout assertion accepts the merge_group base.

`integrating.json` and the other four ruleset sources are unchanged; T1132 asserts it.

## Verified

`node --test engineering/cases/cases.test.mjs`: 252 tests, 240 pass, the same 12 pre-existing C15 failures (T268 to T279) as `main`.
