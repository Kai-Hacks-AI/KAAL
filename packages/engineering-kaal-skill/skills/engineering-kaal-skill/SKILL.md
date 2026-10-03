---
name: engineering-kaal-skill
description: Engineer KAAL Skills: create, change, verify and register a capability that joins KAAL as a Skill, with its Skill Node, its Agent Skills realization, and its packages/ and engineering/ directories. Use when asked to add, change, check or register a KAAL Skill, or when work touches packages/<capability> or engineering/<capability> for a Skill.
license: MIT
compatibility: Needs Node.js 20 or later. Registering needs the kaal-core package. Written for a repository laid out as packages/<capability>/ and engineering/<capability>/.
---

# Engineering KAAL Skills

Use this to produce or maintain a KAAL Skill. What a KAAL Skill is, and what this capability means, is stated by the Nodes `Skill` and `Engineering Skill` in the installed KAAL: read them there, by following references from Core. This file only tells you how to do the work correctly.

## The shape of one capability

A KAAL Skill is one capability, delivered by one package.

```
packages/<capability>/
  kaal/                   the KAAL contribution: Node files, and seals/<ID>
  skills/<capability>/    the Agent Skill: SKILL.md, references/, scripts/
engineering/<capability>/ the machinery that proves the package: tests, acceptance
```

`<capability>` is a valid Agent Skills name: lowercase letters, digits and single hyphens. When installed, `kaal/` lands under `skills/<capability>/` of the KAAL directory and the Agent Skill under `skills/<capability>/` of the host. Everything in the package must serve that one capability.

## Steps

1. **Find the `Skill` Node** in the installed KAAL: the Node named `Skill`, sealed. Its ID is the SHA-256 of its exact bytes. You need it for the type.
2. **Write the Skill Node** in `kaal/`: front matter with `name`, and `type` as the pair `name: Skill` and that `id`, then a short statement of what the capability means to KAAL, and its scope. Mention no file paths, no commands and no implementation. See `references/REFERENCE.md` for the exact form.
3. **Seal it once its text is final**: `node scripts/seal-node.mjs kaal/<Node file> kaal/seals`. A sealed Node never changes. Changed bytes are another Node; to revise a draft, edit it and seal again, and delete the draft's old marker by hand.
4. **Write the Agent Skill** in `skills/<capability>/SKILL.md`, conforming to the Agent Skills standard. It is the agent-facing realization: do not define the capability in it again, point to the Node. Add `references/` for detail an agent needs only sometimes, and `scripts/` only where a deterministic procedure beats agent judgement.
5. **Engineer the proof** in `engineering/<capability>/`: acceptance that deploys the real packages and shows the capability working, not generic tests of tools.
6. **Check conventions**: `node scripts/check-skill.mjs <repo-root> <capability>`. It reports layout, Agent Skills conformance and seal problems, and repairs nothing.
7. **Check registration**: `node scripts/register-skill.mjs --check <kaal-dir> <capability> packages/<capability>/kaal`. It registers into a throwaway copy through Core, so Core's own rules decide whether the Node is a valid Skill. Then run without `--check` against the real KAAL.

## Rules

- Registration is Core's. Never write into a KAAL directory by hand, add a registry, or change Core to admit a Skill. Core is the door: a capability joins without becoming Core.
- Never edit a sealed Node's bytes, and never reuse another Node's seal.
- Do not put a Skill's Node or seal in `kaal-core`.
- Keep `SKILL.md` under 500 lines and its references one level deep.
- If a check fails, fix the cause. Do not weaken the check or the Node to pass.

## Scripts

- `scripts/seal-node.mjs <node-file> <seals-dir>`: seals a Node by its bytes and prints its ID.
- `scripts/check-skill.mjs <repo-root> <capability>`: checks layout, Agent Skills conformance and seals; exit 0 or 1.
- `scripts/register-skill.mjs [--check] <kaal-dir> <capability> <contribution-dir>`: registers through kaal-core's `registerSkill`.
