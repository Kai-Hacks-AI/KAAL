---
name: Skill Standard
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# Skill Standard

A Skill is a folder with a `SKILL.md` that tells an Agent when and how to do one thing. This Definition states what KAAL asks of a Skill's shape and size. It carries no number: the thresholds live in the one place that judges them, Core's `kaal-core/skill`, so nothing here can fall out of step with it.

## Floor

The Agent Skills standard (agentskills.io) is the floor. Only `SKILL.md` is required, and a Skill that is `SKILL.md` alone is complete. Core's rules are stricter, never different. A `SKILL.md` follows that standard and is deployed unchanged.

## Layout

At the top of a Skill folder there is `SKILL.md`, and optionally `references/`, `scripts/` and `assets/`. Nothing else sits there. Below those folders the Skill is free.

## The router

`SKILL.md` is a router: crisp, clear and concise. It tells the Agent when the Skill applies and where each kind of detail lives, and it keeps the Agent on the lane the Skill owns.

- **Router**: `SKILL.md` points; it does not hold the whole discipline. Read it whole before deciding what to move.
- **Detail**: detail that an Agent needs only sometimes belongs in `references/` or `scripts/`, one hop from `SKILL.md`.
- **Lane**: a Skill covers its own capability's lane and names the others rather than restating them.
- **Size**: the body, the words after the frontmatter, is counted. A body that grows past the stages Core reports is a signal to restructure.

## Size is a signal, not a trim target

Core reports a size level for every Skill and warns from the first stage. Each stage asks for more than the one below it, and the highest blocks delivery. The remedy is always structural: review the whole router, consolidate what repeats, and move detail to references. Cutting words to pass is never the remedy; it hides the finding without improving the Skill.

## What this Definition does not judge

The frontmatter is not counted, and Core reads none of its fields. Its conformance is the Agent Skills standard's, and whether it is clear and concise is a review's judgement. Capabilities own their Skills' content; Core owns the standard and the check.
