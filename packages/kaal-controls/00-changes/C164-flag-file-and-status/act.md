# C164 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it. It closes C164 in the collector. What `main` teaches can only be recorded after the promotion, and is not claimed here.

## Liked

The CPO's holds made the contract better each round. The first design had one flag state and one blocking answer. The finished one keeps the declared decision, the observed signal and the evidence of what blocked as three separate fields, so a mismatch can be named and never hidden. A throwaway implementation outside the repository showed every Case GREEN before the DO was written, and each Case was RED on its own assertion on the collector. The twelve mutation patches in `mutations/` were each caught by a Case.

## Learned

An unknown decision and an unknown result are two different things. The first could not be settled by a state of STAMP, because any state read as Mute, Advisory or off would let a missing flag look like a choice. It is a configuration failure found before anything runs, and the exit code of that failure is a different question from what a control does with a verdict. The library is pure and cannot set an exit code, so `decideOutcome` carries it, and the adopter maps it to its job. A word such as "never blocks" is ambiguous in CI until the exact outcome of each input is pinned in a Case. A Preventing control permits a pass only, so a report verdict there is an anomaly and blocks.

## Lacked

A statement up front of what a missing flag does in CI, for each control type, which would have saved three rounds of the PLAN. A way to run the Case ids of other collectors against the one in use, to see that an id is free without grepping every branch.

## Longed For

The flag status report run on a real instance with a real flag file, and a rule over the changes of that file (the escalation ratchet) once the Owner decides it. The independent adoption trial of #2933 to show whether an outside agent can read the states and the exit codes without coaching.

## Closed

The Gap of this Change, the missing state of a control per place, is closed by Cases T1723 to T1728, green in the collector with all 124 Cases of the package. The thin command and T1728 are in scope and approved. No flag entry, WIRE, escalation or publish is made or implied.

## Sentence

Declared Decisions Govern, Observed Signals Inform, Blocking Evidence Stays Visible.
