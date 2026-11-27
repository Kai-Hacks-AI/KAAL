# C84 interface

Drafts of the files the DO places under `engineering/testing/`, following `packages/kaal-engineering/skills/kaal-engineering/references/package-layout.json`. Each draft matches its placed file after the DO.

## Draft of I52.md

`````
---
id: testing/I52
title: Evidence names the revision it judged
---
# testing/I52 Evidence names the revision it judged

Contract: a record of evidence names the revision that was judged (the head of the pull request, or the commit of the checkout that was examined), as a full commit id, and never the revision that triggered the run. A record whose revision is not the judged one, or is the trigger, or is not a revision at all, is evidence of nothing: whatever it carries is UNKNOWN, and the record says which of these it is. The contract is common, so that no caller has to remember it: Testing defines it and checks it, Hosting says what was judged, and a caller supplies both. Whether the named revision is what was really examined is for the one who resolves it, not for this check. Reason: release/D20 recurred in three checks, each repaired on its own line, because each caller took the revision of the run from the variable of the trigger (on a `pull_request`, the test merge commit), so a verdict could not be matched to the revision that was judged. Owner: testing.
`````

## Draft of F177.md

`````
---
id: testing/F177
title: revision
kind: functional
serves: [testing/I52]
---
# testing/F177 revision

`kaal-testing/revision` exports `checkRevision({ recorded, judged, trigger })`, pure, which returns `{ ok, findings }`. A revision is a full commit id: 40 or 64 hexadecimal characters, compared without letter case. `judged` is what the caller says was judged, `recorded` is what a record names, `trigger` is optional and is the revision that triggered the run. The findings, in this order, each `{ kind, detail }`: `judged-not-a-revision` when `judged` is not a revision, `recorded-not-a-revision` when `recorded` is not, and, when both are revisions and differ, `recorded-is-trigger` if `trigger` is a revision equal to `recorded`, otherwise `recorded-not-judged`. `ok` is true only without a finding. A push, where recorded, judged and trigger are one id, is ok. The function reads no file, no environment and no git, and does not change its input. `assembleObservation` takes an optional `triggerRevision`, passes `revision` as `recorded` and `expectedRevision` as `judged`, and adds each finding to `evidence.integrity`; with a finding every Case is UNKNOWN and the catalog is not complete. A record whose two revisions agree and are revisions is unchanged. `kaal-testing observe-at` takes `--trigger-revision sha`, optional; a value that is not a full revision is invalid input: the command exits `2` and writes nothing. The record decides no verdict.
`````

## Draft of A63.md

`````
---
id: testing/A63
title: revision
serves: [testing/F177]
---
# testing/A63 revision

`lib/revision.mjs` is a pure function and holds the meaning of a judged revision for evidence; `lib/observation.mjs` calls it and puts its findings with the integrity findings of the run report, the form it already has for an input that cannot be trusted. Testing does not resolve a revision: it takes the judged revision and the trigger as input and reads neither git nor the environment, so the lib stays inside the Hosting boundary it has. Hosting provides the resolver that says what was judged and where that came from; a caller (a workflow, a control) passes both in, and a ratchet in Controls can forbid the raw `GITHUB_SHA` as a record boundary. So the contract has three parts with three owners, and this Change is the first: the meaning and the check. Release keeps its repaired records and can call the check later. Full ids only, because an abbreviation cannot be matched across repositories. Rejected: reading `GITHUB_SHA` or the event in Testing (an environment dependency that is the defect itself), and rewriting Release's records here (another capability's files). Residual: the check compares names and does not know what was examined, so a caller that passes the trigger as the judged revision is not caught; only the resolver prevents that.
`````
