# C18 interface

## Records

A `:fail` base record may carry `without`, the path of the mechanism the base run lacked. A `:fail` head record may carry `shows`: `{ refused: <station> }`, `{ reported: <ref> }` or `{ restored: <ref> }`. A review of a control is kaal-review's record, an application folder with `subject.json` and `review.md`, whose `subject.json` has `"focus": "control"` and `"subject": "<control id>"`, its `reference.items` naming the Intents of the control and its criterion, and its `actual.items` naming the Cases that test it. The `subject` field is new for kaal-review to accept.

## What counts

A `:fail` run counts only when its base is RED and a different run, `without` names neither a Case (`*.test.mjs`, `*.red.mjs`) nor a fixture path, and `shows` fits the control type: preventive, `shows.refused` is a station the control declares as `<Station>:preventive`; detective, `shows.reported` is set; corrective, `shows.restored` is set; directive, nothing is asked. A `:fail` run with no `without`, or with no `shows` where its type asks for it, is incomplete: the verdict lists it in `incomplete` with what it lacks (`without`, `shows`) and it is never counted. A preventive control with no preventive station has `boundaryUnnamed`.

## Two edges at the control

`Test Case -verifies-> control` is the first line of the Case and its results are the run records. `review -validates-> control` is the `subject` of the review. The control stores neither. `judgeEvidence(control, records)` and `reviewsOf(control, subjects)` are the two lookups; a report of one control or of every control joins them.

## Functions

`readSubjects(path)`: the `subject.json` of every application folder under `path`, each with its path. `reviewsOf(control, subjects)`: the reviews whose focus is `control` and whose subject is the control id, each as `{ path, coverage: 'complete' | 'partial', missing: [...] }`, `coverage` being `complete` when its reference items name every Intent the control has and its actual items name every Case that tests it. It reports what the review named and never what it found: a review of complete coverage can reject the control.

## State line (DO, on top of C16)

`demo/CTL1 · claimed running · computed designed · fixture 2/3 · provoked 0/1 fail · UNKNOWN below-minimum · 1 incomplete · review coverage: 1 complete`

## Reference

`references/judging-criterion.md`: per type, what the Cases must show and what the agent reads (below). `SKILL.md` gains one pointer line within 600 words.

What a review of a control must cover, whatever the type: the criterion against the Intent, and the criterion against the Cases. Per type:

| Type | A script checks | The review validates |
| --- | --- | --- |
| preventive | a preventive station is declared; the provoked run named a mechanism and its refusal is at that station | that the refusal covers the action in the criterion and not a nearby one, and what another route or an override leaves open |
| detective | the provoked run names the report or finding it produced | that the report is the one the criterion needs, and what it does not examine |
| corrective | the base shows the deviation, the head names the restored state | that the restored state is the wanted one |
| directive | nothing beyond the review | that the guidance exists and is followed |
