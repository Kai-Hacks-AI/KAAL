# Test Locations by Purpose and Owner: Testing

The planned outer tests live in `packages/skills/kaal-testing/test/plan/locations.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `testing/C44` turns them GREEN and adds them to Testing's `npm test`.

| Case | Checks | Loop |
| --- | --- | --- |
| testing/T88: lane scenarios are discovered in `test/engineer/`, never in `test/embed/` or `test/external/`, as `{ workspace, path }` sorted by path | testing/F76, testing/N16 | Requirements |
| testing/T89: the location alone decides; `package.json` `files` never does | testing/F76 | Requirements |
| testing/T90: during the migration, `test/acceptance/` is still read beside `test/engineer/` | testing/F77 | Requirements |
| testing/T91: the README states the locations, the `install()` obligation, no `test/external/`, and that they are not kinds | testing/F78 | Requirements |

This PLAN also amends testing/T76 and testing/T79 (`testing/C35`): they read Testing's delivered cases in `test/embed/`. They stay RED for `testing/C38`.

## RED evidence

At `testing/C43`, all four are RED by behavioural assertion:
- testing/T88, testing/T89 and testing/T90 fail because `discover` reads no `test/engineer/`;
- testing/T91 fails because the README states no locations.

Each was checked against a throwaway implementation (testing/A24, with the README sentence) and against 10 mutants of it, all killed:
- reading only the legacy directory;
- reading only `test/engineer/`;
- also reading `test/embed/`;
- also reading `test/external/`;
- the wrong directory name;
- nested files;
- any `.mjs`;
- an unsorted result;
- the first revision's exclusion by `files`;
- the wrong workspace field.

The first revision's `files` rule is among the killed mutants (testing/T89).
