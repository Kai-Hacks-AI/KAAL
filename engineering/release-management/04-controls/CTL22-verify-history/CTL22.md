---
id: release/CTL22
title: verify History
description: It reveals whether a push rewrote the history of main.
type: detective
status: designed
evidence: [fixture:2, real:1, provoked:1:fail]
has: [release/I54]
---
# release/CTL22 verify History

A detective control. `verify History` compares the commit `main` pointed at before a push with the commit it points at after, and says FAIL when the commit before is not an ancestor of the commit after. It says PASS when `main` only moved forward or is new, and UNKNOWN when a commit could not be read or there is no commit after the push, which never passes. PASS is not an approval and not a merge decision.

It reveals; it does not prevent. A force-push has already happened when it runs. Preventing is the old promotion ruleset's `non_fast_forward` rule today; a preventive control with the same judge is a different control with its own Owner decision, made only after this one is Tested. It makes no claim about a deletion of `main`: a deletion fires no push event, so this control cannot observe it. That protection stays with the old `deletion` rule and is tracked as its own control.

It declares its own minimum evidence in the kinds controls/F30 asks of every control: two runs against a fixture (a scratch repository where `main` moves forward), one run on a real push to `main` of this repository, and one provoked failure (a rewritten `main`), where a failure counts only when the Case is RED on a `main` without the control's mechanism and GREEN with it. Its own Cases create these histories in scratch repositories.

It has one Intent, release/I54.
