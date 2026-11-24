# C98 interface

The drafts the DO takes. T1171 and T1172 pass on them in a throwaway copy (`evidence.md`).

## Draft of F76.md

Goes to `engineering/release-management/02-requirements/F76-core-has-no-special-rule/F76.md`.

`````
---
id: release/F76
title: core-has-no-special-rule
kind: functional
serves: [release/I53]
---
# release/F76 core-has-no-special-rule

Change Isolation (`engineering/change-isolation/check.mjs`) has no rule that names Core. A change that holds `packages/kaal-core/` or the Engine files under `.kaal` together with other paths is not refused for that reason, by `check` or by the CLI. `.github travels alone` is unchanged: a change that touches `.github/` contains nothing outside it, with Core paths treated like any other. Whether a change mixes delivery and solution is the detective rule of release/F73.
`````

## Draft change of the checker

Applies to `engineering/change-isolation/check.mjs` (the lines are those of `main`).

- Delete the `CORE` and `CORE_SUPPORT` constants and their comments.
- Delete the block that begins `if (!admitted && paths.some((p) => any(CORE, p)))` and its closing brace (the six lines before `if (paths.some((p) => GITHUB.test(p)))`). `admitted` stays: the ledger code keeps setting it, nothing reads it until the next Change.
- Header: "two repository engineering controls" becomes "one repository engineering control"; rule 1 is removed and the list renumbered; the ledger paragraph says it admits one exact change that `.github travels alone` would refuse.
- The ledger comment "that Core-travels-alone would otherwise refuse" becomes "that the isolation rule would otherwise refuse".

## Text edits

- `.kaal/config/guard/Change-Isolation.md` and `engineering/change-isolation/README.md`: ".github travels alone" only.
- `.github/workflows/change-isolation.yml` comment on line 1 is delivery and is not touched by this Change.
