# Structured Frontmatter Values: Testing

The planned outer tests live in `packages/kaal-core/test/plan/structured.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `core/C27` DO turns them GREEN, adds them to Core's `npm test`, and may add Code tests of its own.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T60: a schema declaring `record`, `map` and `either`, nested and as lists, is valid; each malformed declaration is a schema finding with its `at` | core/F57–core/F60 | Requirements |
| core/T61: a record conforms when every declared field conforms; an undeclared field, a missing required field, a wrong field and a non-mapping are invalid, each named by `key` and `at` | core/F57, core/F61 | Requirements |
| core/T62: a prose field name is invalid in an artifact's record and in a schema's `fields` | core/I19, core/F57 | Intent |
| core/T63: a map conforms when every key matches and every value conforms; a bad key or value is named; an empty map conforms | core/F58, core/F61 | Requirements |
| core/T64: `either` conforms when any alternative does, and is invalid when none does, item by item in a list | core/F59, core/F61 | Requirements |
| core/T65: findings on flat frontmatter are unchanged and carry no `at`; the same bytes give the same result, whatever the body | core/N17, core/F61 | Requirements |
| core/T66: `core/A25`'s Registration shape, with `core/T50`'s fixture kinds and instances, validates against a schema written with these kinds; each break in it is found where it is | core/I19, core/A29 | Intent |

**Why the tests discriminate.** I checked the tests against an uncommitted throwaway implementation, which turned all seven GREEN with Core's 152 tests still passing. Each of these weaker implementations was then caught:

| Implementation | Caught by |
| --- | --- |
| a record accepts undeclared fields | core/T61, core/T64, core/T66 |
| `required` is ignored inside a record | core/T61, core/T64, core/T66 |
| prose is allowed as a field name | core/T62 |
| map keys are left unchecked | core/T63 |
| `either` requires every alternative | core/T64, core/T66 |
| findings carry no `at` | core/T61–core/T64, core/T66 |
| a flat list's finding gains an index | core/T65 |
| `either` is accepted with a single alternative | core/T60 |

The following are validated by review:
- `core/A30` is a placement;
- the Registration Type's own schema is `core/C26`'s;
- `N17` across hosts follows from core/T65 in Core's lanes once `core/C27` DO adds the tests.

## RED evidence

At `core/C27`, all seven tests are RED for the intended reason, the missing value kinds:
- `checkSchema` refuses declarations using `record`, `map` and `either`, which `core/F1` does not list;
- `validate` throws on a supplied schema that uses them.

core/T65's flat assertions already hold today; they guard that the DO changes no existing finding. Run the tests with `npm run build -w kaal-core && node --test packages/kaal-core/test/plan/structured.test.mjs`. They stay outside Core's `npm test` until `core/C27` DO.
