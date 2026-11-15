---
name: BASS
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# BASS

Bare < Agent < Skill < Script.

The levels at which agent work can be realized, in order of increasing determinism:

- **Bare**: ordinary conversation, with no standing instructions.
- **Agent**: work constrained by `AGENTS.md` and comparable instructions. This level is named for those instructions; work at it is not, by that alone, the CASE kind `KAAL Agent`.
- **Skill**: reusable, task-specific guidance.
- **Script**: executable behaviour.

Engineering a Skill includes choosing, for each behaviour, the level that makes it as deterministic as it needs to be. What only judgment can decide stays guidance; what must repeat exactly becomes a script.

Determinism rises from left to right. Correctness, verification, authority and ownership do not follow the ladder: a script repeats the same behaviour every time, including a mistake. Whether a behaviour is correct is shown by its evidence, and who owns it, or may decide or sign off on it, is not set by the level at which work is realized.
