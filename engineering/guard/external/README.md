# Guard: External delivery

KAAL Engineering delivers Guard naked into a target repository as one Change (A10, I6). The target gets working hooks, working CI and local docs, and neither the `kaal-guard` package nor any other KAAL element. This tooling is Engineering's own; it is not part of the Embed package and uses none of its internals.

## Deliver

1. Read the target's own commands: how it runs its tests and checks today. Choose which checks run in the hook (`local`, fast) and which in CI (`ci`, authoritative). The target owns that selection and every check's meaning; Guard only runs them.
2. Write them as `checks.json`, outside the target:

   ```json
   { "unit": { "command": "npm test", "runs": ["local", "ci"] } }
   ```

   A command is the target's own, as it would type it in `sh`, on one line. A name is a plain word: it becomes the CI job's name.
3. Deliver onto a new branch of a clean checkout:

   ```sh
   node engineering/guard/external/deliver.mjs --target <repo> --checks checks.json --branch <name>
   ```

   The branch gets one commit with at most four files: `.githooks/guard.sh` (the checks and the runner), `.githooks/pre-push`, `.github/workflows/guard.yml` (only when a check runs in CI) and `GUARD.md`. The target's checkout returns to the branch it was on.
4. Review the commit, adapt it where the target needs it (for example the CI setup steps), push the branch and open the pull request in the target. That pull request is the delivered Change.

## What it never does

- It overwrites nothing. A `pre-push`, `guard.yml` or `GUARD.md` the target already has is left out of the commit and reported with the line to add. A `.githooks/guard.sh` of the target's own stops the delivery, as do uncommitted changes and an existing branch of that name; nothing is written then.
- It adds no dependency, installs nothing, and sets no configuration. Each clone enables the hook itself (`git config core.hooksPath .githooks`), and the target makes the Guard jobs required checks if a merge should depend on them.
- It names nothing from KAAL in the delivered files.

## Verified by

- T3 (`engineering/guard/acceptance/external.test.mjs`): a delivery into a fresh target is one commit of a handful of files, with a hook, CI and docs, nothing from KAAL, nothing of the target's overwritten, and a hook that blocks a failing check and lets a passing one through.
- `deliver.test.mjs`: what is delivered for local-only and Node targets, kept and refused files, the delivered runner's verdicts, and that a fact Git cannot give stays unset.
