# C84 interface

Drafts of the files the DO places under `engineering/testing/`, following `packages/kaal-engineering/skills/kaal-engineering/references/package-layout.json`. Each draft matches its placed file after the DO.

## Draft of I52.md

`````
---
id: testing/I52
title: Evidence names the content it examined
---
# testing/I52 Evidence names the content it examined

Contract: a record of evidence corresponds to the content that was actually examined, and says which content that is by an identity the consumer can compare. The consumer establishes which content it examined; Testing checks the evidence against that identity. A record whose identity is not the examined one, or has none, is evidence of nothing: whatever it carries is UNKNOWN, and the record says which of these it is. The identity is opaque to Testing. How content is identified, where it comes from and what triggered a run are facts of Hosting and of the source, not Testing concepts, and Testing requires no identity format. The contract is common, so that no caller has to remember it. Whether the identity really belongs to the content examined is for whoever provides the content and its provenance, not for this check. Reason: release/D20 recurred in three checks, each repaired on its own line, because each record named something that did not identify what the check judged, so a verdict could not be matched to the content it was about. Owner: testing.
`````

## Draft of F177.md

`````
---
id: testing/F177
title: identity
kind: functional
serves: [testing/I52]
---
# testing/F177 identity

`kaal-testing/identity` exports `checkIdentity({ recorded, examined })`, pure, which returns `{ ok, findings }`. An identity is a string with at least one character that is not whitespace, and nothing more: no format is assumed, and two identities are equal when the strings are equal, with no change of case. `examined` is the identity of the content the consumer examined, `recorded` is the identity a record names. The findings, in this order, each `{ kind, detail }`: `examined-identity-missing` when `examined` is not an identity, `recorded-identity-missing` when `recorded` is not, and, when both are identities and differ, `recorded-not-examined`, whose detail shows both. `ok` is true only without a finding. The function reads no file, no environment and no source, and does not change its input. `assembleObservation` passes `revision` as `recorded` and `expectedRevision` as `examined` and adds each finding to `evidence.integrity`; with a finding every Case is UNKNOWN and the catalog is not complete. A record whose two identities are equal is unchanged. The command `kaal-testing observe-at` keeps its flags: `--revision` is the recorded identity and `--expect-revision` the examined identity, and a missing one is invalid input, as before. The record decides no verdict.
`````

## Draft of A63.md

`````
---
id: testing/A63
title: identity
serves: [testing/F177]
---
# testing/A63 identity

`lib/identity.mjs` is a pure function and holds the meaning of an examined identity for evidence; `lib/observation.mjs` calls it and puts its findings with the integrity findings of the run report, the form it already has for an input that cannot be trusted. Testing does not resolve or interpret an identity: it takes the recorded and the examined identity as strings and reads no source, so the lib stays inside the Hosting boundary it has and carries no Git, branch, event or trigger concept. The contract has three parts with three owners, and this Change is the first: Hosting provides the content and its provenance, with an identity for it; the consumer establishes which content it examined; Testing checks the evidence against that identity. Release keeps its repaired records and can call the check later. The existing names `revision` and `expectedRevision` of the observation record and of its command stay, so no reader changes. Rejected: a required identity format (it would put a source in Testing), a typed identity now (a larger contract than this need), and rewriting Release's records here (another capability's files). Residual: the check compares identities and does not know what was examined, so a producer that names an identity that does not belong to the content, or a consumer that takes its examined identity from where the record took its own, is not caught; only the provider of content and provenance prevents that.
`````
