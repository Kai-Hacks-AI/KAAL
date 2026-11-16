# C50 interface

The drafts of what the DO adds. Case T610 reads the control draft and T611 the Intent draft. None of them exists on `main` yet.

## Draft of CTL3.md

````
---
id: release/CTL3
title: readiness before pack
description: It stops a release of a package that npm or a consumer could not take, before anything is packed.
type: preventive
has: [release/I28]
---
# release/CTL3 readiness before pack

A preventive control. For one package, `judgeReadiness` names every finding about its manifest and about the registry before the package is packed. A release run that calls it stops on `failed`, and also on `unknown`, which never passes.

It stops one action: packing a package for release. It does so only inside a run that calls the judge; publishing by hand, and any run that does not call it, are not covered. No run in release-management calls it yet, so no operation is claimed.

It has one Intent, release/I28. Whether a package can reach the registry intact is answered from the Intent, by its Requirements and Architecture, not stated here.
````

## Draft of I28.md

````
---
id: release/I28
title: publishing intact
---
# release/I28 publishing intact

A package never reaches the registry in a form a consumer could not install or could not trace to this repository. What would make that so is named before anything is packed, and a release that cannot be judged does not proceed. Owner: release management.
````

## The judge

`05-src/publishing/readiness/judge.mjs` exports `judgeReadiness({ manifest, directory, registry }, declaration)`. `declaration` is `readiness.json` with `scope` and `repository`. `registry` maps each name asked about to its published versions, or `null` when the registry does not know the name.

It returns `{ result, findings, path }`:

- `findings` is a list of `{ rule, kind, message }` in a fixed order (rules in the order below, dependencies by name). `kind` is `failed` or `unknown`.
- `result` is `failed` when any finding is `failed`, else `unknown` when any is `unknown`, else `verified`.
- `path` is `first` when the registry does not know the package's name, `trusted` when it does, and absent when the registry was not asked.

Rules: `private`, `scope`, `version`, `access`, `repository-url`, `repository-directory`, `license`, `engines`, `files`, `own-version-published`, `dependency-exact`, `dependency-not-published`. The rule `registry-not-asked` (kind `unknown`) is given for the package's own name or a dependency the registry was not asked about.

## Where it lives

`engineering/release-management/04-controls/CTL3-readiness-before-pack/CTL3.md` with its control test `T610.test.mjs` beside it; `01-intent/I28-publishing-intact/I28.md` with `T611.test.mjs`; the judge and `readiness.json` under `05-src/publishing/readiness/`.
