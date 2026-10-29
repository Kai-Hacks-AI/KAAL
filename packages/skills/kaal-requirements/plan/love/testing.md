# Packaging Readiness (LOVE): Testing

The planned outer tests will live in `packages/skills/kaal-requirements/test/plan/love.test.mjs`, written in `requirements/C6` and turned GREEN by `requirements/C7`, except requirements/T13, which turns GREEN in `requirements/C9`. Each title names the contracts it checks. They are immutable to DO and CHECK. Core's conformance Test Cases are Core's: Engineering runs them against `contract.json`, and Requirements does not copy them. What RED and GREEN mean, and what counts as evidence, is Testing's.

| Test | Checks | Loop |
| --- | --- | --- |
| requirements/T9: `contract.json` names Core's `Installation Contract` as its format, the Capability `requirements`, the package's version, one `file` asset per Node from `capability/<file>` to `.kaal/capabilities/requirements/<file>` without `surface`, the record `.kaal/state/requirements/installation.json`, Node 24, and an empty `provides`; `checkContract` finds nothing | requirements/F7, requirements/N4 | Requirements |
| requirements/T10: for every asset, the catalogue holds exactly the SHA-256 of its shipped bytes, and the contract's version equals `package.json`'s | requirements/F7, requirements/F8 | Requirements |
| requirements/T11: the Node `Requirements` states that a condition that must not hold is still stated as a Requirement, and that a Defect's record is its owner's; it is admitted as a Capability, and the ownership claim names its new id | requirements/F10 | Requirements |
| requirements/T12: the packed package holds exactly its Nodes, `contract.json`, README, LICENSE and `package.json`, exports only `./package.json`, and the README names each Node and the contract | requirements/F11, requirements/A10 | Architecture |
| requirements/T13: **lifecycle.** A consumer installs the packed package through its contract into a fresh Engine, which verifies. Upgrading to a version with one changed Node replaces it and records the new version. A consumer-modified Node is kept and reported. Removing removes only the unmodified recorded Nodes, the Engine still verifies, and a `Placement Observation` the consumer kept is untouched | requirements/F9, requirements/I4 | Acceptance |
| requirements/T14: no file the package ships imports a module, and its `package.json` has no `dependencies` | requirements/N3 | Architecture |

requirements/T13 is RED until `core/C29` lands, **blocked before behavioural assertion**: no Core path applies a Capability's Node assets. It runs outside the package's `npm test` until then, so the collector's lanes stay green.

## RED evidence

At `requirements/C6`, four tests are RED and requirements/T14 is GREEN, as planned. They run with `npm run build -w kaal-hosting -w kaal-core && node --test packages/skills/kaal-requirements/test/plan/love.test.mjs`, outside the package's `npm test` until `requirements/C7`, so the collector's lanes stay green.

| Test | Result at `requirements/C6` |
| --- | --- |
| requirements/T9 | RED, **blocked before behavioural assertion**: `contract.json` does not exist. `kaal-core/installation` also reaches `kaal/requirements` only with its promotion SYNC, so `requirements/C7` follows that SYNC |
| requirements/T10 | RED, **blocked before behavioural assertion**: `contract.json` does not exist |
| requirements/T11 | RED on its behavioural assertion: the Node does not state the Defect boundary |
| requirements/T12 | RED on its behavioural assertion: the packed package does not hold `contract.json` |
| requirements/T14 | GREEN: it guards `requirements/N3` through the DO Change, and no Defect traces to it |
| requirements/T13 | **DEFERRED, a coverage gap**: not written, not passing and not complete. It depends on `core/C29` (proposed) and is written in `requirements/C9` |

requirements/T13 is not written at `requirements/C6`. Its install, upgrade and remove steps call Core's contribution lifecycle, and `core/C29` has not named that interface yet. A test written against a guessed interface would fabricate its RED. It is written, and recorded, in `requirements/C9`, once `core/C29` is on `kaal/requirements`. Until then, Requirements' lifecycle has no independent evidence: no readiness or release judgement may count requirements/F9 as covered, and the README states the gap to consumers.
