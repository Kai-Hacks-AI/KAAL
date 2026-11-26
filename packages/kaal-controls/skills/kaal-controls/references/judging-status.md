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

A record also carries `by`, who or what ran the Case and wrote the record; one with no `by` is listed as `unrecorded` and counts nowhere. A RED or UNKNOWN run of a Case of the control keeps a `tested` claim unproven, however many GREEN runs there are, until the record carries `handled`, a sentence or a pointer saying what it was traced to (a defect, a fix, a run that was wrong, a false alarm of the control). The verdict then says `UNKNOWN unhandled` and lists the runs. An explained run counts toward no kind. Whether an explanation is true is for a review, not for the script. Whoever records a run is not whoever wrote the mechanism it runs against or the Cases that run it, and a run is recorded from what the runner reported, never from memory. A script cannot check that, so you apply it and a reviewer reads it.

`node scripts/evidence.mjs <directory> [--records <path>]` shows one line for every control that declares an `evidence` minimum, whatever it claims: the claimed status, the computed state and how far each kind of X has come (`fixture 2/3 · merge 0/2 · provoked 0/1 fail`), then the verdict. The computed state is `tested` only when the minimum is shown, `designed` for any other valid control and `invalid` otherwise; implemented and running are never computed, because only an observation shows them. The claim stays a claim, and the command fails only a `tested` claim that is not shown. `--json` prints the verdicts.

A tested claim needs the evidence of running, implemented and designed too. If a lower claim is unresolved, so is the higher one. Say what you observed and what you did not.
