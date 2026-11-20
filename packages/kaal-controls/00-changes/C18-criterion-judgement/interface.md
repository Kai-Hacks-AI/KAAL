# C18 interface

## Records

A `:fail` base record may carry `without`, the path of the mechanism the base run lacked. A `:fail` head record may carry `shows`: `{ refused: <station> }`, `{ reported: <ref> }` or `{ restored: <ref> }`. A judgement is `{ control, about, verdict, reason, by, ref, of[, at] }` in `<n>.judgement.json`. `about` is `verification` (the Cases cover the criterion) with `verdict` one of `covered`, `partly`, `not-covered`, `unresolved`, or `validation` (the criterion serves the Intent) with `verdict` one of `serves`, `partly`, `not-serving`, `unresolved`.

## What counts

A `:fail` run counts only when its base is RED and a different run, `without` names neither a Case (`*.test.mjs`, `*.red.mjs`) nor a fixture path, and `shows` fits the control type: preventive, `shows.refused` is a station the control declares as `<Station>:preventive`; detective, `shows.reported` is set; corrective, `shows.restored` is set; directive, nothing is asked. A run with no `shows` or no `without` still counts and is counted in `unshown` and `unnamed`. A preventive control with no preventive station has `boundaryUnnamed`.

## Functions

`readJudgements(path)`: `{ judgements, problems }`. `digestOf(texts)`: a digest of the control file and its Case files. `judgementOf(control, judgements, digest)`: `{ verification, validation }`, each the `{ verdict, stale }` of its latest judgement, or `{ verdict: 'none' }`. `readRecords` skips `*.judgement.json`.

## State line (DO, on top of C16)

`demo/CTL1 · claimed running · computed designed · fixture 2/3 · provoked 0/1 fail · UNKNOWN below-minimum · verified: judged partly (stale) · validated: none · boundary unnamed · unshown 1`

## Reference

`references/judging-criterion.md`: per type, what the Cases must show and what the agent reads (below). `SKILL.md` gains one pointer line within 600 words.

Verification is the script's result and the agent's reading of the Cases, per type below. Validation is the agent's judgement of the criterion against the Intent, for every type, and has nothing a script can check beyond that the Intent is named.

| Type | A script checks | The agent judges (verification) |
| --- | --- | --- |
| preventive | a preventive station is declared; the provoked run named a mechanism and its refusal is at that station | that the refusal covers the action in the criterion and not a nearby one, and what another route or an override leaves open |
| detective | the provoked run names the report or finding it produced | that the report is the one the criterion needs, and what it does not examine |
| corrective | the base shows the deviation, the head names the restored state | that the restored state is the wanted one |
| directive | nothing beyond the judgement | that the guidance exists and is followed |
