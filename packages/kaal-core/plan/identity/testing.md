# Identity and numbering: Testing

The planned outer tests live in `packages/kaal-core/test/plan/identity.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. The DO turns them GREEN and adds them to Core's `npm test`.

They use `assemble` from `kaal-core/registration` with registrations given as their frontmatter content, as `registration.test.mjs` does. The kinds and prefixes are fixtures: Core prescribes none.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T134: a kind with `numbered` and a holder whose ids follow it assemble with no finding, and `nextFree` returns one more than the highest held, the prefix and 1 when none is held, and never fills a gap | core/F125, core/F127, core/A66, core/A67 | Requirements |
| core/T135: the same id in two scopes is two identities with no finding, `nextFree` answers each scope on its own, and one id twice in a scope is the collision finding | core/F126, core/F127, core/A66 | Requirements |
| core/T136: an id of a numbered kind that is not the prefix and a positive decimal without a leading zero is an `unnumbered-id` finding naming scope, id and kind, and `nextFree` returns null for that scope and kind and says why | core/F126, core/F127, core/N33, core/A66 | Requirements |
| core/T137: `nextFree` returns null with a reason for a scope no registration claims, a kind not defined and a kind that is not numbered, never a first number | core/F127, core/N33, core/A67 | Requirements |
| core/T138: `nextFree` depends only on the registrations given, so the same registrations in any order give the same answer, and a number held only in a registration added to the union is no longer offered | core/F128, core/A67 | Requirements |

## RED evidence

Run with `npm run build -w kaal-core && node --test packages/kaal-core/test/plan/identity.test.mjs`, outside Core's `npm test` until the DO. At `core/C164` all five are RED, blocked before behavioural assertion, because an assembly offers no `nextFree` and a kind states no `numbered`.
