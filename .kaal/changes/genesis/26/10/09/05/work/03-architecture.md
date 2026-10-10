# Architecture

An investigation against `02-requirements.md`, read from `kaal/genesis` after Changes `08/03` (Engine / Record / Subject) and `09/01` merged. Nothing is built. Recommendations are mine; the genuine forks are in the last section.

Revised on the Owner's direction (2026-10-09): composition, packaging, source adapters and installation are separate things; the current dependency refusal is preserved, not weakened; and 0.0.1 shows, from a requested set of exact Node IDs, an Engine established and verified, with a Skill and an Extension.

## Responsibility map

| Layer | Owns | Does not own | Exists today? |
|---|---|---|---|
| **Core** | Typed Skill and Extension identity (`{name, id}`), admission, held-capability discovery (`installedSkills()`, `installedExtensions()`), registration | where bytes come from; what a package is called | Yes |
| **Composition** (#69) | Choosing capabilities by exact Node ID; working out what the target Engine must hold; verifying the resulting composition is valid; refusing otherwise, whole | obtaining bytes; npm; a second identity or dependency registry | No, except inside `engineering/kaal-install` over this repo's `packages/` |
| **Packaging** (future `kaal-packaging`) | Distributing the Engine, capabilities and their dependency bytes; package names, versions, npm metadata | capability identity; whether a composition is valid | No, and not built here |
| **Source adapters** | Obtaining a package from a source and presenting it as a directory of packages; initially a local directory, and npm populating one | meaning, identity, validity | No |
| **Installation** | Establishing the selected capabilities in the explicitly supplied Engine location, and projecting Agent Skills to a supplied directory | choosing; the Subject | Yes, bound to this repo's `packages/` |
| **Operating mode** | Where Engine, Record and Subject live (`08/03`) | what a capability is | Settled in `08/03` |

Nothing in the table is a registry. Core is the only layer that says what a capability is; package names and versions never do.

## Three kinds of dependency, kept apart

1. **Package dependencies** (what npm resolves for a package). Packaging's. Composition neither resolves nor reads them as KAAL meaning. The capability packages in this repository need no npm runtime dependency beyond Node itself, so there is almost nothing to resolve.
2. **Capability needs** (a Skill that works only with another, declared in its Agent Skill's `compatibility` text, for example `kaal-changing` needs `kaal-sealing`). Composition's. Preserved, below.
3. **Node references** (a Node refers by `{name, id}` only to Nodes born before it). Core's admission. Unchanged.

## Preserving the capability-need refusal

Today `engineering/kaal-install` reads the declaration (a bounded frontmatter shape, the decoded value of `compatibility`, refusing escapes, anchors, aliases, tags and flow collections it cannot read reliably), takes the capability names it mentions by the instance's `capability-prefix`, and refuses with nothing written if a named capability is neither installed nor selected, naming the exact Node ID that would meet it, or saying there is none. That is a real guarantee, and the name-based reading is the declaration's own format: the Agent Skills standard makes `compatibility` free text.

The separation that keeps the guarantee and removes the name from identity is to treat the name in a declaration as **a reference to a delivery slot**, which #43 already defines as placement, never identity, and to decide met or unmet on **Core's answer**:

- A need named `N` is **met** iff, in the Engine that would result (existing contents plus the requested composition), the delivery slot `N` (`skills/N/` or `extensions/N/`) holds a Node that Core reports held.
- It is **unmet** otherwise, and the refusal names, from the offered packages, the exact Node ID(s) of the package whose delivery name is `N`, or says there is no exact ID.
- Unreadable declarations are refused exactly as now.

Nothing new is trusted: the name locates a slot, Core says what is in it. No second registry, no npm metadata, and the refusals are the installer's. This is intended to be behaviour-identical, and the acceptance runs the installer's own refusal cases against it as the check (unmet need, unreadable declaration shapes, a need that no package carries). If any case differs, the design is wrong, not the case.

A machine-readable need by Node ID would be cleaner, but it changes what a Skill declares and is a later Change.

## What Core answers, and stage and ask

`installedSkills(kaalDir)` and `installedExtensions(kaalDir)` return the admitted Nodes typed by Core's `Skill` or `Extension` Node, as `{name, id}`, wherever files are stored. They are sufficient for held capabilities and need no change.

An offer is described by the same calls. **Stage and ask:** put the offer's bytes into a throwaway copy of the Engine through `registerSkill()` or `registerExtension()` (Core's admission decides whether it is a capability), then ask the two calls on the copy. The same step builds the resulting composition for the need check and for verification. `kaal-install` already stages this way. Precondition: the tool's `kaal-core` carries the same `Skill` and `Extension` Node bytes as the Engine, because registration anchors on those exact IDs; a mismatch fails at admission and must be reported plainly.

## Sources and npm

A source adapter turns a source into **a directory of packages**, each shaped like this repository's `packages/<name>/` (its `payload()` returns `{ kaal, skills? }`). Composition reads only such directories.

- **Local directory**: the directory itself. Needs no tool and no network.
- **npm**: the adapter runs npm to populate a staging directory from specs the caller gives (a registry name, a local tarball from `npm pack`, a local path), and the staging directory is then a local directory source. npm resolves package dependencies into it; composition does not. With tarballs or paths no network is needed. Package names and versions are used only to tell npm what to fetch; after that, identity is Core's answer.

The caller supplies sources and, separately, the exact IDs. Knowing which ID to ask for is the trust decision: it comes from the Owner, a reviewed Change or a pinned note, not from a source.

## The Engine

The Engine is established in an explicitly supplied location. Its seed is Core's `payload()` from the tool's own `kaal-core` dependency (fork F2), deployed if the location holds no Engine, or checked to match if it does (Core's files are append-only). Capabilities are then registered through Core. The Engine is verified through Core: `held` returns exactly the requested set plus whatever it already held, and an independent re-admission of the Engine's files accepts them.

## Whole refusal (no partial installation)

The whole composition is built and checked in a throwaway copy before the Engine location is touched: seed, register each requested capability, check needs, ask Core what is held, compare with the request. Only if everything holds is the result written to the Engine location, then read back and compared. If any member fails, nothing is written and the location is byte-identical to before. Registration is already all-or-nothing per capability; the plan-then-commit step makes it so for the set.

## Skills, Extensions and delivery

A package delivers one kind of contribution (a Skill with Agent Skills, or an Extension alone). The pipeline carries both through the same stage and ask. Agent Skills are projected only for Skills, to a directory supplied by the caller. The delivery name is the one the deliverable carries (its Agent Skill directory, else the package directory), passed to registration as placement, as #43 describes; prefix conformance stays #43's checker. For the demonstration, `kaal-github` is the existing Extension package, and `kaal-changing` with `kaal-sealing` are the Skills whose need is real.

## The three operating modes

```
 Engine (Core, Nodes, node seals, Skills)     Record (Change dirs + seals)        Subject (what the Work is about)
```

| Mode | Engine | Record | Subject | Where composition acts |
|---|---|---|---|---|
| Engineer | `.kaal/` of this repository | this repository, where it declares | this repository | this repository's Engine; sources: `packages/`, or a staging directory |
| Embed | `.kaal/` in the host | the host, where it chooses | the host repository | the host's Engine; sources: whatever the host is given |
| External | an Engine the operator holds, not in the Subject | a Record store the operator holds | a repository with no KAAL artifact | the operator's Engine; **never the Subject** |

Same Core answer, same pipeline, same refusals in all three. They differ only in where the Engine is and which source is given. Locations are arguments, never derived from each other.

## Reconciliation with #43

Both Intents stay separate; neither Change edits the other.

| Concern | Established by | Where it lives |
|---|---|---|
| Capability identity | Core: the Skill or Extension Node, `{name, id}` | sealed |
| Package or source identity | the source; proved by hashing, never by name or version | the adapter, never a Node |
| Verification | Core admission plus the hash against the requested ID | at install |
| Delivery naming and placement | the instance (`capability-prefix`) and the deliverable's layout | `skills/<name>/`, `extensions/<name>/`, unsealed |
| Installed capability discovery | Core's `installedSkills()` and `installedExtensions()` | the admitted graph |

The one place a name carries weight here is the need declaration, where it locates a delivery slot and Core says what is in it. #43's open points (which namespace the prefix protects, `extensions/`) are not decided here.

## Minimum viable 0.0.1

A shipped package (working name `kaal-compose`, acceptance under `engineering/`) with a library and a thin CLI:

```
held    --kaal <engine>
offers  --source <dir> ...  [--npm <spec> ...]  [--kaal <engine>]
install --source <dir> ...  [--npm <spec> ...]  --kaal <engine>  --skills <dir>  --select <Node ID> ...
```

All locations explicit; nothing remembered. `held` is Core's answer. `offers` stages each package and prints Core's `{name, id}` and whether held, writing nothing. `install` composes exactly the selected IDs.

Acceptance, written first, over copies of this repository's real packages, offline (local directory and `npm pack` tarballs):

1. A new Engine location is established from Core's payload; `held` lists nothing.
2. Selecting the Skills of `kaal-sealing` and `kaal-changing` and the Extension of `kaal-github` by exact ID establishes the Engine; `held` equals exactly those three `{name, id}`, equal to what `offers` showed; Agent Skills land in the supplied directory.
3. Selecting `kaal-changing` alone is refused, naming the exact ID of `kaal-sealing`'s Skill; the Engine location is byte-identical to before (absent stays absent).
4. The installer's own refusal cases (an unreadable `compatibility` declaration, a need no package carries) are refused by the new tool with the same outcomes.
5. A package whose bytes do not yield the selected ID is refused with nothing written; a name, or an ID not offered, is refused.
6. Installing again changes nothing.
7. The same through the npm adapter from local tarballs, with no network.
8. External: with a Subject directory beside the Engine, the Subject is byte-identical afterwards.

Out of 0.0.1: a registry, remote authentication, an archive format beyond npm tarballs, adding needs automatically, `kaal-install` as a caller, agent wiring (stays `wire-kaal-agent`), `kaal-packaging`, any Core or sealed-Node change.

## What exists and what is missing

Exists: Core's enumeration, admission and registration; the stage-and-register pipeline and the need check in `engineering/kaal-install`; the Engine / Record / Subject design; an Extension package (`kaal-github`) and Skills with a real need.

Missing, and only this: that pipeline shipped and reading its packages from a directory a source adapter supplies; the need check expressed on Core's answer for the resulting Engine, with parity to the installer's refusals; plan-then-commit across a set of capabilities; the Engine seeded and verified in a supplied location; a local-directory adapter and an npm-populates-a-directory adapter. Not missing and not to be added: a registry, a Core concept or API, npm dependency resolution of our own, authentication, Packaging.

## Genuine forks for the Owner

- **F1. Needs: explicit or closure?** Recommended: explicit. A need that is not requested is refused naming the exact ID (today's guarantee: composition is never automatic). The alternative is an opt-in that adds needs to the request; I would not do that in 0.0.1.
- **F2. Engine seed.** Recommended: Core's payload from the tool's own `kaal-core` dependency, so the Engine and the tool cannot disagree. The alternative takes Core from a source, which can mismatch the tool's anchor IDs.
- **F3. Are adapters KAAL Extensions?** Recommended: plain modules in 0.0.1. Making a source adapter an Extension (a Node, a birth) keeps generic Skills and Processes from coupling to a vendor, but needs its own birth and is not needed to show the behaviour. The interface is shaped so it can become one.
- **F4. How a need is met.** Recommended: delivery slot named by the declaration holds a Node Core reports held (above). The alternative, a machine-readable need by Node ID, is cleaner but changes what Skills declare and belongs to a later Change.
- **F5. npm.** Recommended: shell out to the `npm` CLI inside the npm adapter only; the local-directory adapter needs no tool. Accept that the npm adapter needs `npm` present.
- **F6. Name, place, CLI.** Working name `kaal-compose`, a shipped package under `packages/`, acceptance under `engineering/`, a thin CLI over the library, none in Core.
- **F7. Trust.** Exact-ID selection, hash verification and Core admission only; no authentication, since no remote source is in 0.0.1.

## Risks and open points

- Parity with the installer's refusals is claimed by design and checked by running its cases; an unforeseen difference would make F4 the wrong answer.
- Two implementations of the declaration reader (the installer's and the new package's) would drift; the new package should own it and `kaal-install` become its caller in a later Change.
- The tool's `kaal-core` must match the Engine's anchor Node bytes; a mismatch must be reported plainly.
- How a host that keeps Agent Skills elsewhere is served is not settled.
- Name-based reading of a declaration remains until a machine-readable need exists.
