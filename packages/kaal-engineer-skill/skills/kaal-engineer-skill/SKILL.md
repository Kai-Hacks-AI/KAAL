---
name: kaal-engineer-skill
description: Engineer KAAL Skills so each one is a correct KAAL Skill and a conformant, packaged Agent Skill. Use when creating, changing, checking or packaging a KAAL Skill, or when work touches a Skill package under packages/ in a KAAL repository.
license: MIT
compatibility: Needs Node.js 20.1 or later. Package checks also need npm and the kaal-core package.
---

# Engineering KAAL Skills

Use this to produce or maintain a KAAL Skill. What a KAAL Skill is, and what this capability means, is stated by the Nodes `KAAL Skill` and `Engineer Skill` in a KAAL Engine: read them there, starting from the Engine's `AGENTS.md`. This file only tells you how to do the work correctly.

## The shape of one capability

A KAAL Skill is one capability, delivered by one npm package, under one name. The package directory, the npm name, the capability Core registers, the Agent Skill directory and its `name` are the same string: lowercase letters, digits and single hyphens, at most 64 characters.

```
packages/<capability>/
  package.json            "name": "<capability>"; "files" ships payload and skills
  payload/                the KAAL contribution: Nodes, and nothing else
  skills/<capability>/    the Agent Skill: SKILL.md, and optional references/, scripts/, assets/
```

The Nodes carry what the capability means to KAAL. The Agent Skill is its agent-facing form: it tells an agent how to do the work and points to the Nodes rather than defining the capability again.

## Steps

1. **Find Core's `KAAL Skill` Node** with `kaal resolve "KAAL Skill"`. Its id, the SHA-256 of its exact bytes, is the type every Skill Node names. A Node merely named like it is not it.
2. **Write the Skill Node** in `payload/`, in the exact Form from [references/kaal-skill.md](references/kaal-skill.md): what the capability means to KAAL, and its scope. No paths, commands or implementation. Keep its bytes exact: mark `payload/**` as `-text` in `.gitattributes`.
3. **Write the Agent Skill** in `skills/<capability>/SKILL.md`, following [references/agent-skills.md](references/agent-skills.md). The `description` is what makes it discoverable: say what it does and when to use it, with the words a task would use.
4. **Ship both.** List `payload` and `skills` in the package's `files`.
5. **Check the Agent Skill**: `node scripts/check-skill.mjs <skill-dir>`.
6. **Check the package as shipped**: `node scripts/check-skill.mjs --package packages/<capability>`. It asks npm what the package ships, checks the shipped Agent Skill, and registers the shipped `payload/` through kaal-core into a throwaway Engine, so Core decides whether it is a valid Skill. Add `--engine <dir>` to register against a copy of an existing Engine instead.
7. **Prove it in acceptance**: pack the package, install it into a fresh host, register it with `kaal register skill <capability> node_modules/<capability>/payload`, and show the capability working from what was installed.

## Rules

- Registration is Core's. Never write into an Engine by hand, add a registry, or change Core to admit a Skill.
- Assume no host. The Agent Skill is a self-contained directory a host places wherever it keeps skills; reference only files inside it, by relative path.
- Do not put a Skill's Node in kaal-core.
- If a check fails, fix the cause. Do not weaken the check or the Node to pass.

## Scripts

- `scripts/check-skill.mjs <skill-dir>`: Agent Skills conformance of one skill directory.
- `scripts/check-skill.mjs --package <package-dir> [--engine <dir>]`: the package as npm ships it.

Both exit 0 when everything holds and 1 with one line per problem. Warnings do not fail. They repair nothing.
