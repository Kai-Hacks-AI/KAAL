---
id: change/RT3
format: 4L
reflects: [change/C17]
---
Account of: I am the change thread. I planned and delivered change/C17, which lets a Change Record state `succeeds: []` as an explicit none and lets a consumer require an answer, as a PLAN (#2792) and a DO (#2798) into `kaal/change/declared-or-none`. This is my account only: the CPO's approvals are quoted as given, and the Owner has not been asked what they lacked.

## Liked
- subject: the consumer chooses who is required
  keeps: the reader takes `require` as an input and never decides for itself which Changes must answer, so adoption stays with the caller and the original Cases stayed unchanged.
- subject: absent and explicit none are different facts
  keeps: `undeclared` names a silent record, and `succeeds: []` is an answer, so a control can say "declared none" without claiming that no prerequisite exists.

## Learned
- subject: Case ids must be confirmed with the other capabilities before use
  source: my first ids T1580 to T1582 met Release's ids; I moved to T1700 to T1702 and Release confirmed them free.
- subject: an unreadable `require` is UNKNOWN, never an empty list
  source: the control reports `fact: "require"` when it cannot read the names, so a wrong input cannot pass as no requirement.

## Lacked
- subject: one place that lists the Case ids taken on main and the open collectors
  decision-point: choosing ids for the C17 Cases.
  cost: one renumbering round and a question to Release.
  findable: no
  address: script

## Longed For
- subject: evidence that a consumer passes `require` in practice
  worked-anyway: both controls and the reader are judged over fixtures only. Release's small PLAN that passes `require` at PROMOTION would show whether the answer is asked for where it matters.

Decisions: none made, the owner decides.
