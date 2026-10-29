# Ownership Claims as Markdown: Testing

The planned outer tests live in `packages/skills/kaal-testing/test/plan/ownership.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `testing/C25` turns them GREEN and adds them to Testing's `npm test`. Claims are built as bytes in the tests, and the owners are not real Capabilities.

| Case | Checks | Loop |
| --- | --- | --- |
| testing/T45: a claim is `ownership.kaal.md`, typed `Testing/Ownership`, with kind, owner and paths in frontmatter and its prose in the body; it reads as the JSON claim did, and its body never changes the result | testing/F35, testing/A16 | Requirements |
| testing/T46: a path covers the file it names, or everything beneath the directory it names, and never a sibling sharing its prefix | testing/F36 | Requirements |
| testing/T47: a non-conforming Markdown claim is a verified failure naming the file, one with no `Testing/Ownership` type is unknown, and neither attributes | testing/F37 | Requirements |
| testing/T48: until the last claim moves, a JSON claim reads as before with its own pattern rules, and a directory holding both claim files is a verified failure for each | testing/F38 | Requirements |
| testing/T49: Testing's reading is never looser than Core's `kaal-core/frontmatter` with Testing's Type | testing/F39, testing/A16 | Architecture |

This Change also amends testing/T18 (`plan/consumer/testing.md`). It now reads testing/A8's dependency inventory, so `testing/C25` adds rows for `kaal-core` and `kaal-graph` rather than changing a planned test.

## RED evidence

The tests run with `node --test packages/skills/kaal-testing/test/plan/ownership.test.mjs`, outside Testing's `npm test` until `testing/C25`. At `testing/C24`, all five are RED, each **blocked before behavioural assertion**, because `kaal-testing/attribution`'s `CLAIM_FILE` is still `ownership.kaal.json` and it exports no `Testing/Ownership` Type.

**Checked against a throwaway implementation.** A16 was implemented outside the repository: Markdown claims read through `validate` and `readFrontmatter`, with the transition rules. All five tests pass against it. Each of 17 mutants of it fails at least one test. The mutants cover:
- pattern coverage that is prefix-only or exact-only;
- JSON rules applied to Markdown claims, and the other way round;
- unknown reported as a verified failure;
- invalid claims accepted;
- no scope check, or the scope's own directory refused;
- a doubled directory accepted;
- the legacy file name no longer found;
- the schema loosened in `kind`, `owner` or `paths`;
- the kind or the paths misread.

The existing implementation tests that pin `CLAIM_FILE` and read Testing's own JSON claim change with the design in `testing/C25`. They are not planned tests.

testing/T18 stays GREEN at `testing/C24`, and it fails when a dependency is added without a row, when a version differs from its row, or when a row says it serves consumer verification.
