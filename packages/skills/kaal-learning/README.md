# kaal-learning

KAAL Learning: the capability for knowledge in KAAL, retaining what has been understood from work done in KAAL, improving that understanding, and letting later work start from it. It is lightweight on purpose: one Node and an Agent Skill, with no scripts. Knowledge grants no authority.

```
payload/Learning.md       the Skill Node, typed by Core's KAAL Skill
skills/kaal-learning/     the Agent Skill: SKILL.md
```

This package establishes the capability only. It holds no knowledge, keeps no store, index or records, and defines no relationship type. The Owner's Learning mnemonics, BRAIN, CEIL, ROAD and WORK, each come in as a KAAL Definition of their own, in Changes of their own.

KAAL.g2 had a `kaal-learning` package. None of it is carried over: neither its Nodes nor its implementation.

## Register the Nodes

```sh
npx kaal register skill kaal-learning node_modules/kaal-learning/payload    # Core decides
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.
