# Setup independence: Testing

The planned outer tests live in `packages/kaal-core/test/plan/setup-independence.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. The DO turns them GREEN, adds them to Core's `npm test`, and updates the pinned ids for the Definition visibly.

No test reads the wording of the Definition. Each checks the verdict the judge returns for a declared manifest.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T129: a package naming only the permitted shared packages and non-KAAL packages is independent, whatever its `devDependencies` hold | core/F121, core/F122, core/A65 | Requirements |
| core/T130: a KAAL package in `dependencies`, `optionalDependencies`, `bundleDependencies` or a non-optional peer is a finding naming field and package; an optional peer is not; a `permitted` the caller passes replaces the default | core/F122, core/A65 | Requirements |
| core/T131: a manifest that is missing, not an object, or whose dependency fields are not the shape they should be is `unknown`, never independent | core/N32, core/F122, core/A65 | Requirements |

## RED evidence

Run with `npm run build -w kaal-core && node --test packages/kaal-core/test/plan/setup-independence.test.mjs`, outside Core's `npm test` until the DO. At `core/C162` all three are RED, blocked before behavioural assertion, because `kaal-core/installation` exports no `judgeSetupIndependence`.
