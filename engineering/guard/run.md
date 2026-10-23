# Guard: Run

`kaal-guard run` exists from C1, so far only in this repository; the other commands are intended.

## Embed: shipped in the package

The package is published to npm as `kaal-guard`, first as `kaal-guard@0.0.1`.

```sh
npm install --save-dev kaal-guard
npx kaal-guard init        # writes guard.json and missing adapters only; reports any it left alone
npx kaal-guard run --local # what the hook runs
npx kaal-guard verify      # the workflow files name a job for every ci check (static only)
npx kaal-guard upgrade     # replaces only unmodified managed files
npx kaal-guard remove      # deletes only unmodified managed files; keeps guard.json and your tests
```

`init` sets `core.hooksPath` to `.githooks` only if it is unset, and records that. Add the job names as required checks in branch protection. If the repository already has a `pre-push` hook or workflows, `init` leaves them alone and prints the one line to add, such as `npx kaal-guard run --local` in the hook, or a step `npx kaal-guard run --check <name> --github` in a job.

## Engineer: KAAL itself

KAAL installs `kaal-guard` from its own workspace and lists its checks in `guard.json`. Development, the full documentation and the Engineering-only outer tests live here, in `engineering/guard/`.

## External: naked delivery by KAAL Engineering

KAAL Engineering implements Guard in the target from the target's own commands, adapting it where needed, and delivers it as one Change, normally a pull request. The Change contains a working `.githooks/pre-push`, working CI jobs (in the target's existing workflows or a new one) and the local docs to maintain them. It contains neither the `kaal-guard` package nor any other KAAL element, and never overwrites the target's existing files.

## Diagnosis

| Symptom | Do |
| --- | --- |
| `cannot judge: …` | fix the named cause; it blocks and never passes |
| `not applicable: …` | nothing; it is reported as not applicable, not as a pass |
| `held: …` | the Owner's evidenced hold; see its evidence |
| the hook passes but CI fails | compare the base the hook printed with CI's; `git fetch`, then rerun |
| `verify` names a ci check no job names | add `kaal-guard run --check <name>` to a job; `verify` reads files only, so also make that job required |
| `init` left a file alone | it existed before Guard; add the printed line yourself |
| the hook doesn't run | `git config core.hooksPath .githooks` |
