# C40 change

## PLAN

1. **From.** The old PLAN release/C33 (#1697) bundled the concept, eight guidance files, a trailer in every PR template and an envelope check into one Change. Owner direction (16 Nov 2026): split it by concept first, then template by template.
2. **To.** This Change is the concept only: one KAAL Definition, `engineering/release-management/HOW-TO-WORK.md`, equal to the draft in `interface.md`. It sits in release management, not at `engineering/HOW-TO-WORK.md`. The wording is "Human Observes Work. Testing Orchestrates Worker, Owner, Reviewer, Knowledge." (Orchestrates, not Orchestrated).
3. **Because.** The concept is the entry point every template will point to later. Landing it first lets each template Change be PLANned on its own against a definition that already exists.
4. **Cases.** T560 to T562, all RED on `main`:
   - T560: the Definition exists at the new place, has the Definition frontmatter and the exact sentence, says Orchestrates and not Orchestrated, and no `engineering/HOW-TO-WORK.md` exists.
   - T561: it equals the draft; HOW is named as the first word of `HOW ARE WE DOING?` and none of that Definition's text is copied; TO and WORK state their parts; it prescribes no step for a type and does not mention any template, chapter or trailer.
   - T562: it states the resolution rule once, every path it names exists, none points into `packages/`, and it stays under 30 lines.
5. **Not in this Change.** The eight guidance files, any trailer in a PR template, the envelope check, requirement F23, installing anything into `.github`, moving TO into Testing and WORK into a roles Definition, and deploying Review into `.kaal/`. Each template is a later Change with its own PLAN, in the order the Owner sets.

## The old PLAN

release/C33 (#1697, branch `claude/project-thread-hiqwqc`) is superseded by this Change and the template Changes that follow. It is closed once this PLAN is up. Its ids C33, T440 to T445 and G68 are not reused: G68 now belongs to release/C36.

## DO

`engineering/release-management/HOW-TO-WORK.md`, equal to the draft. T560 to T562 are renamed to `.test.mjs` when green.

## ACT

A 4L retrospective in `act.md` before the promotion.

## Ids

C40 and T560 to T562 come from the coordinator's allocation (T560 to T569). The Change adds no Intent, Requirement, Architecture or gap id.
