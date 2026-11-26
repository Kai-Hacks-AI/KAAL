---
name: kaal-architecture
description: Tell what a solution is and must do (Solution) from how it is realized, operated or made available (Delivery), split statements that hold both, and question ambiguous ones. Use when reading, writing or reviewing requirements, designs or architecture statements about an intended solution, before design proceeds.
license: MIT
---

# Separating Solution from Delivery

Architecture describes the target state of a plateau and keeps two concerns apart: **Solution**, what the intended solution is and must do, and **Delivery**, how it is realized, operated or made available.

The test for a statement: would it still hold if the means that realize, operate or provide the solution were replaced by others? If yes, it is Solution. If no, because it names those means, it is Delivery.

A statement that holds both is split, and one that cannot be sorted is asked about, never guessed. Report each statement's parts, your finding and the next move: keep, split or ask.

## References

- [concerns](references/concerns.md): the two concerns and the test.
- [unclean](references/unclean.md): a statement that is mixed, constrains across the line, or is ambiguous.
- [report](references/report.md): what to report.
- [scope](references/scope.md): what stays outside the target state, and the rules.
