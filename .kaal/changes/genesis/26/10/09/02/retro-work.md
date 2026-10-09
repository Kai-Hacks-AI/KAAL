# Retro

## Learned

The hard part of this Work was never the loop; it was deciding what a record can prove. Every time I made the state machine do more, a review round showed me the same gap from another side: a line the Worker writes is only a report, and the most a script can do is refuse the reports that contradict records someone else holds. The line between reported and verified is where the design lives, and I only found its real position (a verifier outside the Worker's control, supplying host records) after Kai's first review said the first design had treated a transcription as evidence. I also learned that a deterministic check that reads no prose can still be defeated by something authentic used in the wrong place: a genuine all-clear about one version replayed against another needed a binding to the bytes, and nothing in my own tests would have found it, because I wrote the tests with the same blind spot as the code.

## Liked

Deriving the state from the record on every call, never storing a status, made each later change cheap: a new event kind, a new reason, a ledger line, and no migration or stale state to reconcile. Making the refusals write nothing meant I could test them by comparing the directory before and after. Having a Reviewer who reproduced each defect against the shipped script, with a numbered requirement anchored to it, made every round something I could close with a test, not an argument.

## Lacked

A way to run a real independent Reviewer on a dispute. The live round with Codex showed a real finding and a real all-clear, but Codex's all-clear did not use the requested words, it reviewed the whole PR head rather than the one file, and the only dispute and escalation scenarios I could run used a scripted Reviewer, which can only confirm that my own reading of the mechanism holds. I also lacked a verifier: the live trial's verified run ends in HOW because I authored the grant, so I could only show the mechanics of AGREED on a counterfactual. And I repeatedly lacked the Reviewer's view before building: the three largest changes to the design (the trust model, the stop and provenance handling, the finding answers) came from review, not from my investigation.

## Longed

A small control, travelling alone in `.github`, that fetches the host's records and runs `state --host` with the Owner's login, so that AGREED can be reached honestly without a person assembling a JSON file. I would also like the Process to be exercised on a second subject beyond Intent, so that the claim that it is reusable is shown by a use and not by the absence of Intent-specific code.
