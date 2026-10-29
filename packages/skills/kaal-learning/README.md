# kaal-learning

KAAL Learning: the capability for knowledge in KAAL, retaining what has been understood from work done in KAAL, improving that understanding, and letting later work start from it. It is lightweight on purpose: its Nodes and Agent Skills, with no scripts. Knowledge grants no authority.

```
payload/Learning.md       the Capability Node, typed by Core's KAAL Capability
payload/WORK.md           WORK, Worker Owner Reviewer Knowledge, typed by Core's KAAL Definition
skills/kaal-learning/     the Agent Skill: SKILL.md
skills/kaal-retro/        the Retro Agent Skill: SKILL.md
```

It holds no knowledge, keeps no store, index or records, and defines no relationship type. The Owner's Learning mnemonics, BRAIN, CEIL, ROAD and WORK, each come in as a KAAL Definition of their own, in Changes of their own. WORK is the retrospective on completed work. The `kaal-retro` Agent Skill runs one, with 4L (Liked, Learned, Lacked, Longed) as its default prompts, and writes it in a source the repository declares, by default the pull request that realized the work. An entry is retrievable only while its source is available. It creates no rule, backlog item or Change.

## Register the Nodes

```sh
npx kaal register capability kaal-learning node_modules/kaal-learning/payload    # Core decides
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.
