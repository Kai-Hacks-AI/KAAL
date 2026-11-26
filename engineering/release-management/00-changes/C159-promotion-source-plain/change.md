# release/C159: the plain pull_request replacement of Promotion Source, on the controls path

## Reason
From 2 December 2026 the required checks that run on `pull_request_target` stop reporting (release/C153). Kai's ruling: the replacement is the moment to leave the old control structure, so it is built on the controls adapter path and verify Adapter can confirm it. Promotion Source (`promotion-source.yml`) runs `kaal-guard run --check Promotion-Source` on `pull_request_target`: it judges where a pull request comes from from the event refs alone and, for kaal, hotfix and wire heads, the check runs on the head commit read through the API with `checks: read`. Nothing of the candidate is fetched or run, so the same facts are available on plain `pull_request`. The Hosting adapter and the trust-boundary proof held by the CTO concern enforcement (the guard of `main`), not preparing a detective replacement.

## The contract
A plain `pull_request` workflow, `promotion-source-plain.yml`, with two jobs, one per verdict, each with its own result: `Promotion Source: origin (plain pull_request)` with no permission beyond `contents: read`, and `Promotion Source: head evidence (plain pull_request)` with `contents: read` and `checks: read`. Each runs its own delivered entry under `05-src/promotion-source/`, not `kaal-guard`: `judge-origin.mjs` and `judge-head-evidence.mjs`. Each entry runs its verdict through the adapter in detective mode. The facts are the same as the old workflow's (repository, default branch, head repository, head ref, head sha, base ref).

## As a control
Two control records, `release/CTL40` (Promotion Source: origin) and `release/CTL41` (Promotion Source: head evidence), each preventive when required and not yet required, each with its own Intent and delivery map row. Ids by hand; on a clash the newer change renumbers. Each entry follows the C154 shape. The records are part of the DO.

## Acceptance expectations (each verdict on its own)
- Origin (CTL40): not applicable when the base is not the default branch. PASS when the head is a `kaal/<capability>/*`, `hotfix/*` or `wire/*` branch of this repository. FAIL for any other head repository or ref, including a fork. UNKNOWN when a fact cannot be read.
- Head evidence (CTL41): for a promotion head, PASS only when every check the head's rulesets require is green on that exact head commit. FAIL when one is not green. UNKNOWN when the required checks or the check runs cannot be read. Missing check-run evidence is UNKNOWN, never a pass and never a silent fail.

## Cases (parked red, ids by hand; on a clash the newer change renumbers)
- T1579: the source `05-src/wiring/workflows/promotion-source-plain.yml` exists, is plain `pull_request`, has the workflow name `Promotion Source on pull_request`, unique, the two detective job names, `checks: read` only in the head evidence job, and runs the two entries, not `kaal-guard`.
- T1580: each of the two entries imports the adapter by the real relative specifier and `recognizeIntegration` recognizes it, with its own control id. Structure only.
- T1585: the origin entry gives the verdicts above for its fact sets: a `kaal/*`, a `hotfix/*` and a `wire/*` head of this repository pass; a fork head, a `feature/*` head and an other branch fail; a base that is not the default branch is not applicable. Behaviour, not structure.
- T1586: the head evidence entry passes only for all-green required checks at the head; a red or pending required check fails; absent check evidence is UNKNOWN, asserted as such (not any non-pass). Behaviour, not structure.
All red until the DO.

## DO
Add the source, the two entries and the two control records. The DO renames the parked Cases unchanged. Each Case is green with the package suite.

## After it
ACT, PROMOTION, then a detective WIRE of the file, which needs the Owner's go and evidence before any enforcement swap (release/C153).

## Left open (with a recommendation)
- Engineering dependency (CTO), answered in a plan: Engineering PLAN #2701 (engineering C41) exports `promotionOrigin(facts)` (the origin verdict plus the delivery stock, with today's messages) and `notGreen(head, checks)` (the reasons a head is not green on its exact commit), and composes `promotionSource` from the two with unchanged verdicts. The two entries import them. This DO waits for C41 to be approved and merged, then its DO.
- Whether a fork pull request gets `checks: read` on plain `pull_request`. Recommendation: the check says UNKNOWN when the checks cannot be read; the evidence shows how often. This repository takes no fork pull requests today.

## Not in this Change
No WIRE, ruleset change, required check or flag. The old workflow stays until its swap.

## Design: split and overlap
Split: two independent verdicts, two controls, as above: origin reads the event refs alone and needs no permission; head evidence reads the API and needs `checks: read`, so it sits in its own job. One failing does not hide the other.
Overlap, resolved here and not in DO. Nothing is dropped and no existing protection is reduced: the old workflow stays until each swap.
- Head evidence: not covered by any control on main. Kept.
- Origin: no control on main reads the head ref origin from the event. Verify Stages (CTL1) and the promotion ruleset govern which stages exist and which checks are required, not where a pull request comes from. Whether the live ruleset already refuses other origins is not demonstrated: it is not read here and is not assumed. So origin is kept. Demonstrating equivalence with a ruleset needs the ruleset read as evidence, and dropping it needs the Owner's decision, as for any unreplaced check.
