# Testing 0.0.1 Release Readiness: Testing

The planned outer tests live in `packages/skills/kaal-testing/test/plan/release.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `testing/C36`–`testing/C38` turn them GREEN, and `testing/C38` adds them to the publisher's suite. They read the source workspace and a packed and installed copy only. They judge the installed verification with Testing's own contract (`judge`, testing/F45), and judge the coverage with `account` (testing/F51).

| Case | Checks | Loop |
| --- | --- | --- |
| testing/T74: the package states its scoped name, its version, public access and exact registry dependencies, and no importer uses its old name | testing/F59 | Requirements |
| testing/T75: the package ships its six documents; they cite no plan, Change or repository path as authority, and the README links each | testing/F60 | Requirements |
| testing/T76: the shipped manifest gives every other shipped file's SHA-256, the delivered cases, the supported platforms, and a resolved coverage of every identifier the documents define | testing/F61, testing/F64, testing/F65, testing/F66 | Requirements |
| testing/T77: in the source workspace npm test runs every declared suite, the publisher's and the consumer's; nothing it needs runs in an installation | testing/F62 | Requirements |
| testing/T78: packed and installed alone in a fresh consumer, npm test there verifies the installed copy and conforms to the shared verifier contract's clean scenario | testing/F59, testing/F61, testing/F63, testing/F64, testing/N12 | Architecture |
| testing/T79: the installed verification imports only Node's built-ins, so a broken library cannot mask itself, and no delivered case reads this repository | testing/N12, testing/N13 | Architecture |

## RED evidence

The tests run with `node --test packages/skills/kaal-testing/test/plan/release.test.mjs`, outside every `npm test` until `testing/C38`. At `testing/C35`, all six are RED. Two are behavioural RED and four are blocked RED:

- **Behavioural RED**, which discriminates the intended missing behaviour:
  - testing/T74: the name is `kaal-testing`, not `@kaihacksai/kaal-testing`;
  - testing/T77: no `test:publisher` or `test:consumer` suite is declared.
- **Blocked RED**, by an absent artifact before any behavioural assertion. These are not counted as discriminating:
  - testing/T75: `docs/intent.md` does not exist;
  - testing/T76: `test/verify.json` does not exist, and `account` does not exist until `testing/C34`;
  - testing/T78: the installed copy is not at `node_modules/@kaihacksai/kaal-testing`;
  - testing/T79: `test/verify.mjs` does not exist.

No throwaway implementation is run for this PLAN. Its DOs are the package's own files, and each DO shows its tests turning GREEN on the real package. testing/T78 judges with `judge`, which `testing/C30`'s 75 mutants already check. testing/T76 judges with `account`, which `testing/C33`'s 43 mutants check.

**The rename and planned tests.** These tests import Testing by its new name, so the rename never edits them. testing/T74 requires that `testing/C36` rewrite each other module specifier, including those in earlier planned tests. That rewrite changes nothing else in those files, as hosting/F16 states, and is the only edit a DO makes to a planned test.
