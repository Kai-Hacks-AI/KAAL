# kaal-review

KAAL Review: the capability for reviewing work done in KAAL, a human observing the work and Agents reviewing each other's work. It is lightweight on purpose: two Nodes and an Agent Skill, with no scripts. A review grants no authority.

```
payload/Review.md               the Skill Node, typed by Core's KAAL Skill
payload/HOW-ARE-WE-DOING.md     HOW ARE WE DOING?, the Owner's review mnemonic, typed by Core's KAAL Definition
skills/kaal-review/             the Agent Skill: SKILL.md
```

`HOW ARE WE DOING?` is carried over verbatim from KAAL.g2 (`packages/kaal-review/skills/kaal-review/references/how-are-we-doing.md`). Only the mnemonic is carried over. None of KAAL.g2's Review implementation is, and WE and DOING are given no meaning beyond their expansions.

## Register the Nodes

```sh
npx kaal register skill kaal-review node_modules/kaal-review/payload    # Core decides
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.
