# Migrating a control to a declared status

Engineering's controls declare a `status`, and the Case controls/T778 runs the product check on `engineering/` to find the ones that do not. The rule, the diagnostics and the recovery belong to the product, so this note holds no copy of them:

- the check: `packages/kaal-controls/skills/kaal-controls/scripts/check-controls.mjs`
- what a status is and how to declare it: `references/declaring-controls.md` of the Skill
- how to judge whether a claimed status is true: `references/judging-status.md` of the Skill

## How an owner migrates a control

1. Run the check on `engineering/`. It lists every control it finds, complete or not, and names each missing or invalid field with a recovery. An incomplete control stays in the inventory.
2. Choose the status the evidence supports, with the help of the judging reference. Do not pick one to make the check pass, and do not copy the status of another control. When you cannot say, the claim is unresolved: take the lower status you can show.
3. Edit the control's declaration and run the check again.

## When it moves

A control migrates when its owner next works on it, one at a time. The check validates whichever controls exist when it runs, so a control added later is judged without a change here, and nothing here lists them.

This note does not wire the check into GitHub, require it or enforce it. That is another Change.
