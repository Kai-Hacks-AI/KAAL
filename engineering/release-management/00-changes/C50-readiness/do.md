# C50 do

## What the DO added

- `04-controls/CTL3-verify-package/CTL3.md`: control `release/CTL3` verify Package, detective, has `release/I28`.
- `01-intent/I28-publishing-intact/I28.md`: Intent `release/I28` "publishing intact".
- `05-src/publishing/verify-package/judge.mjs`: pure `judgePackage({manifest, directory, registry}, declaration)`; `verify-package.json` holds scope `@kaihacksai/` and the repository URL.
- T610 to T614 renamed from `.red.mjs` to `.test.mjs`; all green. T615 is added in the DO after the CPO review (Semantic Versioning of the `version` and `dependency-exact` rules), and is green.

## Not done, as planned

`engineering/release` is untouched. Nothing is wired, no workflow or ruleset changed, nothing published.

## Renamed before merge (Owner decision)

The control is named "verify Package" and is detective: it reveals and blocks nothing by itself. A preventive control that wires it in is a separate, second control. The folders are `04-controls/CTL3-verify-package/` and `05-src/publishing/verify-package/` (declaration `verify-package.json`), the judge is `judgePackage`. The Change keeps its id and name C50 and its collector.
