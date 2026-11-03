# Guard: External delivery

KAAL Engineering delivers Guard naked into a target repository as one Change (guard/A10, guard/I6). The target gets working hooks, working CI and local docs, and neither the `kaal-guard` package nor any other KAAL element. This tooling is Engineering's own; it is not part of the Embed package and uses none of its internals.

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

   The branch gets one commit with at most five files: `.githooks/guard.sh` (the checks and the runner), `.githooks/pre-push`, `.github/workflows/guard.yml` (only when a check runs in CI), `GUARD.md` and Guard's Skill at its canonical location, `.agents/skills/kaal-guard/SKILL.md` (guard/F25). The Skill is the External variant: it describes the delivered runner, and names neither KAAL nor npm. After a fail or cannot judge, the runner and the hook name it. The target's checkout returns to the branch it was on.

   To make the Skill reachable by the agents the target uses, add `--agents agents.json`, outside the target, declaring their providers:

   ```json
   { "providers": ["claude-code", "codex", "copilot"] }
   ```

   Core's Agent Realization, built in KAAL's workspace (`npm ci` and `npm run build`), computes the further deployments from the canonical Skill as delivered; the commit adds them as plain files, and `GUARD.md` lists them and any pointer Core proposes. Nothing of Core reaches the target: no declaration, no record, no package. A provider Core does not know is reported, and so is a file Core would write that the target already has.
4. Review the commit, adapt it where the target needs it (for example the CI setup steps), push the branch and open the pull request in the target. That pull request is the delivered Change.

## What it never does

- It overwrites nothing. A `pre-push`, `guard.yml`, `GUARD.md` or canonical Skill the target already has is left out of the commit and reported with the line to add. A `.githooks/guard.sh` of the target's own stops the delivery, as do uncommitted changes and an existing branch of that name; nothing is written then.
- It adds no dependency, installs nothing, and sets no configuration. Each clone enables the hook itself (`git config core.hooksPath .githooks`), and the target makes the Guard jobs required checks if a merge should depend on them.
- It names nothing from KAAL in the delivered files, except the Skill's own name, `kaal-guard`, and its canonical path.
- It writes no agent instruction file (`AGENTS.md`, `CLAUDE.md` and the like). Those are the target's.

## Verified by

- guard/T3 (`engineering/guard/acceptance/external.test.mjs`): a delivery into a fresh target is one commit of a handful of files, with a hook, CI and docs, nothing from KAAL, nothing of the target's overwritten, and a hook that blocks a failing check and lets a passing one through.
- guard/T56 (same file): the Skill at the canonical location, naming neither KAAL nor npm, the hook's reminder naming it, and the target's own Skills and instruction files untouched.
- guard/T46 and guard/T83 (`engineering/guard/acceptance/workspace.test.mjs`, with KAAL's workspace): kaal-engineer-skill passes the External variant, and `--agents` writes exactly what Core computes, with nothing of Core in the target.
- `deliver.test.mjs`: what is delivered for local-only and Node targets, kept and refused files, the docs for further deployments, the delivered runner's verdicts and reminder, and that a fact Git cannot give stays unset.
