# Setup independence: Testing

The planned outer tests live in `packages/kaal-core/test/plan/setup-independence.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. The DO turns them GREEN, adds them to Core's `npm test`, and updates the pinned ids for the Definition visibly.

No test reads the wording of the Definition. Each checks the verdict the judge returns for a declared manifest.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T129: a package naming only Foundation, Hosting and non-KAAL packages is declared independent, whatever its `devDependencies` hold, and its demonstrated verdict is unknown | core/F121, core/F122, core/F123, core/A65 | Requirements |
| core/T130: a KAAL package in `dependencies`, `optionalDependencies`, `bundleDependencies` or a non-optional peer is a finding naming field and package; an optional peer is not | core/F122, core/A65 | Requirements |
| core/T131: a manifest that is missing, not an object, or whose dependency fields are not the shape they should be is `unknown`, never independent | core/N32, core/F122, core/A65 | Requirements |
| core/T132: an accepted dependency marks its finding accepted and makes the setup acceptable, and the package stays declared dependent; an acceptance of an unknown verdict or of another package changes nothing; Hosting is not removable from the shared set | core/F124, core/F122, core/A65 | Requirements |
| core/T133: the payload carries a `Setup Independence` Definition typed by `KAAL Definition`, it is admitted, and `installationFormat()` still names the carried Installation Contract by its exact bytes | core/F121, core/A64 | Requirements |

## RED evidence

Run with `npm run build -w kaal-core && node --test packages/kaal-core/test/plan/setup-independence.test.mjs`, outside Core's `npm test` until the DO. At `core/C162` all five are RED, blocked before behavioural assertion, because `kaal-core/installation` exports no `judgeSetupIndependence`, and the payload carries no `Setup Independence` Definition.
