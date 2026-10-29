# Research: representation follows audience and ownership

> Research, not a PLAN. It reports evidence and proposes owner-scoped Changes. It changes no artifact, and each proposal is its owner's to plan, after the Owner decides.

**The rule (the Owner, #607, 2026-10-29).** Purely machine-to-machine mechanics and machine-owned state may use JSON. Any human-facing artifact, human–agent collaboration included, is Markdown: structured elements that scripts read go in validated YAML frontmatter, and the semantics and guidance people read go in the body. That scripts consume an artifact does not by itself justify JSON. Core's Deterministic Frontmatter already states most of this: `N1` (collaborative artifacts are Markdown with validated frontmatter, KAAL-wide), `N2` (deterministic validation), `N3` (machine-to-machine contracts and machine-owned state stay JSON) and `F8` (each Capability owns its Types and validation, never looser than `F1`–`F6`).

**What was read.** Every tracked `.json` file on `main` and on every `kaal/*` branch at 2026-10-29 11:40Z, except `package.json`, `package-lock.json` and `tsconfig*.json`, which are their tools' formats. For each: who writes it, who reads it, and whether it carries prose. Every Markdown file on `main` with frontmatter, for a `type` and for the prose keys `F3` forbids. And the two frontmatter validators on `main`, Core's (`packages/kaal-core/src/frontmatter.ts`) and Guard's (`packages/kaal-guard/lib/config.mjs`).

## 1. Human-facing artifacts kept as JSON

| Artifact | Owner | Who writes it | What makes it human-facing |
| --- | --- | --- | --- |
| `evidence.kaal.json` (`packages/skills/kaal-testing/`; the format is Testing's, each Capability owns its mapping) | Testing | people and agents, by hand | Each statement carries prose a reviewer judges: a verbatim `quote`, the `inference` from the tests to the statement, its `limits` and a `review` record. This is a review artifact, not machine state |
| `engineering/github/holds.json` | Engineering | the Owner's holds, recorded by hand | Each hold is an Owner decision: a prose `reason` and a link to the `ruling` (`engineering/github/lineage.ts`, `Hold`). Empty today |
| `.kaal/config/core/agents.json` (`core/F16`) | Core owns the schema; the consumer writes it | a consumer, by hand | It is configuration a person declares: which agent providers to enable. Guard's configuration in the same `.kaal/config/` tree is already Markdown |
| `ownership.kaal.json` (15 claims across the Capabilities; Testing's claim format) | Testing owns the format; each Capability owns its claim | people and agents, by hand | Borderline. It carries no prose, but it is a governance statement people author and review: which Capability owns which paths |

None of the four has a body today that explains itself, so a reader learns what a hold, a mapping or a claim means only from the README of the format's owner.

## 2. Machine-only JSON, rightly JSON

`packages/kaal-guard/contract.json` and `packages/skills/kaal-architecture/contract.json` (Core's `Installation Contract`, specified as an installer-neutral JSON document), `packages/kaal-core/installation.kaal.json` (Core's own instance), every `.kaal/state/<capability>/installation.json` record, `packages/kaal-guard/test/verify.json` (written by `engineering/guard/verify-manifest.mjs`, read by guard/T101), `engineering/guard/acceptance/fixtures/check-identities.json` (a test fixture) and the `--json` output of `engineering/contracts/measure.mjs`. None needs a Change. `engineering/C4` (#607) keeps `contract.json` as it is.

Two JSON files remain only on collectors that `main` has superseded: `guard.json` (six `kaal/*` branches; `main` declares Guard's checks as `.kaal/config/guard/*.md`) and `engineering/guard/red.json` (three). They go when those collectors are promoted or deleted. They need no Change of their own.

## 3. Machine-only Markdown

None found that creates a problem. `packages/kaal-guard/docs/testing.md` holds a trace that `verify-manifest.mjs` regenerates from the test titles. It is still a human document, and its source is the cases, so it does not drift.

## 4. Requirements against the validators

- **Guard's `Guard/Check` Type cannot be stated in `F1`'s value kinds.** `F1` lists `id`, `name`, `enum`, `ref`, `path`, `boolean`, `number` and `parameter`, says there is no free-text kind, and allows a mapping only as a `ref`. Guard's validator accepts `command` as any string with a program in it, and `outcomes` as a map from exit status to `held` (`config.mjs`, lines 191–217). `F8` says a Capability's own validator is never looser than `F1`–`F6`. So Guard is conformant in spirit (no prose key, `type: Guard/Check`, unknown keys refused), but its Type has no `F1` schema, and Core's validator could not check it.
- **Nothing checks this today.** The Engineering step that applies Core's frontmatter conformance cases to Capability-owned artifacts, Guard's declarations among them, is planned in `engineering/guard/change.md` and was never created.
- **The genesis `Node.md` has no `type`.** It is the one intended exception (the Owner's Typed Form ruling). No other Markdown file with frontmatter on `main` lacks a `type`, and none carries an `F3` prose key outside `SKILL.md`, which `F7` exempts.

## 5. Ownership

None of it is unclear. The one open question is who closes the `F1` gap in §4: Core owns `F1`, Guard owns its Type, and either side can close it.

## Proposed Changes, each its owner's

| # | Owner | Change | Note |
| --- | --- | --- | --- |
| P1 | Testing | The evidence mapping becomes Markdown. One option is one file per statement: the source, its pin, the loop and the evidence pins as frontmatter, the quote, inference and limits in the body. | The evidence list is a list of records, which `F1` cannot state as one key. Either one Node per statement, with evidence as Edges, or a Core amendment to `F1`. Testing chooses |
| P2 | Engineering | Holds become `engineering/github/holds/<collector>.md`, `type: Engineering/Hold`, with `collector` and `ruling` in frontmatter and the reason in the body. The audit reads them from the default branch's tip, as today | Small, Engineering's own. Empty today, so it migrates no data |
| P3 | Core | The provider declaration becomes `.kaal/config/core/Agents.md`, `type: Core/Agents`, `providers` as an `enum` list | Changes `core/F16`, the Guard External `--agents` option, and Core's tests |
| P4 | Testing, then each Capability | Ownership claims become Markdown with the owner as a `ref` plus a kind `enum`, and `paths` as a `path` list, all of which `F1` already has | Borderline (§1). 15 claims, so it touches every Capability. Recommended only if the Owner reads claims as human-facing |
| P5 | Guard, with Core | State `Guard/Check` in `F1`'s terms. `command` becomes a `parameter` with a declared pattern, and `outcomes` becomes `held:`, a `number` list, which `F1` already has. Or Core adds a value kind, if a map is wanted | A change to the declaration format consumers write, so it goes into a Guard release |
| P6 | Engineering | Create the planned frontmatter conformance step: Engineering discovers each Capability's typed Markdown and runs Core's frontmatter conformance cases against it, as #607 does for Installation Contracts | It would have found §4. It waits on #607's shape, so both use one pattern |

## For the Owner

1. Is the ownership claim human-facing (P4)? I read it as borderline, and I would not migrate 15 claims for it alone.
2. Should P5 close the gap on Guard's side (recommended, since no new kind is needed) or on Core's?

Everything else here is evidence for the owners to plan. Nothing here authorizes a Change, a synchronization, a promotion or a publication.
