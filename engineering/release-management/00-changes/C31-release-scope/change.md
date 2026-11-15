# C31 change

## PLAN

1. Add I25, F53, A48, the gap G66 and two Cases, both RED on `main`.
   - T292 (collector CHECK, a judge Case): the judge `05-src/scope/scope-judge.mjs` accepts a well-formed manifest and rejects a malformed one, and classifies Changes as delivered or missing. Its deliverable is absent today, so the Case is RED; the DO makes it green.
   - T293 (readiness Case, `.red.mjs`): the real manifest `05-src/scope/kaal-release-0.0.1.json` exists and every `required` Change in it is delivered. It stays RED until the scope is delivered, and it is never a prerequisite of the collector's ACT.
2. The PLAN declares no real scope, installs nothing, changes no existing delivery contract, wires no workflow or ruleset, bumps no version and publishes nothing.

## Relation to other release Changes

This is the first of many small steps for kaal-release 0.0.1. It does not take over C25, C26, C28, C29 or any Change another thread drives. Ids: C31, I25, F53, A48, G66, T292 and T293 were the next free ids on every remote branch on 15 Nov. C30 is left to the pull thread, which the CTO assessment provisionally gave it.

## DO

1. In the collector `kaal/release/scope`: `05-src/scope/scope-judge.mjs`. T292 is green.
2. A later DO: the first real manifest, once the owners of the listed Changes agree on what is `required`. Then T293 is renamed to `.test.mjs` only when the scope is delivered.

## ACT

A 4L retrospective of the Change, from the viewpoint of the agent that carried it, in `act.md`, before the promotion.

## Not in this Change

The real manifest, any workflow, ruleset or required check, a registry of versions, npm publication, and ordering or editing any Change in flight.
