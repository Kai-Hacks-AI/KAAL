---
name: kaal-architecture
description: Tell what a solution is and must do (Solution) from how it is realized, operated or made available (Delivery), split statements that hold both, and question ambiguous ones. Use when reading, writing or reviewing requirements, designs or architecture statements about an intended solution, before design proceeds.
license: MIT
---

# Separating Solution from Delivery

Architecture describes the target state of a plateau, whether final or intermediate. Within that target state it keeps two concerns apart. This Skill covers how to tell them apart and what to do when a statement does not sort cleanly. It prescribes no notation, tool or procedure, and it stays within the target state of one plateau.

## The two concerns

- **Solution** is what the intended solution is and must do: its purpose, behavior, qualities and constraints as the people it serves would experience them.
- **Delivery** is how that solution is realized, operated or made available: the means, the arrangements and the resources that bring it about and keep it running.

## The test

Ask of each statement: would it still hold if the means that realize, operate or provide the solution were replaced by others?

- Yes: it is Solution.
- No, because it names those means or how they are used: it is Delivery.

Judge by the concern each part constrains, not by its wording or by where it is written.

## When a statement does not sort cleanly

- **Mixed.** If one statement holds both concerns, split it into one statement for each. Do not file the whole under its dominant part.
- **Constraint across the line.** A constraint belongs to the concern it actually constrains, even when it affects the other. A Delivery constraint that limits what the solution can offer stays Delivery, and a Solution constraint that restricts the choice of means stays Solution. Note the effect on the other concern. If the limitation is independently accepted as a requirement of the solution, state it explicitly as its own Solution statement. If the statement does not say whether it is accepted, ask.
- **Ambiguous.** If a term can mean either concern, or the context and authority needed to decide are missing, such as "reliable", "mandatory" or "supported", name the two readings and put the question to the author. Do not guess, and do not pick the reading that is easier to classify.

Raise each of these before design proceeds, and say what you would need to know to settle it.

## What to report

For each statement give:

1. Its parts, each marked Solution or Delivery.
2. Your finding: none, mixed or ambiguous.
3. The next move: keep, split or ask.

Keep the report short. A clean statement needs one line.

## Scope

Architecture describes the target state. How to travel from one plateau to the next, and how finished work is brought together and delivered, belong to other capabilities. Do not classify, plan or govern them here, and do not depend on how they work. If a statement is only about such travel, say that it is outside the target state and leave it there.

## Rules

- Classify by the concern each part constrains, not by who wrote it or how firmly.
- Never guess an ambiguous term.
- Do not invent a third concern. A statement is Solution, Delivery or both, and a statement that fits neither is flagged, not forced. Where context or authority is insufficient, ask rather than force a classification.
- Keep examples and wording of your own report free of any one organization, domain or technology.
