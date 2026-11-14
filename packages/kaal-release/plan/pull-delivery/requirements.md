# Pull Promotion: the next delivery is chosen by class, then the collector by value density (target)

Scoped `pull/` (ids are global). Nothing of pull/F25 to F42 is relaxed. Every action is advisory.

- **pull/F43. With a free seat, the next delivery is the eligible candidate of the highest class, HOTFIX then WIRE then KAAL; within KAAL it is the C9 choice.**
  - `laneStep` accepts an optional `deliveries`: a list of candidates `{class, source, name, out, in}`. A candidate is **eligible** only when `out` and `in` are both `PASS`. `FAIL`, `UNKNOWN`, a missing or any other value is not eligible, and a `source` that does not start with its class prefix (`hotfix/`, `wire/`, `kaal/`) makes it `UNKNOWN`.
  - The class is chosen first: the highest class with an eligible candidate. A class with no eligible candidate never blocks a lower class that has one.
  - Within KAAL the choice is `chooseNext` of pull/F38 over the eligible KAAL collectors, so value density never ranks a KAAL collector against a HOTFIX or WIRE. A KAAL choice is returned as `open-promotion` under the pull/F42 guard.
  - For HOTFIX and WIRE the result is the advisory action `select` with the `class` and `name`. It opens no PR and passes through no pulse, because their own OUT contract opens their PR.
  - Within HOTFIX or WIRE, more than one eligible candidate gives `judge` naming them. No eligible candidate and no unknown gives `wait`.
- **pull/F44. What is in stays in, and doubt is judged.**
  - With the seat held, the step is the holder's pull/F39 step whatever `deliveries` holds. A newly eligible higher class changes nothing: no cancel, no replace, no preempt.
  - If a higher class holds a candidate whose eligibility is `UNKNOWN` and a lower class has an eligible candidate, the result is `judge` naming both. A `FAIL` never causes this.
  - A candidate's eligibility is never invented from a missing field, a class that does not match its source, or an invalid list: those are `UNKNOWN`.
- **pull/F45. Without `deliveries` the step is unchanged, and the KAAL path stays guarded.** With no `deliveries`, every result equals the approved pull/F39 to F42 result. With `deliveries`, a KAAL selection is subject to the same open, trigger, cap and fail-closed rules, and no result mentions an approval or a merge.
- **pull/F40 (amended).** The advisory actions are `wait`, `judge`, `open-promotion`, `open-sync`, `ready-for-cpo` and `select`. There is still no approve or merge action.
