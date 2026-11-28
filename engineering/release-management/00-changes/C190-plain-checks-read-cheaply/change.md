# release/C190: the plain check of Promotion Source reads GitHub once and wait cheaply, with a failed read retried

## Reason
The workflow token is a shared budget, and the plain replacements of release/C153 are about to run on every pull request event. One of them spends it without need (found by Operations, 28 Nov; the Branching rules read stays as it is, because an `auto_merge_enabled` event does not guarantee a fresh required judgment at an already-green head, CPO 28 Nov):
- **Promotion Source: head evidence** (`promotion-source/judge-head-evidence.mjs` through `lib/run.mjs`) waits for a required check that is still running by reading again every 20 seconds, up to 30 times, and each tick reads the rules of the head ref and the check runs of the head (two paginated reads). The rules cannot change inside the wait, so the rules read is waste. And a tick whose read fails ends the whole run UNKNOWN at once: that single failed read, in the middle of a wait, is what stopped release/C168. The old script did not stop there.

## The contract
1. **Rules once.** The head evidence entry reads the rules of the head ref once per run and keeps them for the ticks of the wait. Only the check runs are read again.
2. **Stretching interval.** The interval between reads grows (20, 20, 30, 30, 45, 45, then 60 seconds) and the wait keeps the same total: 10 minutes as before, with fewer reads. `KAAL_ATTEMPTS` and `KAAL_INTERVAL` still override.
3. **A failed read inside the wait is retried.** A read that fails after at least one good read, or at the first tick, is retried at the next tick for up to three consecutive failures; the verdict is UNKNOWN only when the third in a row fails or the wait ends. A failure is always said in the output, and an UNKNOWN is never a pass.
4. **No check is weakened.** What passes, reports, is unknown or is not applicable stays the same for the same facts; only the number of reads and the handling of a failed read change.

## Cases (parked red, ids by hand; on a clash the newer change renumbers)
- T1700: with a stand-in for the reads, the head evidence entry reads the rules once and the check runs once per tick over a wait of several ticks.
- T1701: the intervals are the stretching series, the total wait is not shorter than 30 times 20 seconds, and the two overrides still apply.
- T1702: a read that fails at one tick and succeeds at the next gives the verdict of the facts, not UNKNOWN; three failures in a row give UNKNOWN and say each failure; a failure never gives a pass.
All red until the DO.

## DO
`lib/run.mjs` (the series, the retry), the rules read of `judge-head-evidence.mjs`, with the Cases. Sources only: the installed workflows change by WIRE (Owner go) like any other.

## Not in this Change
No WIRE, ruleset, flag or policy change. Branching audit (`engineering/github/lineage.ts`, Engineering) and the wait of merge-group-review (release/C172) are separate.

## Design: split and overlap
Split: none. Overlap: release/C172 (the merge-group wait) and Engineering's Branching audit, both for the same budget.
