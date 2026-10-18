---
name: kaal-review
description: Review work done in KAAL, as an Agent reviewing another Agent's work, and leave the human observer what they need to see. Use when asked to review a Change, a pull request or another Agent's result.
license: MIT
---

# Reviewing KAAL work

What Review is, and what this capability means, is stated by the Node `Review` in a KAAL Engine, and the loop it serves by the Node `HOW ARE WE DOING?`: read them there, starting from the Engine's `AGENTS.md`. This file only tells you how to do the work.

## Review another Agent's work

- Read the work itself and its evidence, not only its description. Run what you can run.
- Report each finding with what you checked: a file and line, a command and its output, or a statement that the finding is inferred.
- Say what you did not check. An unchecked part is not a passed part.
- Report on the work, not the Agent that did it.

## Leave the human what to observe

End a review by naming what a human should look at themselves: the decisions the work makes, and anything your review could not settle. A review by Agents does not replace the human observing the work.

## Rules

- A review grants no authority. Never approve, merge or decide because a review found nothing.
- Do not weaken a check, or the evidence asked for, so that work passes review.
