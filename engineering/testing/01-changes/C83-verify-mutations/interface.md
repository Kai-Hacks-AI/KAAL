# C83 interface

Drafts of the files the DO places under `engineering/testing/`, following `packages/kaal-engineering/skills/kaal-engineering/references/package-layout.json`. Each draft matches its placed file after the DO.

## Draft of I51.md

`````
---
id: testing/I51
title: Testing finds the surviving mutants of a claim by running them
---
# testing/I51 Testing finds the surviving mutants of a claim by running them

Contract: given a tree, a list of mutants (each a precise change to one file, with the Cases that should detect it), Testing runs the Cases on the unmutated tree and on each mutant in a scratch copy, and records each mutant as `killed` (a Case's assertion went RED), `survived` (every Case stayed GREEN), `invalid` (the mutant or the baseline is not usable) or `unresolved` (an error, a timeout or an incomplete run says nothing about the assertion), with the evidence for each. A mutant is never counted killed by an unrelated error, and a record that cannot classify a mutant says so and is not complete. The record names survivors so that nobody has to read a log to find them; it decides no verdict, and whether a survivor is an equivalent mutant or a gap in the Cases is judged by a person or an agent. Choosing mutants, wiring a job and any ratchet over survivors belong to the caller. Reason: Targeted Mutation Verification is run by hand today (a patch set, a `run.sh`, and a reader of its output), so a surviving mutant is found only when someone reads the output. Owner: testing.
`````

## Draft of F176.md

`````
---
id: testing/F176
title: mutate
kind: functional
serves: [testing/I51]
---
# testing/F176 mutate

`kaal-testing mutate --root R --spec mutants.json --out DIR [--timeout ms]` (library `kaal-testing/mutate`, `runMutants`) reads a spec of schema `kaal-testing/mutants@1`: `{ schema, copy?, mutants: [{ id, file, find, replace, cases: [file…], claim? }] }`. `copy` names the root-relative folders copied into each scratch tree (default the whole root, without `.git` and `node_modules`); `file` and every `cases` entry lie inside `root`; `find` is the exact text to change and occurs exactly once in `file`; `replace` differs from `find`; ids are unique; `claim` is free text that says which claim the mutant violates. It first runs the union of the Cases on an unmutated scratch copy: the baseline is `ok` only when its run is complete, every file has a test and every test is GREEN. It then applies each mutant to its own scratch copy, never to `root`, and runs that mutant's Cases there with the runner. A mutant is `killed` when a test of its Cases is RED by assertion (the ids are `killedBy`), `survived` when the run is complete, has tests and every test is GREEN, `invalid` when `find` is absent, occurs more than once, equals `replace`, or the baseline is not `ok`, and `unresolved` in every other case (an error that is not an assertion, a timeout, a file that cannot be imported, an incomplete run, no test). It writes `DIR/mutation-report.json` of schema `kaal-testing/mutation-report@1`: `baseline` (`ok`, `complete`, `counts`, `problems`), `mutants` (`id`, `file`, `outcome`, `reason` when not killed, `killedBy`, `cases`, `problems`), `counts` of the four outcomes, `survivors` (the ids), and `complete`, true only when the baseline is `ok` and every mutant is `killed` or `survived`. The record decides no verdict. The command exits `0` whenever the record was written, survivors, `invalid` and `unresolved` included, and `2` for an invalid spec (wrong schema, duplicate id, a file outside `root`, no mutants), writing nothing. `root` is never changed.
`````

## Draft of A62.md

`````
---
id: testing/A62
title: mutate
serves: [testing/F176]
---
# testing/A62 mutate

`lib/mutate.mjs` composes what Testing already has and decides nothing: Hosting reads the tree and writes each scratch copy (`read`, `initialize`, `scratch`), `runCases` (`testing/C63`, with `testing/C81`) runs the Cases and reports GREEN, RED (assertion) or UNKNOWN per test, and the classification of a mutant is a pure function of that run report and the application of the change (`classify`, pure). So the meaning of killed is the runner's meaning of RED: an assertion, never an unrelated error. The record keeps the shape of the other Testing records (a schema, counts, a `complete` that is true only when nothing is unresolved) and can be an input to a later observation, but it is its own form and does not extend `kaal-testing/observation@1`. Mutants are given, not generated: choosing a violation of a claim is Testing's Skill (Targeted Mutation Verification) and the caller's work, and generating mutants from operators brings equivalent mutants and needs its own Change. A caller that wants a gate over survivors (no new survivors against a baseline, a ratchet) reads `survivors` and owns the decision, as hold Act owns its verdict; wiring a job is the caller's, here engineering's. Candidate code runs in the scratch copies, as Cases do, so the same residual risks apply: a Case can lie about its result, and the record is evidence for a reader, not enforcement. Rejected: a mutation library as a dependency (a runtime dependency and an engine that does not know Testing's meaning of killed), and applying patches with an external `patch` program (a host command; an exact `find` and `replace` is checkable and portable).
`````
