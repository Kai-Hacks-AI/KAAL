# Acceptance Discovery of Shipped Cases: Testing

The planned outer tests live in `packages/skills/kaal-testing/test/plan/discover.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `testing/C44` turns them GREEN and adds them to Testing's `npm test`.

| Case | Checks | Loop |
| --- | --- | --- |
| testing/T88: a workspace whose `files` ships `test/acceptance`, in any of the seven forms, has no lane scenario; one beside it that does not is discovered as before | testing/F76, testing/N16 | Requirements |
| testing/T89: a workspace whose `files` does not ship `test/acceptance`, or whose `package.json` is absent, unreadable or has no files list, keeps its scenarios | testing/F77 | Requirements |
| testing/T90: the README's acceptance section states the rule | testing/F78 | Requirements |

## RED evidence

At `testing/C43`:
- testing/T88 is RED by behavioural assertion, because `discover` returns the product workspace's scenario.
- testing/T90 is RED by behavioural assertion, because the README does not state the rule.
- testing/T89 is GREEN by design. It guards today's behaviour against an over-broad rule, so it discriminates among implementations of testing/F76, not between today and the DO.

Each was checked against a throwaway implementation (testing/A24) and against 13 mutants of it, all killed: no exclusion, an unanchored or end-unanchored pattern, only `test/acceptance`, only `test`, no `./` form, no trailing forms, any `test…` prefix, a string `files`, an unreadable `package.json` counted as shipping, a non-string entry such as `["test"]` counted, a negated entry counted as shipping, and excluding every workspace.
