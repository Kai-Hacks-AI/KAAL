# Catalog only: Testing

The planned outer test lives in `packages/kaal-core/test/plan/catalog-only.test.mjs`. Its title names the contracts it checks. It is immutable to DO and CHECK. The DO turns it GREEN, adds it to Core's `npm test`, and updates Core's own tests and README.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T128: `kaal-core` exports `catalog` and no `capabilities`, and `catalog` returns the Skills and Exchanges an Engine holds as `capabilities` did | core/F120, core/A63 | Requirements |

## RED evidence

Run with `npm run build -w kaal-core && node --test packages/kaal-core/test/plan/catalog-only.test.mjs`, outside Core's `npm test` until the DO. At `core/C156` it is RED on one assertion: Core still exports `capabilities`. The `catalog` half already holds.
