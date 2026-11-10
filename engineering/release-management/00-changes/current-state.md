# Present state (A)

- **approve Change (F15).** Target: F15. Current: the live ruleset `integration` (24952357) requires one approval and dismisses stale reviews on push, but not approval of the most recent push; `refs/heads/kaal/**` does not reach two-level collectors (`kaal/release/<name>`), so they have no ruleset. Ends when: release-management/F15/T1 is green.
