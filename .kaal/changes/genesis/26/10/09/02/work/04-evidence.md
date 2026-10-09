# Evidence: the minimum viable 0.0.1

What was built, what it was proven on, and where it differs from `03-architecture.md`. Everything below is reproducible with `npm test` (the new job is `npm run test:kaal-compose`).

## What exists

`packages/kaal-compose/` (MIT, version 0.0.1, publishable, no `payload()` and no Node of its own) and `engineering/kaal-compose/` (acceptance, never shipped).

- `src/compat.ts`: the installer's bounded `compatibility` reader and capability-name extraction, carried over so the refusal is not weaker.
- `src/sources.ts`: plain source modules. `fromDirectory(dir)` reads one package or a directory of packages as data. `fromNpm(specs)` is the only place npm is invoked: it installs the specs with `--ignore-scripts` into a throwaway directory and reads the requested packages as data. No package code is executed.
- `src/compose.ts`: `stage(offers)` puts each offer alone into a throwaway KAAL seeded from Core's `payload()` and asks Core (`registerSkill`, then `registerExtension`, then `installedSkills`/`installedExtensions`). `install(request)` stages the whole candidate, checks it, and only then writes. `heldBy(engine)` is Core's answer.
- `src/cli.ts`: `held`, `offers`, `install`. Exit 0 done, 1 refused or failed with nothing written, 2 usage.

Core is used only through its public API. Nothing in Core or any sealed Node changed.

## Acceptance (`engineering/kaal-compose/acceptance/compose.test.ts`)

1. A new Engine is made from Core's payload alone and holds nothing.
2. `kaal-changing`, `kaal-sealing` (Skills) and `kaal-github` (Extension) selected by exact Node ID are installed; `held` through Core reports exactly those three; Agent Skills land only for the Skills; installing again changes nothing.
3. `kaal-changing` alone is refused, naming `kaal-sealing` and its exact Node ID, and the Engine and skills directory are byte-identical. With `kaal-sealing` already held, `kaal-changing` installs with no re-selection (the need is met by the Engine's own held Node).
4. A need no offered package carries is refused saying there is no exact Node ID to select, and not even the Engine is created.
5. A name, an unknown ID, a tampered Node, an unsealed Node, and one bad ID among good ones are all refused with nothing written.
6. An Engine whose Core differs from the tool's is refused; an Agent Skill that would be replaced is refused; a selected package with an Agent Skill and no skills directory is refused. All write nothing.
7. Parity: 21 spellings of the `compatibility` declaration (scalar forms, escapes, anchors, tags, flow collections, comments, quoted and repeated keys, indentation, missing delimiters, no frontmatter) are run through the installer's own `delivery()` and through `install()`, alone and with the sibling selected. The outcomes are equal in every case, and both outcomes occur. No expected outcome was changed to make a test pass.
8. npm as a source: `npm pack` tarballs of the three packages are obtained through `fromNpm` with `npm_config_offline=true`, and the resulting Engine and skills directory are byte-identical to the local-directory install. A spec npm cannot obtain is an error with nothing installed.
9. External: a Subject directory is byte-identical after an install into a separate Engine and skills directory, and the parent holds only those three directories.
10. The command: exit codes 0, 1 and 2, `offers` marking held Nodes, `held` listing what Core reports.

## Differences from the architecture

- Needs are checked for the selected packages only. A capability the Engine already holds was checked when it was installed; its Agent Skill is in the host, not the Engine.
- A package is classified in a throwaway KAAL with Core alone. A package whose Nodes would need another offered package's Nodes to be admitted is not offered; no current package is like that.
- `kaal-compose` declares `kaal-core` as a dependency (resolved by the root workspace). Sibling packages declare none and keep their own lockfiles; a standalone install of `kaal-compose` needs `kaal-core` to be published, which it is not yet.
- `offers` writes tab-separated lines: kind, name, ID, delivery name, and `held`.

## Not done, by decision

No automatic dependency closure (F1), no registry, no Core change, no authentication claim beyond exact ID, byte equality and Core admission (F7), no `kaal-packaging`.
