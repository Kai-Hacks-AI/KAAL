# kaal-review

Review for any repository: a human observing work, and Agents reviewing each other's work, so that review enhances agent leverage. The Agent Skill is general purpose and stands on its own; it needs no KAAL Engine and names no capability. Four Nodes carry the same meaning for an Engine that wants it as a deeper reference. A review grants no authority.

```
payload/Review.md                       the Skill Node, typed by Core's KAAL Skill
payload/HOW-ARE-WE-DOING.md             HOW ARE WE DOING?, the Owner's review mnemonic, typed by Core's KAAL Definition
payload/ROWING.md                       ROWING, typed by Core's KAAL Definition
payload/TOGETHER-WE-CAN-GO-FAR.md       TOGETHER WE CAN GO FAR, typed by Core's KAAL Definition
skills/kaal-review/                     the Agent Skill: SKILL.md
```

`HOW ARE WE DOING?` is carried over verbatim from KAAL.g2 (`packages/kaal-review/skills/kaal-review/references/how-are-we-doing.md`). Only the mnemonic is carried over. None of KAAL.g2's Review implementation is, and WE and DOING are given no meaning beyond their expansions.

## Use the Skill

What the Skill needs, and what it does and does not do in a target repository, is declared in `skills/kaal-review/references/standalone.md`. Install `skills/kaal-review/` as an Agent Skill in any repository, and ask an Agent to review a change, a pull request, a plan or another Agent's result.

## Register the Nodes (optional, with a KAAL Engine)

```sh
npx kaal register skill kaal-review node_modules/kaal-review/payload    # Core decides
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.
