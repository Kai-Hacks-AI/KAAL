# Scoped Package Name: Testing

The planned outer tests live in `packages/extensions/kaal-hosting/test/plan/release.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. Run them with `npm run test:plan -w kaal-hosting`. `hosting/C11` turns them GREEN and moves them into Hosting's `npm test`, so they run in the Linux, Windows and macOS Hosting lanes.

| Test | Checks | Loop |
| --- | --- | --- |
| hosting/T21: the package is `@kaihacksai/kaal-hosting` 0.0.1, public, with its repository directory, and with its exports, files, engines, license and runtime dependencies unchanged; the README names it and how to install it | hosting/F15 | Requirements |
| hosting/T22: no module specifier, dependency entry or workspace selector in the repository names `kaal-hosting`, and each names `@kaihacksai/kaal-hosting` instead | hosting/F16 | Requirements |
| hosting/T23: the lockfile links `node_modules/@kaihacksai/kaal-hosting` to the workspace and has no entry for `kaal-hosting` | hosting/F16 | Requirements |
| hosting/T24: the packed tarball holds exactly the intended files, installs alone into a fresh consumer outside the repository as `node_modules/@kaihacksai/kaal-hosting`, and a consumer script runs `within`, `reconcile` and `execute` through `@kaihacksai/kaal-hosting` and reads `EXCLUSIONS` from `@kaihacksai/kaal-hosting/conformance` | hosting/I5, hosting/F17 | Intent |

hosting/A7 and hosting/A8 are placements, validated by review. The Limits are stated, not tested.

## RED evidence

At `hosting/C10`, hosting/T21–T24 are RED by behavioural assertion. The package's `name` is `kaal-hosting` (T21). The repository holds its references under the old name, in Graph, Core, Testing, the Engineer skill, Engineering and the root `package.json` (T22). The lockfile links `node_modules/kaal-hosting` (T23). The packed tarball has the intended files, but installs at `node_modules/kaal-hosting`, so the consumer finds no `@kaihacksai/kaal-hosting` (T24). They are not in Hosting's `npm test`, so KAAL's lanes stay green.
