# kaal-learning

KAAL Learning: the capability for knowledge in KAAL, retaining what has been understood from work done in KAAL, improving that understanding, and letting later work start from it. It is lightweight on purpose: its Nodes and an Agent Skill, with no scripts. Knowledge grants no authority.

```
payload/Learning.md       the Skill Node, typed by Core's KAAL Skill
payload/BRAIN.md          BRAIN, Be Right And Improve Network, typed by Core's KAAL Definition
skills/kaal-learning/     the Agent Skill: SKILL.md
```

It keeps no central store, index or records of knowledge, which stays in the context responsible for it, and it defines no relationship type. Each of the Owner's Learning mnemonics comes in as a KAAL Definition of its own, in a Change of its own. BRAIN is how knowledge is kept: in the context that owns it, improved without rewriting, with duplication and contradiction surfaced to their owners rather than resolved automatically.

## Register the Nodes

```sh
npx kaal register skill kaal-learning node_modules/kaal-learning/payload    # Core decides
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.
