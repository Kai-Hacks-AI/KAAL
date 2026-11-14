# Pull Promotion: the next delivery is chosen by class, then the collector by value density (target)

Scoped `pull/` (ids are global). Nothing of pull/F25 to F42 is relaxed. Every action is advisory.

- **pull/F43. With a free seat, the next delivery is the eligible candidate of the highest class, HOTFIX then WIRE then KAAL; within KAAL it is the C9 choice.**
  - `laneStep` accepts an optional `deliveries`: a list of candidates `{class, source, name, out, in}`. A candidate is **eligible** only when `out` and `in` are both `PASS`. `FAIL`, `UNKNOWN`, a missing or any other value, an invalid candidate, or a `source` that does not start with its class prefix (`hotfix/`, `wire/`, `kaal/`) is not eligible.
  - The class is chosen first: the highest class with an eligible candidate. A class whose candidates are not eligible never blocks a lower class that has one, whether they are `FAIL` or `UNKNOWN`.
  - Within KAAL the choice is `chooseNext` of pull/F38 over the eligible KAAL collectors, so value density never ranks a KAAL collector against a HOTFIX or WIRE. It is returned as `open-promotion`.
  - For HOTFIX and WIRE the result is the advisory action `select` with the `class` and `name`. It opens, reserves and queues nothing.
  - Candidates that are not eligible and not `FAIL` (the `UNKNOWN` ones) are reported in the result as `unknown`, a list of names. `FAIL` is not reported.
  - `judge` only when no deterministic eligible choice exists: more than one eligible candidate in HOTFIX or WIRE (naming them), no eligible candidate while some are `UNKNOWN` (naming those), or a `deliveries` that is not a list. No eligible and no `UNKNOWN` candidate gives `wait`.
- **pull/F44. What is in stays in.** With the seat held, the step is the holder's pull/F39 step whatever `deliveries` holds. A newly eligible higher class changes nothing: no cancel, no replace, no preempt. Once the seat is free, the selection above applies.
- **pull/F45. One admission lane, guarded for every class, and unchanged without `deliveries`.**
  - With `deliveries`, a selection of any class, including `select`, is subject to the pulse guard of pull/F42 over the admission types PROMOTION, HOTFIX and WIRE: any open PR of those types (`pulse.open`) gives `wait`, so a selection cannot duplicate an open delivery or pass the boundary; a closed PR of the selected class under the same `trigger` gives `wait`; `attempts >= cap` gives `judge`; a missing or invalid pulse gives `judge`. A SYNC is independent.
  - The source of truth for an occupied lane is the seat and `pulse.open`, as the host reports them. The step trusts neither a claim that a source "opens its own PR" nor a title.
  - With no `deliveries`, every result equals the approved pull/F39 to F42 result, and no result mentions an approval or a merge.
- **pull/F40 (amended).** The advisory actions are `wait`, `judge`, `open-promotion`, `open-sync`, `ready-for-cpo` and `select`. There is still no approve or merge action.
