# C32 change

## PLAN (revised 15 Nov after the CPO re-review of a897e72)

1. Model the two meanings of Release apart. The static Release (`product x.y.z`) points at Intents, retained ones included. The delivery operation points at Changes, its delivery scope. Existing Change to Intent traceability connects them; nothing is duplicated and the Intent set is never inferred from one delivery.
2. The delivery scope is a commitment. Every declared Change is committed, with no `required` or `optional` role; candidate Changes under consideration stay outside the manifest. Scope completeness means every declared Change is delivered on `main`.
3. Add I25, F53, A48, the gap G67 and two Cases, both RED on `main`.
   - T330 (collector CHECK, a judge Case): the judge `05-src/scope/scope-judge.mjs` reports `deliveryScope`, `contract.unserved`, `productVerification` and `publicationReadiness` separately, gives no `ready` field, and rejects malformed manifests. Its deliverable is absent today, so the Case is RED and is kept as `.red.mjs`; the DO makes it green and renames it to `.test.mjs`.
   - T331 (readiness Case, `.red.mjs`): the delivery scope of kaal-release 0.0.1 is declared in `05-src/scope/kaal-release-0.0.1.json` and every Change in it is delivered. It stays RED until then and is never a prerequisite of a collector's ACT.
4. Scope completeness is the only thing judged. Product verification and publication readiness are reported UNKNOWN until their own Changes define them.
5. The PLAN declares no real contract or scope, installs nothing, wires no workflow, hook or ruleset, bumps no version and publishes nothing. It is the model and the first bounded check, not a release engine.

## Relation to other release Changes

This is the first of many small steps for kaal-release 0.0.1. It does not take over C25, C26, C28, C29 or any Change another thread drives. Ids: C32, I25, F53, A48 and G67 were the next free ids on every remote branch on 15 Nov. T330 and T331 come from the block T330 to T339 assigned to this thread. C30 is left to the pull thread and C31 was taken by the hotfix thread (#1691).

## DO

1. In the collector `kaal/release/scope`: `05-src/scope/scope-judge.mjs`. T330 is green and renamed to `.test.mjs`.
2. A later DO: the first real manifest, once the owners agree on the contract Intents and commit the Changes.
3. Later Changes, each its own PLAN: product verification, publication readiness.

## ACT

A 4L retrospective of the Change, from the viewpoint of the agent that carried it, in `act.md`, before the promotion.

## Not in this Change

The real contract or scope, product verification, publication readiness, any workflow, ruleset or required check, a registry of versions, version bumps, npm publication, and ordering or editing any Change in flight.
