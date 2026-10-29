# PLAN Boundary Integrity: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **testing/N6** [testing/I9]: `interpret` is pure and realization-neutral.
  - **Inputs.** It takes a declaration and a verdict as data.
  - **No other imports.** It reads no host, runs no command, and imports neither Sealing nor any Git library.
  - **Dependencies.** kaal-testing's runtime dependencies stay `c8` and `kaal-hosting`.

## Functional

- **testing/F18** [testing/I8]: **A Boundary Declaration** is written by one concern owner (Intent, Requirements or Architecture, at any nesting) for one PLAN Change. It holds:
  - the concern and its owner;
  - `paths`: the repository-relative paths of its planned tests and of every fixture, expectation, snapshot, configuration file, helper and declared dependency that gives them meaning. A path ending in `/` covers everything beneath it.

  The closure is declared, never derived. A declaration that does not read, or whose path leaves the repository, is a verified failure naming it.
- **testing/F19** [testing/I8]: **A verdict** is what a realization reports for one declaration. It is realization-neutral and states:
  - its realization, `git` or `seal`;
  - its anchor, `plan-commit`, `owner-review` or `collector-record`, with its reference;
  - the bytes it compared, `stored` or `working-tree`;
  - whether it compared file mode;
  - the declared paths it found added, removed, renamed, changed in content or changed in mode;
  - the paths it found outside the declaration that the boundary depends on.
- **testing/F20** [testing/I8]: **An anchor the candidate can write is no anchor.**
  - A verdict whose anchor is the PR head, or is missing, is unknown, never unchanged and never failed: "the baseline is not trusted".
  - A verdict over working-tree bytes is unknown for content, because a checkout can change bytes, as line endings do.
- **testing/F21** [testing/I8]: **Changes are verified failures.** Each declared path that was added, removed, renamed or changed is a verified failure, naming the concern, its owner, the path and the change. This includes a file a sync re-adds beneath a declared directory. A mode change is one when the verdict compared mode. When the verdict did not compare mode, mode is unknown.
- **testing/F22** [testing/I8]: **What stays unknown.** These are reported as unknown, whatever else holds:
  - each path the verdict found outside the declaration;
  - execution reproducibility: runtime, lockfile bytes, environment, flags, time and network;
  - behavioural validity: clean RED, correctness and Outcome.
- **testing/F23** [testing/I8]: **The result.** `interpret` returns one class:
  - `verified failure` when any finding is one;
  - `unknown` when the anchor or the bytes are untrusted;
  - otherwise `unchanged within the declaration`.

  It always lists the findings and the unknowns. It never returns "met", "passed" or "valid".
