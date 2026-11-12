# @kaihacksai/kaal-release

KAAL Release: how to design and drive an end-to-end release process, for any target, as a Skill. It is Skill-level guidance with one Script, `analyze-flow.mjs`, hosted inside the Skill, and it does not verify anyone's release. The Script arrives with its own Change (`coordination/C1`) and is not in this package until that Change lands.

```
payload/Release.md                         the Skill Node, typed by Core's KAAL Skill
skills/kaal-release/SKILL.md               the Agent Skill: the release loop
skills/kaal-release/references/npm.md      the loop applied to npm, as one example
skills/kaal-release/scripts/analyze-flow.mjs   the hosted Script (arrives with coordination/C1)
```

The Skill names the decisions a release needs and the order to take them in. It reads the repository's own record of each decision and asks the Owner when there is none. It delegates implementation, protection, verification, validation and execution to the roles that own them.

## Register the Node

```sh
npx kaal register skill kaal-release node_modules/@kaihacksai/kaal-release/payload    # Core decides
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.
