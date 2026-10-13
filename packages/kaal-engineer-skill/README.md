# kaal-engineer-skill

KAAL Engineer Skill: the capability for engineering KAAL Skills, so that each one is a correct KAAL Skill and, in its agent-facing form, a conformant Agent Skill ([agentskills.io](https://agentskills.io/specification)). It is not part of Core. Core provides the `KAAL Skill` type and registration, and this capability joins through them.

One capability, one package, one name, delivered in two parts:

```
payload/Engineer-Skill.md         the KAAL contribution: the Node, typed by Core's KAAL Skill
skills/kaal-engineer-skill/       the Agent Skill: SKILL.md, references/, scripts/check-skill.mjs
```

The Node carries what the capability means to KAAL. The Agent Skill tells an agent how to do the work, and points to the Node rather than defining it again. It assumes no host: a host places `skills/kaal-engineer-skill/` wherever it keeps skills.

## Install

```sh
npm install kaal-core kaal-engineer-skill
npx kaal init                                                                       # or: --engine <dir>
npx kaal register skill kaal-engineer-skill node_modules/kaal-engineer-skill/payload
npx kaal list                                                                       # skill <id> Engineer Skill
```

## Check a Skill

```
kaal-engineer-skill <skill-dir>                                 Agent Skills conformance of one skill directory
kaal-engineer-skill --package <package-dir> [--engine <dir>]    a KAAL Skill package, as npm ships it
```

The first form checks the standard's rules that bytes can decide. That covers frontmatter limited to the standard's fields; `name` following the grammar and matching its directory; `description` at 1-1024 characters; `compatibility` at 1-500 characters; and `metadata` as a map of strings. It also checks that every relative file reference in `SKILL.md` resolves inside the skill. A `SKILL.md` of 500 lines or more is only warned about. Frontmatter is read as a plain subset of YAML, and anything outside it is reported rather than guessed at.

The second form asks npm what the package ships and checks it as shipped. The package name, capability and Agent Skill must be one name. The package must ship exactly one Agent Skill, and that skill must conform. The `payload/` must be registered through kaal-core's `registerSkill` into a throwaway Engine, so Core alone decides whether it is a valid Skill. That step needs kaal-core installed.

Both forms exit 0 when everything holds, 1 with one line per problem, and 2 on misuse. They repair nothing. The same checks are importable as `checkSkill(dir)` and `checkPackage(dir, { engine })`. The script needs Node.js 20.1 or later, and `--package` also needs npm.

## License

MIT. See `LICENSE`. The license covers this package's contents only.
