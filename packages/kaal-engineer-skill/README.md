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

The checker exits 0 when nothing is found, 1 on a standard or kaal violation, and 2 on misuse or when Hosting refuses to read the directory. A `SKILL.md` of 500 lines or more is only warned about. It repairs nothing, and needs Node.js 20.1 or later.

Validation and host access are separate. `scripts/validate.mjs` judges a skill from a host-independent representation of it: its directory name and its files, keyed by `/`-separated relative path. It touches no host, and it is the package's API, `checkSkill(name, files)`. It owns no YAML or Markdown semantics: the frontmatter is read by [yaml](https://www.npmjs.com/package/yaml), and references by [commonmark](https://www.npmjs.com/package/commonmark), the CommonMark reference implementation. `scripts/check-skill.mjs` is the entry point. It obtains the files through kaal-hosting's `read(dir)`, so Hosting decides how links are treated and what it refuses.

## Register the Node

```sh
npx kaal register skill kaal-engineer-skill node_modules/kaal-engineer-skill/payload    # Core decides
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.
