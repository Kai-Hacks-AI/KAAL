---
name: kaal-core
description: Inspect and use KAAL Core Nodes, Engine admission, CASE contribution registration and verification. Use when discovering an Engine, explicitly bootstrapping it, registering a Capability, Agent, Skill or Extension, diagnosing type or identity findings, or operating Core from a separate controller.
license: MIT
compatibility: Core commands require Node.js 24 or later and the installed Core package with its runtime dependencies.
---

# Use KAAL Core

Read the [Core Skill Node](Core-Skill.md) for this Skill's scope. Start with the repository's applicable instructions and, where an Engine is already named, its `AGENTS.md` and Kernel. Read the installed Core package's product documents for its contracts and limitations. Guidance and discovery grant no authority to initialize, register, upgrade, remove or activate anything.

## Locate the actual package and Engine

Locate the Core installation in the consumer or controller that is doing the work. Confirm its declared package name and version. Use that package's own `dist/cli.js`; do not use `npx kaal` or `npm exec`, which may run an unrelated bin or fetch another package.

Core's intended public identity is `@kaihacksai/kaal-core`. The current unpublished 0.0.1 candidate is still named `kaal-core`: install it only from explicitly supplied tarballs together with its KAAL runtime dependency tarballs, as the package's Operations document describes. Do not fetch the unscoped name from a registry. Do not claim the candidate is already published under the scoped name.

Run from the directory holding the installation. In the examples, replace `<core-cli>` with the installed package's own CLI path:

- Scoped installation: `node_modules/@kaihacksai/kaal-core/dist/cli.js`.
- Current unscoped tarball candidate: `node_modules/kaal-core/dist/cli.js`.

Name the intended Engine explicitly with `--engine <dir>` when it is not the authorized default `./.kaal`. An Engine directory, a package installation and a target repository are distinct things. Do not infer one from another.

## Inspect before changing

```sh
node <core-cli> list --engine <dir>
node <core-cli> verify --engine <dir>
node <core-cli> resolve "Node" --engine <dir>
```

Use `list` for the admitted CASE catalogue and `resolve` for an admitted Node's name/id. Use `identify <file>...` to inspect Node identities. Filenames and placement do not determine identity; Core computes identity from exact bytes and resolves types by name and id.

Keep these distinctions in every report:

- A file or package can be **present** without being explicitly registered.
- A contribution can be **registered** yet rejected by admission rules.
- An **admitted** Skill is available through this Engine; that is no evidence an agent **used** it.
- An agent may read an unregistered Skill through ordinary filesystem access. Do not represent that reading as registered, admitted or KAAL-verified.

Core's Engine verification judges structure and permission, not another capability's content. Keep registered/unregistered/unknown/invalid Type states distinct. Report shared terms as unaligned; preserve scope-qualified identities and never choose a semantic owner by matching a spelling.

## Bootstrap only when explicitly requested

Confirm the target and the authorized write first. Then use `init`, with an explicit Engine directory where appropriate:

```sh
node <core-cli> init --engine <dir>
node <core-cli> verify --engine <dir>
```

**Current delivery boundary:** `init` bootstraps the foundational payload. It does not yet establish the proposed mandatory Core/Foundation/Hosting contribution-registration flow. A successful bootstrap must not be reported as that completed initialization. If the task requires the fuller flow, report it as unavailable and identify the missing owner declarations; do not invent them or infer registration from npm dependencies. Keep published Foundation 0.0.1 usable for ordinary bootstrap; do not require an unreleased successor merely for this operation.

For the repository-root default Engine, use `init` without `--engine` only when that default target is authorized. It also records Core's own installed assets. An explicitly named Engine has no recorded lifecycle. On refusal, preserve the reason and establish that nothing changed rather than trying another location silently.

## Register only owner-declared contributions

```sh
node <core-cli> register <capability|agent|skill|extension> <name> <contribution-dir> --engine <dir>
node <core-cli> list --engine <dir>
node <core-cli> verify --engine <dir>
```

Obtain the contribution from its actual owner. Its directory contains Nodes, not the Agent Skill folder or an npm package tree. Choose the owner's declared CASE kind; Hosting's current contribution is an Extension. Do not create a Foundation or Hosting declaration inside Core to make admission succeed. Core admits the complete contribution or refuses it without partial writes; an identical registration is a no-op.

Use Core's public APIs for programmatic work: `evaluate`, `loadEngine`, `catalog`, `register` and `verify`. Use the `frontmatter`, `installation`, `agent`, `realization`, `conformance` and `registration` subpaths only for their documented contracts. Core deploys canonical Skill files unchanged and delegates Skill format checking to Engineer Skill.

## Keep Embed and External boundaries explicit

For Embed, operate on the authorized Engine in the consumer. For External, keep Core in the controller installation and pass the separately managed Engine's location through `--engine` or the public API. Inspection needs no npm installation or automatic initialization in the target. Report access or interface gaps instead of installing or activating something there as a workaround.

Recorded `version`, `upgrade` and `remove` concern the supported repository-root `./.kaal`. Use upgrade/remove only on explicit lifecycle authority; they preserve modified and other-owner files and report what was kept. They do not provide arbitrary-target external lifecycle or migration from earlier unreleased Engines.

## Verify the package and calibrate the result

Run `npm test` from the installed Core package's directory, or `npm explore <installed-package-name> -- npm test`. The installed entry runs delivered verification only, without a checkout, build tool or network. Keep package verification separate from `kaal verify`, which checks an Engine.

Report the candidate, observed host, declared and executed cases, result and cause. `verified` means the required delivered cases ran successfully; `failed` means a required case failed; `cannot verify` means the evidence is incomplete or the installed files do not match. A matching self-manifest establishes consistency, not provenance. One host's result is no evidence for another, and verification is not Owner validation or permission to publish.

Graph is not a Core runtime prerequisite. Core's delivered Node support retains Graph's provenance, while registration's cycles, incoming views and reach are unavailable (`null`) in this release. Do not call unavailable analysis empty, cycle-free or verified.

When a finding exceeds Core's structural authority, report its owner, evidence and unresolved decision. Consult the relevant capability or Owner for semantic or authorization decisions. Do not redefine Branching, Change, Testing or Engineering behavior inside Core.
