# kaal-learning

KAAL Learning: the capability for knowledge in KAAL, retaining what has been understood from work done in KAAL, improving that understanding, and letting later work start from it. It is lightweight on purpose: its Nodes and Agent Skills, with no scripts. Knowledge grants no authority.

```
payload/Learning.md       the Capability Node, typed by Core's KAAL Capability
payload/BRAIN.md          BRAIN, Be Right And Improve Network, typed by Core's KAAL Definition
payload/CICERO.md         CICERO, Content In Context Enables Retrievable Overview, typed by Core's KAAL Definition
payload/WORK.md           WORK, Worker Owner Reviewer Knowledge, typed by Core's KAAL Definition
skills/kaal-learning/     the Agent Skill: SKILL.md
skills/kaal-retro/        the Retro Agent Skill: SKILL.md
```

It keeps no central store, index or records of knowledge, which stays in the context responsible for it, and it defines no relationship type. Each of the Owner's Learning mnemonics comes in as a KAAL Definition of its own, in a Change of its own. BRAIN is how knowledge is kept: in the context that owns it, improved without rewriting, with duplication and contradiction surfaced to their owners rather than resolved automatically. WORK is the retrospective on completed work. The `kaal-retro` Agent Skill runs one, with 4L (Liked, Learned, Lacked, Longed) as its default prompts, and writes it in a source the repository declares, by default the pull request that realized the work. An entry is retrievable only while its source is available. It creates no rule, backlog item or Change. CICERO, which Learning hosts for all of KAAL, is how content is found again: it stays in its own context, and an overview refers to it without taking its authority.

## Register the Nodes

```sh
npx kaal register capability kaal-learning node_modules/kaal-learning/payload    # Core decides
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.
