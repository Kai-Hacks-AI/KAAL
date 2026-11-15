# Core as a Package, and LOVE: Testing

The planned outer tests live in `packages/kaal-core/test/plan/love.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `core/C17` turns them GREEN, adds them to Core's `npm test`, and may add Code tests of its own.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T39: the payload carries a `LOVE` Definition beside `CASE`, and no existing id changes | core/F39, core/A16 | Requirements |
| core/T40: Core is a Capability Node of its own and claims its tree, and neither the Node nor the claim is delivered | core/F40, core/A18 | Requirements |
| core/T41: every entry point and every value it exports is named in the README, and nothing else resolves | core/F41, core/A19 | Architecture |
| core/T42: Core depends on no discipline, through no dependency field and no import | core/N11, core/A17 | Architecture |

Lifecycle and Verification have no test here. Core's lifecycle is planned in a PLAN of its own. What counts as independent evidence is Testing's (`testing/C7`). Core does not test it, and it does not test Testing's classification of Core either.

## RED evidence

The tests run with `npm run build -w kaal-core && node --test packages/kaal-core/test/plan/love.test.mjs`, outside Core's `npm test` until `core/C17`. At `core/C16`:

- **core/T39 and core/T40 are RED, blocked before behavioural assertion.** kaal-core has neither `payload/core/LOVE.md` nor `capability/Core.md`.
- **core/T41 is RED on its behavioural assertion.** Four exported values are named nowhere in the README: `KaalError`, `isKind` and `readContribution` from `kaal-core`, and `isTypeName` from `kaal-core/frontmatter`.
- **core/T42 is GREEN.** It is evidence that Core already depends on no discipline, and it keeps it that way.
