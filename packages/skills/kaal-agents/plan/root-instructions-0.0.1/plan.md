# The root AGENTS.md makes an Agent KAAL aware (agents/C13 PLAN)

This PLAN ships no code and edits no instruction file. It proposes what the root `AGENTS.md` keeps, where each specific rule it holds today moves, and which release carries each move. It authorizes no edit, sync, promotion or publication. Kai approves before any of it is applied.

## Intent

Kai's ruling (4 Nov): the root file makes an Agent KAAL aware. It does not hold specific rules. Today it holds one: under `## Foundation`, "Never use `node:crypto` or a copied implementation for a KAAL digest", with the bin-invocation rule beside it. That is a package's rule, so it belongs in that package's own `AGENTS.md`.

Under the instruction model of agents/C11, the root file is a deployment instance's file. The matter's owner owns what is said about it, so a rule about SHA-256 is Foundation's and one about the operating system is Hosting's, each in its own package's `AGENTS.md`. The root file only helps an Agent find them.

Kai's Decision 1 (A) changes the dependency picture the Skills describe. Hosting owns the external crypto primitives, and other packages depend on Hosting or Foundation for them, not on `node:crypto` directly.

## What the root file keeps

Awareness only, as pointers and no rules:

1. This repository is governed by KAAL, and these notes guide an Agent and never authorize one.
2. `packages/` holds distributable capabilities, `engineering/` holds engineering and acceptance work.
3. The Engine is `.kaal/`. Start with `.kaal/AGENTS.md`.
4. To see what is registered, run `kaal list --engine .kaal` (Core). "Installed" is not "registered", so the list can be partial.
5. A package carries its own rules in its `AGENTS.md`, at `packages/<package>/AGENTS.md`, and its how-to in its Skill. Read the `AGENTS.md` of the package whose work you do. A rule about a package is not stated here.
6. To start from durable sources, or to escalate what a program cannot resolve, use `kaal-agents` (`orient`, `preach check`) once it is on `main`. Until then the root file does not point at it, since it must not point at what `main` lacks.

It names no package by version and copies no capability map. The `## Foundation` section goes.

## Where each specific rule goes

Kai's correction (4 Nov): specific rules live in specific `AGENTS.md` files, one in each package, and not in Skills. A Skill says how to do a task. A package's `AGENTS.md` says what an Agent working in that package must and must not do. The root file points at them.

**What exists today.** No package has its own `AGENTS.md`, on `main` or on any `kaal/*` collector. The only `AGENTS.md` files are the root file, `.kaal/AGENTS.md`, and Core's payload copy `packages/kaal-core/payload/AGENTS.md`. That copy is the Engine's notes and not Core's package rules.

| Package | Own `AGENTS.md` | Needed now |
| --- | --- | --- |
| kaal-foundation | missing | **yes**: the SHA-256 and bin rules leave the root file for it |
| kaal-hosting | missing | **yes**: the operating-system rule, and Decision 1 (Hosting owns external crypto primitives) |
| kaal-core | missing (payload copy only) | no rule leaves the root file. Core's owner decides |
| kaal-guard | missing | no rule today |
| kaal-graph | missing | no rule today |
| kaal-change | missing | no rule today |
| kaal-engineer-skill | missing | no rule today |
| kaal-review | missing | no rule today |
| kaal-testing | missing | no rule today |
| kaal-agents | missing | no rule today. Agents writes no instruction file for others (agents/F14) and adds its own when it has a rule |

A package adds its file only when it has a rule that belongs there, so the nine missing files are not a gap to fill now. Two are needed to take the root section out.

| Today in root `AGENTS.md` | Moves to | Carried by |
| --- | --- | --- |
| Use Foundation for a KAAL SHA-256, never `node:crypto` or a copy. Refine for Decision 1: external crypto primitives are Hosting's, so Embedded code takes a KAAL digest from Foundation and any other host crypto from Hosting | new `packages/kaal-foundation/AGENTS.md` | **Foundation 0.0.2** |
| Run the commands by the scoped package's own bin, never `npx kaal-foundation` | the same file, which links Foundation's Skill for the commands (foundation/F18, already in the Skill) | **Foundation 0.0.2** |
| What Foundation holds, and that it is not a utilities bucket | the same file (already in Foundation's Skill, and the Skill stays) | **Foundation 0.0.2** |
| Anything that touches the operating system belongs to Hosting, and Hosting owns the external crypto primitives | new `packages/kaal-hosting/AGENTS.md` | **Hosting**, its next release after 0.0.1. Whether it rides 0.0.1 is Hosting's and the CPO's call |
| The root file's own pointers (items 1 to 5 above) | The root file | The Change that edits it |

Open for the owners, not decided here: whether a package's `AGENTS.md` ships in its `files` (it guides an Agent working in the package, so Foundation's and Hosting's owners decide) and whether an `AGENTS.md` change is an ordinary Change (agents/C11 says it is).

Not here either: whether `node:crypto` stays allowed in installed verifiers (Engineering's reconciliation note, section 3, Packaging's N8), and the exceptions in shipped Guard, Graph and Hosting code. Those are their owners' corrections.

## The edit order

1. Foundation 0.0.2 first: add `packages/kaal-foundation/AGENTS.md` with the rules, refined for Decision 1. The root file must not lose a rule before its owner carries it.
2. Hosting's `AGENTS.md` in its own Change and release.
3. Then the root file in its own Change, after both are on `main`. Removing the section earlier would leave a rule with no home.

The root file's own Change is not part of any package promotion or ledger entry. Its route (Engineering, or a collector Change as for #728) is for Kai to name, because the owner of the root file is not settled (Engineering's reconciliation note).

## Findings

- **Foundation.** Its Skill already carries the how-to behind the rules the root file repeats, so the root section duplicates it and can drift. The rules need their own `AGENTS.md`, which does not exist yet.
- **Hosting.** Neither its README nor its Skill says that Hosting owns the external crypto primitives. It needs that statement in its own `AGENTS.md`, in Hosting's wording.
- **Core.** `kaal list` is the capability map's authority once the repository registers its capabilities. Until then the root file says "run it" and claims no completeness.
- **Agents.** The root file points at `kaal-agents` only after promotion.

## Testing

Two planned tests, in `test/plan/root-instructions.test.mjs`. They read the repository's root `AGENTS.md`, run outside `test:publisher`, and fail today on its text.

| Test | Checks | Loop |
| --- | --- | --- |
| agents/T27: the root file holds no package rule: it does not name `node:crypto`, `npx` or `sha256`, and has no section for a single package | agents/F13 | Requirements |
| agents/T28: the root file makes an Agent aware: it names `.kaal/AGENTS.md`, `kaal list`, and says a package's rules are in its own `AGENTS.md` | agents/F13 | Intent |

The root edit is a later DO. These tests turn GREEN there, and the Foundation and Hosting statements ride their own packages' tests.

Validated by review: that each rule has a home before it leaves the root file.
