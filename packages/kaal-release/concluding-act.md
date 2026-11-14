# kaal/release/pull-lane: concluding ACT of the collector (4L)

This is the **concluding collector-level retrospective** of `kaal/release/pull-lane` (`pull/F39` to `pull/F45`): the qualification retrospective for the whole collected work. It replaces the file that concluded `kaal/release/pull-next`, which has been promoted to `main`. The retrospectives of the individual Changes stay where they are, as Change history: `plan/pull-lane` (`pull/C10`) and `plan/pull-delivery` (`pull/C11`). It is written after the last PLAN, DO and Case change of the collector, by the agent that carried both Changes.

## What the collector holds

- **The pull lane** (`pull/C10`): `laneStep(state)` in the Script, a pure advisory function. A freed seat pulls `next`; only the holder is synchronized; a failed re-qualification re-ranks the remaining qualifiers with `chooseNext`; the anti-spam rules of `pull/F42` bound the PRs it would open. It returns `wait`, `judge`, `open-promotion`, `open-sync` or `ready-for-cpo`.
- **The next delivery by class** (`pull/C11`): with an optional `deliveries` list, the eligible candidate of the highest class, HOTFIX then WIRE then KAAL, with the C9 choice inside KAAL, `select` for HOTFIX and WIRE, UNKNOWN reported and never blocking a known eligible lower class, the holder never preempted, and one admission lane over PROMOTION, HOTFIX and WIRE.
- **Cases** `pull/T40` to `pull/T46` (green), the README chapters "The lane step" and "The next delivery by class", and the exported `chooseNext`.

## Liked

- The CPO's reviews closed real gaps before any code: a failed holder is re-ranked by the C9 rule instead of a second algorithm, a closed PR under one trigger counts across collectors, an UNKNOWN higher class never stalls a known lower one, and the lane is occupied by any open PROMOTION, HOTFIX or WIRE.
- The step stayed a pure function. Every rule was a RED Case that went green by one function, with no workflow, App or ruleset touched.
- `deliveries` is optional, so the approved lane step could not regress.

## Learned

- A dependency between Changes shows up at the DO, not the PLAN: the lane needed C9 on `main` first.
- "At most one PR per trigger" is only true if closed PRs are counted across collectors.
- A class prefix on the source is a cheap check that a candidate is what it says it is.

## Lacked

- A statement from the host that this collector qualifies. This file does not claim it: the qualification is a separate run at the exact head after the SYNC, and its raw output is what counts, not this text.
- A gatherer that produces the pulse and the `deliveries` from the host, a caller, and a GitHub App identity. Nothing runs the step today.
- Recorded values, sizes and units, so the KAAL choice is judged whenever several qualify.

## Longed For

- A read-only gatherer of the pulse and the deliveries, with its own PLAN and Cases, before any wiring.
- The CPO's definition of the OUT and IN checks of a HOTFIX and a WIRE branch.
- The Owner's go on the GitHub App identity as a separate gated Change. Auto-approval, if ever wanted, is its own Change and never bypasses the CPO or a required check.
