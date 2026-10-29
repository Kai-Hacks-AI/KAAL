# Consumer Verification: Testing

The planned outer tests live in `packages/skills/kaal-testing/test/plan/consumer.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. `testing/C10` turns them GREEN and adds them to Testing's `npm test`.

| Test | Checks | Loop |
| --- | --- | --- |
| testing/T16: the Node's consumer verification section states delivery, the fail-closed entry point and the three results verbatim | testing/F11, testing/F12, testing/F13 | Requirements |
| testing/T17: it states the named subject, isolation and a repeatable procedure, the two scopes, and whose observation a consumer's result is, verbatim | testing/F14, testing/F15, testing/F16, testing/F17 | Requirements |
| testing/T18: the section names no product, package manager, version control system or hosting service, and kaal-testing's exports and runtime dependencies are unchanged | testing/N5, testing/I6 | Architecture |
| testing/T19: the Agent Skill and the README carry the section, and the Skill points to the Node | testing/A8 | Architecture |

What stays validation: whether the statements say what the Owner meant, and whether a product's realization meets them. The second is shown by that product's own acceptance scenarios, Guard's first.

## RED evidence

The tests run with `node --test packages/skills/kaal-testing/test/plan/consumer.test.mjs`, outside Testing's `npm test` until `testing/C10`. At `testing/C9`, all four are RED, each blocked before behavioural assertion, because the Node has no `## Consumer verification` section.

## Amendment

`testing/C13` narrows testing/F15 after the Owner's review of `testing/C10`: identical installed bytes do not ensure identical outcomes when time, network, environment or a case's own nondeterminism differ. testing/F15 now promises a repeatable procedure and faithfully reported outcomes, evidence and conditions, never the same result from the same installation. Fail-closed behaviour (testing/F12, testing/F13) is unchanged. testing/T17 states the narrowed text.
