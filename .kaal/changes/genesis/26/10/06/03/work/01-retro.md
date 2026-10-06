# Birth the Retro capability

## Intent

A retrospective is not specific to a Change: any work, change or process may ask for one. Today its form exists only as prose in Changing KAAL's reference and as a heading list copied into two acceptance tests, so a retrospective can differ from the form by a heading level and be found out only by a test. Make the form a capability of its own that creates a retrospective from four texts and checks that a file is one, so that the structure is never written by hand and Changing KAAL can consume it.

## Requirements

R1. A new capability `Retro`, one package pair: `packages/kaal-retro` delivers it, `engineering/kaal-retro` proves it. It is a KAAL Skill: one sealed Node `Retro` typed by Skill, and one Agent Skill `kaal-retro`.

R2. The Node states what a retrospective is (one writer's own account of something they took part in), its four parts and what each holds, and that a retrospective speaks only for its writer. It states that Retro does not decide when one is owed, who writes it or what it is about. It names no process, host, file, role or mechanism.

R3. One script, `retro.mjs`: `write` takes a destination and four texts and writes the canonical form `# Retro` / `## Learned` / `## Liked` / `## Lacked` / `## Longed`; `check` exits 0 only for exactly that form. The writer supplies texts and never structure. `write` never replaces an existing file, refuses an empty part, and writes nothing when it refuses. A supplied text is arbitrary: it may quote or discuss headings or any Markdown, and Retro does not restrict its vocabulary.

R4. Every retrospective this repository already holds, of every seat and generation, passes `check`.

R5. The capability joins an installed KAAL only through Core's registration, as the other capabilities do. This repository registers it and installs the projection.

R6. Nothing else changes in meaning: Changing KAAL, its Skill text, its references, the evaluator and every sealed artifact are untouched. Changing KAAL's own account of the retrospectives it requires, and its reference to the form, are not edited here.

## Architecture

The capability is built in the shape of the two capabilities that preceded it. The Node carries meaning; the Agent Skill carries how, and points to the Nodes without restating them. The package has the one public function `payload()`; the delivery is proven in `engineering/kaal-retro`.

The form is defined once, in `retro.mjs`: `render` is the only author of the structure, `parse` accepts a file only if `render` of its four texts reproduces the file byte for byte, so `check` is exactly as strict as `write`. A text's own blank lines and indentation are kept; only the blank lines at its edges and the white space at its end are not part of it.

The four parts must stay recoverable although the texts are arbitrary, and that is a matter of serialization, not of what may be said. A text line that Markdown would read as a heading (up to three spaces, then `#`) is written with one more backslash before its `#`: Markdown shows it as the literal text, and `parse` removes one backslash again. The mapping is one-to-one, so a text that itself begins with backslashes before a `#` is written with one more and read back as it was given. The delimiters of the four parts are the only unescaped heading lines, so a quoted `## Liked` inside a part can neither end it nor be mistaken for a part. The cost is that a heading-like line inside a fenced code block in a text shows its escape backslash when rendered; the bytes read back by `check` and `parse` are the writer's.

Retro consumes nothing from Changing KAAL and Changing KAAL does not yet consume Retro. The later Change that teaches Changing KAAL review points its retro reference at the capability.

The Node was sealed with the Sealing capability's own scripts. This repository registered the capability through Core's `registerSkill()` and projected it with `install-kaal`; `.kaal/changes` was not touched by either.

## Evidence

- `npm test` in `packages/kaal-retro` (3) and in `engineering/kaal-retro` (17) pass, including texts that quote `# Retro`, `## Liked` and every heading level, with the written file pinned as literal text, parse recovering each text exactly, and `check` still rejecting every unescaped heading inside a part, and the whole root `npm test` passes, including the install test that now expects Retro among the installed Skills and the delivered capabilities.
- `check-kaal-install`, `check-kaal-seals` and `check-kaal-config` pass.
- Every `retro*.md` in this repository's `.kaal/changes`, including the retrospectives of Changes 06/01 and 06/02, passes `check`.
- The Retro Node's ID is `01576bf0db92ec27e443764ea4ae5124617f978f4a5cd557c08d3d3eaca479ab`, sealed in `packages/kaal-retro/kaal/seals/` and, once registered, in `.kaal/seals/`.

## Not done here

- Changing KAAL does not yet point at Retro, and its reference to the retro form is unchanged.
- The two acceptance tests that list the four headings (`kaal-changing` delivery and `kaal-install`) keep their lists; they are Changing KAAL's checks and move with it.
- Retro has no notion of a seat, a Change or a destination convention: callers decide them.
