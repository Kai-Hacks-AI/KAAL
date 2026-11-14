# Pull Promotion: the lane is pulled by the freed seat (target)

Scoped `pull/` (ids are global). No earlier rule is relaxed. Every action is advisory: the function acts on nothing.

- **pull/F39. A freed seat pulls the next collector, a sync is opened on demand for the holder only, and a failed or unknown re-qualification never passes.**
  - `laneStep(state)` takes the seat (`null` or `{collector, pr}`), the Pull Promotion report (`qualifiers`, `next`), whether the holder's PROMOTION is behind `main`, and the re-qualification of the holder at its exact head (`PASS`, `FAIL`, `UNKNOWN` or absent).
  - Seat free and `next` names a collector: `open-promotion` for it. Seat free and `next` is judged: `judge` with the candidates; nothing is opened.
  - Seat held and behind `main`: `open-sync` for the holder. Any other collector never gets a sync.
  - Seat held, current with `main`, re-qualification `PASS`: `ready-for-cpo`. `FAIL`: `open-promotion` for the best other qualifier (the holder excluded), or `judge` if none. `UNKNOWN` or absent: `wait`.
  - Seat held and nothing changed: `wait`.
- **pull/F40. The function can neither approve nor merge.** Every action it can return is one of `wait`, `judge`, `open-promotion`, `open-sync`, `ready-for-cpo`. Approval stays a CPO act; an approval step is a separate, Owner-gated Change.
