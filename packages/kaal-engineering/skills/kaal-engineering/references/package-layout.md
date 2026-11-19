# Package layout

The layout of a capability's folder. This capability owns it. The data is in [package-layout.json](package-layout.json); this page explains it. It moves no existing package: migration comes later, package by package.

## One layout, three places

`packages/<cap>`, `engineering/<cap>` and `.kaal/<cap>` share one layout. The package is deployed: N+1 goes to `engineering/`, and N goes through npmjs to `.kaal/`. A repository with no packages of KAAL has only `.kaal/<cap>`.

## Machinery and content

- **Machinery** is `AGENTS.md`, `13-source` (the Skill and the scripts) and what is built from it into `dist`. It is written only in `packages/` and deployed elsewhere. Outside `packages/`, a hand edit is waste, and the copy must match its source.
- **Content** is `00-backlog` to `14-defects`, including `02-controls`. It is content in context: owned locally, never deployed and never compared. In a package it is the capability's own. In `engineering/` and `.kaal/` it is the consumer's data, produced by the capability. A defect about our repository lives in `engineering/<cap>/14-defects`, since defects are local and the Defect Skill only helps find them.

## Four AGENTS.md

Each serves a different thing, so there can be more than one. The repository root sits on top:

- `AGENTS.md` at the repository root guides work across the repository.
- `packages/AGENTS.md` guides work across packages.
- `packages/<cap>/AGENTS.md` guides work on that package. It is not shipped.
- `packages/<cap>/dist/AGENTS.md` ships with the package and guides consumers who use the capability. It is built from `13-source`, never edited.

`dist/AGENTS.md` is the Agent level above the Skill (BASS: Bare to Agent, then Agent to Skill). It tells a consumer's Agent that the capability exists and points to `skills/<name>/SKILL.md`; the Skill and its references guide the use, and the Agent file does not repeat them. A package's own `AGENTS.md` guides work on the package, and `SKILL.md` with its references guides use.

## Controls

A control is contextual, not a shippable product. The consumer establishes and owns its controls, their evidence and their operational state. Each control links to the Intent it serves, and through that Intent and its Requirements and Architecture the consumer finds the machinery of the capabilities that help. The capability ships reusable solution elements and machinery. So `02-controls` in a package holds controls over that package itself, never controls shipped for consumers.

## Verified by

Intent, requirements, architecture and defects each say what verifies that they are done, and their folder carries it in `test-cases/`. The source is verified by its `unit-tests/`. Only scripts, unit tests and test-cases are deterministic; the rest is validated by review.

## Rules

- The numbers only order the folders for people.
- `02-controls` holds only controls over the package itself. A control about how a consumer runs its repository is consumer space.
- `dist` is generated from `13-source`, never edited and not committed.
