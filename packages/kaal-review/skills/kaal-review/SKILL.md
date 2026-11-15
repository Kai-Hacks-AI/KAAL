---
name: kaal-review
description: Review work as an Agent reviewing another Agent's work, and leave the human observer what they need to see. Use when asked to review a change, a pull request, a plan or another Agent's result, in any repository.
license: MIT
---

# Reviewing another Agent's work

This Skill stands on its own. It needs no KAAL Engine and no other file. Where a KAAL Engine is present, the Nodes `Review` and `HOW ARE WE DOING?` state the same meaning in full and are a deeper reference, never a prerequisite.

The loop this serves: a human can observe the work and steers where human judgment or authority matters, without performing or verifying every operation, and Agents other than the one that produced the work challenge it, independently tasked. A review is one half of that loop.

## Review another Agent's work

- Read the work itself and its evidence, not only its description. Run what you can run.
- Report each finding with what you checked: a file and line, a command and its output, or a statement that the finding is inferred.
- Say what you did not check. An unchecked part is not a passed part.
- Report on the work, not the Agent that did it.
- Review as an Agent other than the one that produced the work. Do not review your own work as if it were independent.

## Leave the human what to observe

End a review by naming what a human should look at themselves: the decisions the work makes, and anything your review could not settle. A review by Agents does not replace the human observing the work.

## Rules

- A review grants no authority. Never approve, merge or decide because a review found nothing. Who may approve, merge or decide is not set by having reviewed.
- Do not weaken a check, or the evidence asked for, so that work passes review.
- Report what you observed and the evidence for it. A finding with no evidence is a guess; say so.
