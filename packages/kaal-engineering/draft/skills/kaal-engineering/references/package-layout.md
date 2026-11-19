# Package layout

The layout of a capability's folder. This capability owns it. The data is in [package-layout.json](package-layout.json); this page explains it. It moves no existing package: migration comes later, package by package.

## One layout, three places

`packages/<cap>`, `engineering/<cap>` and `.kaal/<cap>` share one layout. The package is deployed: N+1 goes to `engineering/`, and N goes through npmjs to `.kaal/`. A repository with no packages of KAAL has only `.kaal/<cap>`.

## Machinery and content

- **Machinery** is `AGENTS.md`, `13-source` (the Skill and the scripts) and what is built from it into `dist`. It is written only in `packages/` and deployed elsewhere. Outside `packages/`, a hand edit is waste, and the copy must match its source.
- **Content** is `00-backlog` to `14-defects`, including `02-controls`. It is content in context: owned locally, never deployed and never compared. In a package it is the capability's own. In `engineering/` and `.kaal/` it is the consumer's data, produced by the capability. A defect about our repository lives in `engineering/<cap>/14-defects`, since defects are local and the Defect Skill only helps find them.

## Verified by

Intent, requirements, architecture and defects each say what verifies that they are done, and their folder carries it in `test-cases/`. The source is verified by its `unit-tests/`. Only scripts, unit tests and test-cases are deterministic; the rest is validated by review.

## Rules

- The numbers only order the folders for people.
- `02-controls` holds only controls over the package itself. A control about how a consumer runs its repository is consumer space.
- `dist` is generated from `13-source`, never edited and not committed.
