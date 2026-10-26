# kaal-architecture

KAAL Architecture: architectural decisions in KAAL, Enterprise Architecture and Solution Architecture. It is lightweight on purpose: two Nodes and an Agent Skill, with no scripts, no sourcing engine and no registry of options. It is not part of Core. Core provides the `KAAL Skill` type and admission, and this capability joins through them.

```
payload/Architecture.md         the Skill Node, typed by Core's KAAL Skill
payload/URBAN.md                URBAN, Use, Rent, Buy, Adapt, New, typed by Core's KAAL Definition
skills/kaal-architecture/       the Agent Skill: SKILL.md
```

Architecture owns the decision and its grounds. Engineering realizes the chosen solution, including whatever Adapt or New it calls for.

The package that names URBAN ships its Definition, so no Skill invokes URBAN without a file defining it.

## Register the Nodes

```sh
npx kaal register skill kaal-architecture node_modules/kaal-architecture/payload    # Core decides
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.
