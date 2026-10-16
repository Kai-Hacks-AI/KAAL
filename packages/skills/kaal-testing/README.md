# kaal-testing

KAAL Testing: how a capability's tests are designed, and how their evidence is reported. It is not part of Core. Core provides the `KAAL Skill` type and admission, and this capability joins through them.

```
payload/Testing.md                     the Skill Node, typed by Core's KAAL Skill
skills/kaal-testing/                   the Agent Skill: SKILL.md
skills/kaal-testing/references/        findings.md
```

The Node carries what Testing means to KAAL. The Agent Skill tells an Agent how to do the work and points to the Node. It assumes no host and names no particular system.

## What it teaches

A capability's evidence comes from three loops, and none stands in for another:
- **Architecture conformance:** the capability respects the boundaries it declares. This is verified mechanically where possible, and validated by an Agent or a person where not.
- **Capability acceptance:** the delivered capability behaves as its contract states.
- **Implementation:** internal behaviour, test first.

An invariant is tested exhaustively where it is owned, and its integration selectively where it is consumed.

Findings are verified failures, potential defects, architectural concerns or unknowns, and the kinds are never merged. A clean result shows only what its checks cover.

## Boundaries

Testing is semantic and behavioural only. It is no test runner or framework, keeps no registry, and runs nothing.

Each capability owns its contracts and its cases. The obligation to demonstrate them belongs to engineering, and so do running tests, builds and checks.

## Register the Node

```sh
npx kaal register skill kaal-testing node_modules/kaal-testing/payload
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.
