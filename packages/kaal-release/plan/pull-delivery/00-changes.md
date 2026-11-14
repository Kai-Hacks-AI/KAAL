# Pull Promotion: choose the next delivery by class, then the collector by value density (Change A to B)

This is `pull/C11`, a PLAN Change. It ships no code, installs nothing and changes no ruleset or workflow. It carries out the Owner's decision of 14 Nov 2026: **HOTFIX > WIRE > KAAL PROMOTION**, applied when the lane selects its next delivery, never to a delivery already admitted. Guiding rule: what's in stays in; priority decides what's next. It authorizes preparation, not promotion or publication.

## Assessment of C9 and C10

- **C9 (`chooseNext`)** ranks qualifying collectors by value density, or judges what it cannot compare. It knows only KAAL collectors: its candidates are the report's `qualifiers`. It is correct inside KAAL PROMOTION and must stay unchanged.
- **C10 (`laneStep`)** assumes one kind of delivery: a collector PROMOTION. A free seat pulls the report's `next`; the holder is synced, re-qualified, and on FAIL replaced by `chooseNext` of the others. Its anti-spam pulse, attempt cap and fail-closed rule are keyed on the PR type. It has no notion of a HOTFIX or WIRE delivery, so today such a delivery is outside the lane the step reasons about.
- **What is already right.** The seat is the lane's WIP 1, so a delivery that occupies it continues; the step is advisory; doubtful input goes to `judge`. These are kept.

## A: the present

The next delivery is always the next KAAL collector. Whether a HOTFIX or a WIRE should go first is decided by people, case by case.

## B: the target

When the seat is free, `laneStep` decides in this order and no other:

1. **Eligibility** (a fact about each candidate, at its exact head): the candidate's **OUT** qualification is PASS and **main's IN** requirement for that source is PASS. Only PASS and PASS is eligible. FAIL is known not eligible. UNKNOWN, a missing field, an invalid candidate or a source that does not match its class is not eligible either and is reported as a finding; it is never invented as eligible, and it does not reserve priority.
2. **Selection** (a choice among eligible candidates): the highest class that has an eligible candidate, HOTFIX, then WIRE, then KAAL. A higher class whose candidates are FAIL or UNKNOWN does not block a lower class that has an eligible candidate; the UNKNOWN candidates are reported alongside the choice. Within KAAL the candidate is chosen by C9's `chooseNext` over the eligible collectors, so value density never competes with HOTFIX or WIRE. Judgment is requested only when no deterministic eligible choice exists: more than one eligible candidate in HOTFIX or WIRE (no rule orders them), no eligible candidate while some are UNKNOWN (a person must check them), or an input that is not a list at all.
3. **Admission** (a delivery PR into `main`): one admission lane. The facts that say it is occupied are the seat (the holder) and `pulse.open`, the PRs open or queued into `main` as the host reports them. Any open PROMOTION, HOTFIX or WIRE occupies the lane, so a selection of any class waits while one is open; a closed delivery of that class under the same trigger waits; the attempt cap and an invalid pulse go to `judge`. This is C10's pulse guard widened from "PROMOTION" to the three admission types, so a selected HOTFIX or WIRE cannot duplicate an open delivery or pass the boundary. The SYNC stays independent. For HOTFIX and WIRE, `select` is advisory: it does not open, reserve or queue anything, and the source's own OUT contract opens its PR.
4. **Completion** (the PR lands on `main`): the seat is freed. That is the only trigger for the next selection.

**Non-preemption.** While the seat is held, the holder's step is C10's, whatever else becomes eligible. A HOTFIX that appears is not selected over a holder, and nothing is cancelled or replaced.

**UNKNOWN.** An UNKNOWN candidate is not PASS and so is not eligible, and it does not stall a known eligible lower class: the lower class is chosen and the UNKNOWN candidate is reported as a finding. One consequence is stated, not hidden: a HOTFIX that is UNKNOWN now and becomes eligible after a lower class was selected waits for the next free seat, because what is in stays in.

## SIPOC IN/OUT integration

The three paths reuse the SIPOC contracts KAAL already has. Each source has its own OUT, `main` has its IN:

- `hotfix/<name>`: OUT, then IN, then `main`.
- `wire/<name>`: OUT, then IN, then `main`.
- `kaal/<collector>`: OUT (Pull Promotion's qualification at the exact head), then IN, then `main`.

`laneStep` is given, per candidate, `class`, `source`, `out` and `in` (each `PASS`, `FAIL` or `UNKNOWN`), and judges only those. It reads no host and runs no check. **The class comes from the source's branch prefix as Engineering's delivery controls enforce it, not from a PR title.** A candidate whose `source` does not carry its class's prefix (`hotfix/`, `wire/`, `kaal/`) is treated as UNKNOWN.

## Dependencies

- **WIRE C27** ([PLAN #1651](https://github.com/Kai-Hacks-AI/KAAL/pull/1651), WIRE as a delivery operation): defines the `wire/*` path and its OUT contract. The step reads `out` for WIRE as that Change defines it. Until C27 is on `main` nothing supplies WIRE evidence, so a WIRE candidate is UNKNOWN and the step behaves as if there were none.
- **HOTFIX controls** (the HOTFIX template and Cases already on `main`, #1530 and #1636): they define the HOTFIX path. The same applies to `hotfix/*` evidence.
- **Engineering's `main` protection**: one coherent policy with delivery-type-specific checks for the three paths is Engineering's, reviewed and activated separately with the Owner's authorization. This PLAN touches no ruleset and reads only the evidence those controls produce.

## Not in this Change

No workflow, App, ruleset, hook or declaration change. The C10 implementation is not reopened: this adds an optional `deliveries` input, and without it `laneStep` behaves exactly as approved. `chooseNext` is unchanged. One consequence is stated, not hidden: F40 gains a sixth advisory action, `select`, so the DO updates `pull/T41`'s list of allowed actions. There is still no approve or merge action.

## Open questions for the CPO

1. Two eligible HOTFIX (or WIRE) candidates: `judge` (proposed), or an order the Owner gives?
2. The lane-occupancy facts (`seat`, `pulse.open`) are given by a gatherer that does not exist yet. It is a separate read-only Change; until then nothing supplies them and the step stays advisory.

## Order

PLAN (this), then DO (the extension in the Script, README, T43 to T46 to green and T41 updated), ACT, then it joins the pull-lane concluding ACT, SYNC and PROMOTION. Collector: `kaal/release/pull-lane`, which already carries `laneStep`.
