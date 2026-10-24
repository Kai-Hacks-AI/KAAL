# Deterministic Frontmatter: Testing

The planned outer tests live in `packages/kaal-core/test/plan/frontmatter.test.mjs`. Each names, in its title, the contracts it checks. They are immutable to DO and CHECK; `core/C6` turns them GREEN and may add Code tests of its own beside them.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T1: the same frontmatter with two different bodies gives the same result | I1, F5 | Intent |
| core/T2: an undeclared key is invalid, and the finding names it | I2, F2 | Requirements |
| core/T3: each forbidden prose key is invalid in an artifact | I1, F3 | Requirements |
| core/T4: a schema declaring a forbidden key, or a type F1 does not list, is itself invalid | F3 | Requirements |
| core/T5: each value type accepts a conforming value and refuses a non-conforming one | F1, F4 | Requirements |
| core/T6: a missing required key, and a list where none is declared, are invalid | F4 | Requirements |
| core/T7: an artifact with no `kind`, or with a kind that has no schema, is `unknown` | I2, F6 | Requirements |
| core/T8: validating the same bytes twice gives equal results | N2 | Requirements |
| core/T9: the `kaal-core/frontmatter` module graph imports no host module | A1 | Architecture |

N2 across hosts follows from core/T8 running in KAAL's CI on every supported OS once the tests are in a lane; that lane is `core/C6`'s. N3, A3 and A4 are placements, validated by review. F7 is tested in `core/C3`.

## RED evidence

At `core/C5`, all nine tests are RED, and each is **blocked before behavioural assertion**: `kaal-core` exports no `./frontmatter`. They are not in Core's `npm test` and not under `test/acceptance/`, so KAAL's lanes stay green; run them with `npm run test:plan -w kaal-core`.
