# C55 interface

The drafts of what the DO adds. Case T720 reads the control draft and T721 the Intent draft. None of them exists on `main` yet.

## Draft of CTL4.md

````
---
id: release/CTL4
title: verify Source
description: It reveals when the source tests of a package did not run, or did not pass, in the package's own directory before it is released.
type: detective
has: [release/I29]
---
# release/CTL4 verify Source

A detective control. For one package, `judgeSource` decides from the record of its source test run whether the declared command ran in the package's directory and exited 0, and gives `verified`, `failed` or `unknown`; `unknown` never passes. It reveals; it blocks nothing by itself.

Making it preventive is a separate, second control that wires this one into a release run or a ruleset. That control is not made here, and no run in release-management calls the judge yet, so no operation is claimed.

It has one Intent, release/I29. Whether a package was tested before release is answered from the Intent, by its Requirements and Architecture, not stated here.
````

## Draft of I29.md

````
---
id: release/I29
title: source tested before release
---
# release/I29 source tested before release

A package is never released from source whose own tests did not run and pass. What would make that so is named before anything is packed, and a release whose tests cannot be judged does not proceed. Owner: release management.
````

## The judge

`05-src/publishing/verify-source/judge.mjs` exports `judgeSource({ directory, run }, declaration)`. `declaration` is `verify-source.json` with `command`. `directory` is the package's directory. `run` is the record of the source test run, `{ command, cwd, status }`, or `null` when no run left a record.

It returns `{ result, findings }`:

- `findings` is a list of `{ rule, kind, message }` in a fixed order (the rules in the order below). `kind` is `failed` or `unknown`.
- `result` is `failed` when any finding is `failed`, else `unknown` when any is `unknown`, else `verified`.

Rules: `source-not-run` (kind `unknown`: no record, or a `status` that is not a whole number), `source-command` (kind `failed`: the command is not the declared one), `source-directory` (kind `failed`: it did not run in the package's directory), `source-failed` (kind `failed`: the exit status is not 0). When `source-not-run` is given no other rule is judged.

## Where it lives

`engineering/release-management/04-controls/CTL4-verify-source/CTL4.md` with its control test `T720.test.mjs` beside it; `01-intent/I29-source-tested/I29.md` with `T721.test.mjs`; the judge and `verify-source.json` under `05-src/publishing/verify-source/`.
