# Optional Composition with Requirements: Testing

The planned outer tests will live in `packages/skills/kaal-architecture/test/plan/composition.test.mjs`, written in `architecture/C10` and turned GREEN by `architecture/C11`. Each title names the contracts it checks. They are immutable to DO and CHECK. The four states are Acceptance scenarios on the packed packages. What RED and GREEN mean, and what counts as evidence, is Testing's.

| Test | Checks | Loop |
| --- | --- | --- |
| architecture/T8: **alone.** A consumer installs and registers only `kaal-architecture`. The Engine verifies, the Skill is placed as shipped, and Graph's `check()` reports nothing for Architecture's Nodes | architecture/I4, architecture/N3, architecture/N4 | Acceptance |
| architecture/T9: **both present.** A consumer registers both packages. A decision Node with a `Placement` Edge to a `Requirement` Node resolves, `out()` from the decision and `in()` to the Requirement both show it, and the Engine verifies | architecture/F7, architecture/F8 | Acceptance |
| architecture/T10: **removal with retained results.** The consumer from T9 removes Requirements. The decision Node and its Edge are unchanged and still admitted. `check()` reports the Edge as unresolved, and the Engine still verifies Architecture's Nodes | architecture/F10, architecture/N4 | Acceptance |
| architecture/T11: **independent upgrade.** In the consumer from T9, the Requirement is replaced by a version with another id. The decision's Edge is unchanged, `check()` reports it as naming another id, and upgrading Architecture alone leaves the decision admitted | architecture/F10, architecture/N4 | Acceptance |
| architecture/T12: `package.json` has no `dependencies`, `peerDependencies` or `optionalDependencies`, and nothing it ships names `kaal-requirements` as a module | architecture/N3 | Architecture |
| architecture/T13: `Placement` is a `KAAL Definition` that states it transfers no ownership. The Node `Architecture` states that naming a Requirement transfers no ownership. The Skill's "With Requirements" section covers working alone, citing, a placement answering none, and a citation that no longer resolves | architecture/F7, architecture/F9, architecture/F10, architecture/F11 | Requirements |

The Test Cases do not judge whether a placement is good, and they do not test Requirements' own behaviour. Those are Architecture's agent and Requirements' own tests.
