# C32 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The CPO's two corrections each removed a conflation I had not seen from the inside. Release as a product entity and Release as a delivery are different things, and a manifest that lists both parts under one name invites a single "ready" answer. Splitting the report into scope completeness, the unserved Intents, product verification and publication readiness made the judge smaller and its Cases sharper: T330 asserts that no `ready` field exists and that a role on a Change is refused.

## Learned

A RED Case named `.test.mjs` fails CI, because CI runs every such Case and requires it to pass; a PLAN's RED Cases are `.red.mjs` and are renamed in the DO. A renumbering renames the folder and the ids but not the files inside it, and I left a stray `C31.md` in the C32 folder that no check caught. Case, Change and gap ids are claimed in parallel by many threads, so a free id can be taken within seconds; asking before taking a non-Case id and checking the other open pull requests would have avoided the collision with the hotfix thread. A red Branching right after toggling auto-merge is a stale run, not a verdict.

## Lacked

The first real manifest for kaal-release 0.0.1: which Intents form its contract and which Changes are committed. The host adapter that supplies the set of Changes delivered on `main` and the traceability function the judge takes as inputs. Definitions of product verification and publication readiness, which the judge reports UNKNOWN.

## Longed For

One reviewed DO for the first real manifest, agreed with the owners of the listed Changes, so that T331 can turn green. Then a Change that defines product verification against the contract Intents.
