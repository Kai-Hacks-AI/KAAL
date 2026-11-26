# release/C159: the plain pull_request replacement of Promotion Source, on the controls path

## Reason
From 2 December 2026 the required checks that run on `pull_request_target` stop reporting (release/C153). Kai's ruling: the replacement is the moment to leave the old control structure, so it is built on the controls adapter path and verify Adapter can confirm it. Promotion Source (`promotion-source.yml`) runs `kaal-guard run --check Promotion-Source` on `pull_request_target`: it judges where a pull request comes from from the event refs alone and, for kaal, hotfix and wire heads, the check runs on the head commit read through the API with `checks: read`. Nothing of the candidate is fetched or run, so the same facts are available on plain `pull_request`. The Hosting adapter and the trust-boundary proof held by the CTO concern enforcement (the guard of `main`), not preparing a detective replacement.

## The contract
A plain `pull_request` workflow with `contents: read` and `checks: read` only, the same facts (repository, default branch, head repository, head ref, head sha, base ref) and a delivered entry `05-src/promotion-source/judge-promotion-source.mjs`, not `kaal-guard`. The entry runs the existing checker through the adapter in detective mode.

## As a control
A control record `release/CTL38` (Promotion Source, preventive, not yet required) and a delivery map row at the WIRE; the entry follows the C154 shape. The record `04-controls/CTL38-…` is part of the DO.

## Cases (parked red, ids by hand; on a clash the newer change renumbers)
- T1579: the source `05-src/wiring/workflows/promotion-source-plain.yml` exists, is plain `pull_request`, has the workflow name `Promotion Source on pull_request`, unique, and the detective job name `Promotion Source (plain pull_request)`, and runs the entry, not `kaal-guard`. Red until the DO.
- T1580: the entry `05-src/promotion-source/judge-promotion-source.mjs` imports the adapter by the real relative specifier and `recognizeIntegration` recognizes it. Red until the DO.

## DO
Add the source, the entry, and the control record. The DO renames the parked Cases unchanged. Each Case is green with the package suite.

## After it
ACT, PROMOTION, then a detective WIRE of the file, which needs the Owner's go and evidence before any enforcement swap (release/C153).

## Left open (with a recommendation)
- Whether the checker (`engineering/github/promotion-source.sh` and `lineage.ts`) exports a pure function over the facts. Recommendation as for Branching: Engineering exports it in its own Change if it does not.
- Whether a fork pull request gets `checks: read` on plain `pull_request`. Recommendation: the check says UNKNOWN when the checks cannot be read; the evidence shows how often. This repository takes no fork pull requests today.

## Not in this Change
No WIRE, ruleset change, required check or flag. The old workflow stays until its swap.
