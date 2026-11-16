# C8 change

## PLAN

1. Add I4, F13 to F15, N5 and A8 with their Cases T470 to T479 and the gap G4 under `packages/kaal-controls/`. The Cases are `T<n>.red.mjs`.
2. Observe the expected RED against `main` (`evidence.md`).
3. State the route to `main` (`promotion.md`).
4. The PLAN adds no finder, no control item, no Skill text and no package change, touches nothing outside `packages/kaal-controls/`, and cites nothing that is not on `main`.

## DO

Not authorized by this PLAN. On the go of the Owner, into the collector of this Change:

1. Add `skills/kaal-controls/scripts/find-controls.mjs` (A8): a pure `findControls(files)` and a command line entry that gathers the files of a directory and prints the result as JSON.
2. Add a short chapter to the Skill that says how to declare a control and to run the finder.
3. Rename the Cases from `T<n>.red.mjs` to `T<n>.test.mjs` when they are green, and wire them where the other capabilities' Cases run.

## ACT

1. A 4L retrospective of the Change (Liked, Learned, Lacked, Longed For), delivered to `main`.

## Left open

- Which numbered concern folder holds control items. The finder reads frontmatter, not paths, so any folder works until that is decided.
- Resolving Intents, walking Control to Intent to Requirements to Architecture, and gate coverage: later Changes, each with its own PLAN.
