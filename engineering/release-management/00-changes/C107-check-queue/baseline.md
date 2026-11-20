# C107 baseline

The baseline is the collector `kaal/release/hold-open-work` at `main` e3a096d, with no commit of its own.

- Nothing judges what is based on a branch being promoted. The checks of the `30 - promoting` station (`verify Stages`, `analyze Vulnerabilities`, `verify Triggers`) read the promotion's own content. `verify Sync` (CTL7) judges that a SYNC is a pure merge; no control reads other pull requests.
- The Dispatcher raises a PROMOTION when the ACT of a collector has merged. It decides readiness from the collector's records and does not read open pull requests.
- Highest ids on `main` and in open drafts, read on 20 Nov 2026: C106, F82, A72 and CTL26 (drafts of release/C105), I56, T1284. The ids below follow them and are confirmed again at the DO.
- Runner on this baseline: 314 tests, 298 pass, 16 fail (the same 16 fail on main).
