# Pull Promotion: the lane is pulled by the freed seat (target)

Scoped `pull/` (ids are global). No earlier rule is relaxed. Every action is advisory: the function acts on nothing.

- **pull/F39. A freed seat pulls the next collector, a sync is opened on demand for the holder only, and a failed or unknown re-qualification never passes.**
  - `laneStep(state)` takes the seat (`null` or `{collector, pr}`), the Pull Promotion report (`qualifiers`, `next`), the declaration (`state.declaration`, for the ranking), whether the holder's PROMOTION is behind `main`, and the re-qualification of the holder at its exact head (`PASS`, `FAIL`, `UNKNOWN` or absent).
  - Seat free and `next` names a collector: `open-promotion` for it. Seat free and `next` is judged: `judge` with the candidates; nothing is opened.
  - Seat held and behind `main`: `open-sync` for the holder. Any other collector never gets a sync.
  - Seat held, current with `main`, re-qualification `PASS`: `ready-for-cpo`. `UNKNOWN` or absent: `wait`.
  - Seat held, current with `main`, re-qualification `FAIL`: the seat is released and the remaining qualifiers (the report's `qualifiers` without the holder) are ranked by the SAME rule as pull/F38, the exported `chooseNext` of the Script, called on that subset with the declaration (`state.declaration`). It is not a second algorithm and does not read the report's `next`, which may be the failed holder. One remaining qualifier: `open-promotion` for it. Several with one strictly highest comparable density: `open-promotion` for it. A tie, a missing or invalid `value`, `size` or `unit`, or different units among them: `judge`, naming the candidates. No remaining qualifier: `wait`.
  - Seat held and nothing changed: `wait`.
- **pull/F42. The lane cannot spam PRs: it opens at most one PR per trigger and per type, and anything doubtful fails closed to `judge`.** `laneStep` takes `state.pulse`: `open` (the open PRs, each `{type, collector}`), `closed` (PRs it opened that were closed, each `{type, collector, trigger}`), `trigger` (the id of the event that freed the seat or fell behind), `attempts` (PRs opened for this trigger) and `cap` (a positive integer).
  - Idempotent: an `open-promotion` or `open-sync` is returned only when no PR of that type is open for that collector; otherwise `wait`.
  - WIP 1 lane-wide: at most one PROMOTION and one SYNC are open at a time, whichever the collector. An open PROMOTION does not block a SYNC, nor the reverse.
  - No re-open without a new trigger: a closed PR of that type for that collector under the same `trigger` gives `wait`; a different `trigger` allows an open.
  - Capped: `attempts >= cap` gives `judge` with the reason that the cap is reached.
  - Fails closed: a missing or invalid `pulse`, `open`, `closed`, `trigger`, `attempts` or `cap` (not a list, not an id, not a non-negative or positive integer) gives `judge`, never an open. `wait`, `judge` and `ready-for-cpo` open nothing.
- **pull/F40. The function can neither approve nor merge.** Every action it can return is one of `wait`, `judge`, `open-promotion`, `open-sync`, `ready-for-cpo`. Approval stays a CPO act; an approval step is a separate, Owner-gated Change.
- **pull/F41. The PRs it asks for are the existing SYNC and PROMOTION, in their existing templates.** An `open-sync` action names `type: 'SYNC'` with the chapters `Change` and `Reason`; an `open-promotion` action names `type: 'PROMOTION'` with `Change` and `Why now`. The title shape is `<TYPE>: <description>`. The function adds no PR type, template or chapter.
