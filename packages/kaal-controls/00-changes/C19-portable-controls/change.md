# C19 change

## PLAN

1. Add the gap G96, the Intent I13, the Requirement F32 and the Architecture A18, with the draft in `interface.md`, and the Cases T1102 to T1105 as `T<n>.red.mjs`.
2. Observe the expected RED against `main` and the same Cases GREEN against a throwaway copy (`evidence.md`).
3. State the route to `main` (`promotion.md`).
4. The PLAN adds no script, control or workflow and touches only `packages/kaal-controls/` documents and Cases.

## DO

Not authorized by this PLAN. On the merge of this PLAN into the collector, which is the go for the DO:

1. In `find-controls.mjs`: accept `intent:` as the stated form beside `has:` (exactly one), give each control `intentForm`, drop the list of stations and check the shape of a station name, accept `links`; in `evidence.mjs` put the title and the type after the id in `stateLine`. Rename the Cases to `T<n>.test.mjs`. The Cases of controls/C14 and C15 that name `[Nowhere:preventive]` as an invalid station (T920) are adapted: that name is now valid, and their other refused shapes stay refused.
2. Add `references/discovering-controls.md` and `references/exchanges.md`, adjust `declaring-controls.md` and `enforcing-controls.md` for the two forms and free stations, and add the pointer lines to `SKILL.md`. It is at 599 words and the limit is 600, so the DO shortens existing words to make room. The Skill's own files name no other package (controls/T777).
3. The discovery reference is judged by an agent trial, not by a Case: an agent given a small consumer repository with no KAAL object, asked to find its controls, is judged on whether it asks the four questions, names each control by what it controls, writes a draft with the Intent in the consumer's form, and records the unanswered as unknown. The trial is run with and without the reference, and the result is recorded as it is.

## ACT

1. A 4L retrospective of the Change, delivered to `main`.

## Left open

- The Exchange is Core's kind, planned in core/C51 (PR #2118, approved) and not yet built: its DO is not merged. This Change relies only on its design rule (the offer is a boundary-precise Skill description, the seek lives in `references/exchanges.md`) and needs no Node typed by `KAAL Exchange`. If Core's DO changes the rule, `exchanges.md` follows.
- No capability offers the Case links today: Testing has no finder of them. Until Testing offers them, the first-line reading stays as the fallback. Removing it, so that controls never parses a Testing object, is a later slice and needs Testing's offer first.
- The Intent is not resolved by the finder. Whether a linked Intent exists is for whoever holds the Intents, sought through the Exchange; a report says `linked` or `stated` and claims no more.
- The stations a consumer has are offered by whoever holds them (for KAAL, release). Release's offer is its own Change; until then a consumer writes the names.
- Realization, evidence for every shape, the thin-control rule, chains of controls and the enabler note are later slices, named above.
