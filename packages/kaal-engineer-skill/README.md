# kaal-engineer-skill

KAAL Engineer Skill: the capability for producing and updating valid KAAL Skills, including the conformance of their Agent Skills to the [Agent Skills standard](https://agentskills.io/specification). It is not part of Core. Core provides the `KAAL Skill` type and admission, and this capability joins through them.

```
payload/Engineer-Skill.md         the Skill Node, typed by Core's KAAL Skill
skills/kaal-engineer-skill/       the Agent Skill: SKILL.md, references/, scripts/check-skill.mjs
```

The Node carries what the capability means to KAAL. The Agent Skill tells an agent how to do the work and points to the Node. It assumes no host: a host places `skills/kaal-engineer-skill/` wherever it keeps skills.

## Responsibilities

This Skill checks an Agent Skill against the standard, plus the KAAL engineering rules beyond it. It does not decide how a Skill is packaged or delivered. It does not re-check what Core decides, either: a Node's identity, its type resolution and its admission into an Engine stay with Core (`kaal identify`, `kaal register`).

## Check an Agent Skill

```
kaal-engineer-skill <skill-dir>
```

Each finding says its kind:

- `standard`: a violation of the Agent Skills standard. These cover frontmatter limited to the standard's fields, `name` following the grammar and matching its parent directory, `description` at 1-1024 characters, `compatibility` at 1-500 characters, `metadata` as a map of strings, and frontmatter YAML itself refuses or does not read as strings.
- `kaal`: a KAAL engineering rule beyond the standard. Every relative file reference in `SKILL.md` resolves inside the skill, so it works wherever a host places it.
- `unsupported`: frontmatter outside the plain YAML subset the checker reads. It may be valid, so conformance is left undecided.

The checker exits 0 when nothing is found, 1 on a standard or kaal violation, 3 when the only findings are unsupported, and 2 on misuse. A `SKILL.md` of 500 lines or more is only warned about. The checker reads nothing outside the skill directory and repairs nothing. It is importable as `checkSkill(dir)`, and needs Node.js 20.1 or later.

## Register the Node

```sh
npx kaal register skill kaal-engineer-skill node_modules/kaal-engineer-skill/payload    # Core decides
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.
