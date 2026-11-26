# Judging a claimed status

A script can tell that a `status` is declared. It cannot tell that it is true. Judge a claim by what you can observe, and leave it unresolved when you cannot. Never take a declaration as its own proof, and never pick a status for a control because it is convenient.

For each status, ask what you would have to see.

## designed

- Look at: the control's declaration, its Intent, and the Requirements and Architecture reached from the Intent.
- Evidence: the declaration says what the control does when the rule is broken, and the Intent says why it matters.
- Unresolved when: the Intent is missing, or the control says what it is called but not what it does.

## implemented

- Look at: the mechanism the Architecture names, in the place it is meant to be.
- Evidence: the mechanism exists and can be shown, for example the source of a check or a rule that is written.
- Unresolved when: the mechanism is only described, or exists in one place and the control claims another.

## running

- Look at: the boundary the control is meant to guard, and its reports.
- Evidence: a result the mechanism produced on that boundary for a named case, such as a report for a particular change.
- Unresolved when: a setting says it should run but no result shows it did. A written rule is not operation, and one result is not effectiveness.

## tested

- Look at: a Case that tests the control, and what it was run against.
- Evidence: the Case ran against the real mechanism and covered the failure, not only the pass, including the case where the analysis is unavailable.
- Unresolved when: the Case only checks the declaration, or ran against a copy of the mechanism.

A `tested` claim is shown when the control's own `evidence` minimum is met by recorded runs of its Cases. A record is `{ case, x, run, outcome }`: a Case that tests the control (its first line `// Case <id> tests: <control id>`), the kind of X it ran against, the run, and the outcome GREEN, RED or UNKNOWN as a Case runner reports it. Only GREEN counts, each run once; for an X declared `:fail` the record also carries `base: { run, outcome }`, the run of the same Case on the failure without the control's mechanism, and it counts only when that base is RED and a different run (a label alone shows no failure), and a RED or UNKNOWN run is listed and never counts. `scripts/evidence.mjs` judges it and says PASS, or UNKNOWN when the minimum is not declared, no record exists or a kind of X is short: missing evidence is never Tested. Without `--records`, `check-controls.mjs` only reads declarations; with `--records <path>` it fails every `tested` claim that is not PASS.

A tested claim needs the evidence of running, implemented and designed too. If a lower claim is unresolved, so is the higher one. Say what you observed and what you did not.
