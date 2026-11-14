# Collector capability check (engineering/C15)

Report-only. It says whether a collector `kaal/<capability>/<name>` names a Capability that Core registers on `main`. It enforces nothing: no ruleset, workflow, hook or install uses it, and the exit status is 0.

## Rule

PASS needs both, read from the default branch's tip:

1. a Core Registration (type `Core/Registration`, core/F47-F49) that claims the segment as its **scope**, claimed once; and
2. the Registration's **holder** is the name of an admitted **KAAL Capability** Node.

A Skill, Agent or Extension holder fails. An admitted Capability Node without a registered scope fails, and a Node's name is never used as a scope. Evidence that is absent, empty, unreadable, invalid or ambiguous (a scope claimed by several holders) is UNKNOWN, which never passes. Flat and legacy refs, `kaal/old/*` and non-Node namespaces are listed as migration findings, never as authorized.

## Source and evidence boundary

- `collector-capability.mjs` is pure: it judges a name against the evidence it is given and reads nothing.
- `evidence.mjs` reads only the files it is handed (`[{ path, bytes }]`), with Core's `evaluate`, `validate` and `assemble` and Graph's `typed`. It uses no Git, network or deployed `.kaal/` Engine, and no published package: Core is read from the workspace source, as `engineering/inventory/attribute.mjs` does. Core 0.0.1 is unpublished and `.kaal/` holds only the foundation copy, neither is presumed.
- `check.mjs` is the only place that touches Git, and it hands `evidence.mjs` the files of `--base` (default `origin/main`), never of a branch under review. Files are read as UTF-8 text.

## Observed on main (a900273)

`node engineering/collector-capability/check.mjs --base origin/main` reports 0 registered scopes and 4 admitted Capability Nodes (Change, Core, Guard, Testing). Every `kaal/<x>/<y>` branch is therefore UNKNOWN and every flat branch is a finding. That is expected until Capability owners land their own Registrations.

## Cases

`00-changes/C15-collector-capability/`: engineering/T268-T276 judge the verdicts, T277-T279 the evidence reader from files alone. They are Case files of the engineering Case runner (`node --test engineering/cases/cases.test.mjs`, also part of `npm run test:engineering`); the bodies live in `cases.mjs`.
