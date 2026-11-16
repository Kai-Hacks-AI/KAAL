# C11 change

## PLAN

1. Add I6 and F18 with their Cases T590 to T592 and the gap G72 under `packages/kaal-controls/`. The Cases are `T<n>.red.mjs`.
2. Observe the expected RED against `main` (`evidence.md`).
3. State the route to `main` (`promotion.md`).
4. The PLAN changes no package file and cites nothing that is not on `main`.

## Ids

Allocated by the coordinator on 16 Nov 2026: Change controls/C11, Cases T590 to T599 (three are used), gaps from G72. I6 and F18 are the next free in controls. No Architecture id is added: the package architecture is A5, and the rename adds no new behaviour.

## DO

Not authorized by this PLAN. On the go of the Owner, into the collector of this Change:

1. Set `name` to `@kaihacksai/kaal-controls` in `package.json` and the first line of `README.md` to `# @kaihacksai/kaal-controls`.
2. Update the Case T13 of controls/A5, which asserts the old name, to assert the new one. Its other assertions stay.
3. Rename T590 to T592 from `.red.mjs` to `.test.mjs` when they are green.

## ACT

A 4L retrospective in `act.md` before the promotion.

## Not in this Change

No publication, no change to the version, `private` or `files`, no `publishConfig`, no change to the Skill name or folder, no change to the finder, and no other package. Nothing in the repository consumes the package by name, so no other file needs to follow the rename. The `workspaces` list of the root does not hold the package and is not changed.
