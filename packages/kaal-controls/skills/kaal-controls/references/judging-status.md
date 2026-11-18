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

A tested claim needs the evidence of running, implemented and designed too. If a lower claim is unresolved, so is the higher one. Say what you observed and what you did not.
