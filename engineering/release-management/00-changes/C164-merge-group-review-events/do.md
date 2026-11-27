# release/C164 DO

## Implement

- `05-src/merge-group/group-state.mjs`: the one pure judgment `groupState({ required, runs, self })` giving waiting, red or green. The judged context is left out; neutral and skipped count as success; a group with nothing to wait for cannot be judged.
- `05-src/merge-group/wait-for-checks.mjs`: the wait extracted from `merge-group-review.yml`. It asks the one judgment until the group is green (exit 0), fails at once on a red required check (exit 1) and fails closed otherwise (exit 2). A refused read (rate limit, 429, 5xx) is retried with a growing wait, honouring a named retry time; a read that keeps failing is exit 2. The poll waits 20 seconds for the first minute, then grows to 120, so ten minutes of pending checks cost at most 20 reads.
- Cases T1600, T1601, T1602, `.red.mjs` renamed `.test.mjs`, expectations unchanged.

## Not delivered

- The event-driven completion (design questions 1 to 5 of the PLAN). Only resilient polling is delivered here.
- The installed `merge-group-review.yml` is unchanged. Using the script there is a WIRE on the Owner's go, and its workflow source comes with that WIRE.
