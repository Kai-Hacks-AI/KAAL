# Applicability by Host Fact: Testing

The planned outer tests live in `packages/skills/kaal-testing/test/plan/host.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK, and `testing/C40` turns them GREEN and adds them to the suite. They use `kaal-testing/verifiers`' public interface only, on runs given as their exit status and output, and on facts shaped as Hosting's `facts()` returns them.

| Case | Checks | Loop |
| --- | --- | --- |
| testing/T80: a case declared by a host fact that the harness established not holding, reported not applicable with that same applicability, conforms to the not-applicable scenario | testing/F68, testing/F69, testing/F71 | Requirements |
| testing/T81: a host declaration establishes nothing where the fact holds, was not established, is inherited, or has no reason or https evidence; and a verifier that shows another host list, other evidence or no host never conforms | testing/F68, testing/F69 | Requirements |
| testing/T82: where the fact holds, the declared case runs: reported pass it conforms to clean, and reported not applicable, skipped, todo or not run it does not | testing/F70 | Requirements |
| testing/T83: the C29 contract stands: no scenario is added, the platform way is unchanged, and the module still imports nothing | testing/F71, testing/N14 | Architecture |

## RED evidence

The tests run with `node --test packages/skills/kaal-testing/test/plan/host.test.mjs`. At `testing/C39`, three are behavioural RED, and each discriminates the intended missing behaviour:
- testing/T80: the host declaration is not established, so the not-applicable report differs;
- testing/T81: its positive control, the established host declaration, does not conform, so the negatives cannot be told from today's blanket refusal;
- testing/T82: its positive control, a host-declared case not applicable where the fact does not hold, does not conform.

testing/T83 is GREEN at `testing/C39`. It guards what must not change, as a regression case, and is not counted as RED.

**Throwaway.** A throwaway implementation, `lib/verifiers.mjs` with the fourth way and the extended comparison, turns all four GREEN, and the planned tests of `testing/C29` and the implementation tests of `testing/C30` stay GREEN on it. Each mutant below was run against it and killed by these tests, except those marked equivalent.

| Mutant of the throwaway | Killed by |
| --- | --- |
| `host` accepted as any list, empty facts included | testing/T81 (an empty fact the harness established) |
| `evidence` not required with `host` | testing/T81 |
| `evidence` matched anywhere, not as the whole `https` link | testing/T81 |
| `http` evidence accepted | testing/T81 |
| an inherited host fact counted | testing/T81 |
| any falsy `holds` counted as not holding | testing/T81 |
| every fact required not to hold, not one | testing/T80 |
| the fourth way dropped | testing/T80, testing/T81, testing/T82 |
| a `host` declaration not required for the fourth way | testing/T83 |
| `host` not compared | testing/T81 |
| `evidence` not compared | testing/T81 |
| host facts read from a list, not only a map | testing/T81 |
| the scenario text not naming a host fact | testing/T80 |
| an entry that is not an object, with `holds` false, counted | equivalent: Hosting's `facts()` gives only objects, and a list or function with an own `holds` of `false` is not a shape the harness can establish |

The planned tests of `testing/C29` and the implementation tests of `testing/C30` stay GREEN on the throwaway (23 of 23).
