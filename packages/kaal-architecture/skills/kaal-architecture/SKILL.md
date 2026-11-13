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

Judge by what the statement fixes, not by its wording or by where it is written.

## When a statement does not sort cleanly

- **Mixed.** If one statement holds both concerns, split it into one statement for each. Do not file the whole under its dominant part.
- **Disguised.** If a statement is written as one concern but in fact fixes the other, classify it by what it fixes. A means that limits what the solution offers is a Solution statement, even when it is written as a Delivery arrangement. Say so, because the choice of means is then a decision about the solution.
- **Ambiguous.** If a term can mean either concern, such as "reliable", "mandatory" or "supported", name the two readings and put the question to the author. Do not guess, and do not pick the reading that is easier to classify.

Raise each of these before design proceeds, and say what you would need to know to settle it.

## What to report

For each statement give:

1. Its parts, each marked Solution or Delivery.
2. Your finding: none, mixed, disguised or ambiguous.
3. The next move: keep, split, reclassify or ask.

Keep the report short. A clean statement needs one line.

## Scope

Architecture describes the target state. How to travel from one plateau to the next, and how finished work is brought together and delivered, belong to other capabilities. Do not classify, plan or govern them here, and do not depend on how they work. If a statement is only about such travel, say that it is outside the target state and leave it there.

## Rules

- Classify what the statement fixes, not who wrote it or how firmly.
- Never guess an ambiguous term.
- Do not invent a third concern. A statement is Solution, Delivery or both, and a statement that fits neither is flagged, not forced.
- Keep examples and wording of your own report free of any one organization, domain or technology.
