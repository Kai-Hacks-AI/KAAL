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

- Superseded by review round 01 finding 1: needs are checked for the whole resulting composition, held and selected alike (see Round 01 below).
- A package is classified in a throwaway KAAL with Core alone. A package whose Nodes would need another offered package's Nodes to be admitted is not offered; no current package is like that.
- `kaal-compose` declares `kaal-core` as a dependency (resolved by the root workspace). Sibling packages declare none and keep their own lockfiles; a standalone install of `kaal-compose` needs `kaal-core` to be published, which it is not yet.
- `fromNpm` now offers everything npm obtained (round 01 finding 3). `offers` writes tab-separated lines: kind, name, ID, delivery name, and `held`.

## Not done, by decision

No automatic dependency closure (F1), no registry, no Core change, no authentication claim beyond exact ID, byte equality and Core admission (F7), no `kaal-packaging`.

## Round 01 to 03 findings (review/01.md to 03.md)

The Change moved from `09/02` to `09/05` because another Change took `09/02` on `kaal/genesis`; the Work and the review records were moved as they were.

1. **Whole-composition needs.** Every Skill the resulting Engine holds, existing or selected, is checked: its declaration is read from the offered package carrying it, else from its Agent Skill in the host skills directory, and a held Skill whose declaration cannot be found is refused. Test 11 reproduces the reviewer's case with real packages (Sealing's delivery and Agent Skill removed, then GitHub selected): the installer's `delivery()` and `install()` both refuse, naming Sealing's exact ID, with both destinations unchanged; reselecting the held Changing KAAL is refused too; with the need restored both accept.
2. **Exactly what was selected.** The held set of the staged candidate must equal what the Engine holds plus what was selected; an offer that brings another typed capability is refused, naming it. The committed Engine is read back through Core and must equal the staged set, otherwise what was written is removed. Test 12 uses the reviewer's real-byte bundle (Sealing's Agent Skill and slot with Changing KAAL's contribution): selecting Sealing alone is refused with nothing written; selecting both is accepted.
3. **npm and local views.** `fromNpm` offers every package in the directory npm populated, as `fromDirectory` does. Test 13 packs a wrapper whose npm dependency is the Sealing tarball, offline: the offers include the dependency's exact ID, and selecting only it installs only it.
4. **Outside the checkout.** Test 14 packs `kaal-core`, `kaal-compose`, `kaal-changing`, `kaal-sealing` and `kaal-github`, installs the tool and its Core into a clean directory offline, and runs the shipped command with separate Engine, skills, Record and Subject locations. A Skill without its need is refused with nothing created. With all three selected, `held` reports them; the acquired Changing KAAL script allocates a change in the Record location; the Extension's executable, delivered by its npm package where the operator installed it, runs as `kaal-github isolate-boundaries HEAD` in the Subject, which stays as it was. Responsibility is stated in the README: composition installs an Extension's Node, and npm delivers its code. It is not claimed that installing the Node exercises the Extension.

Limit that stands: each offer is still classified alone against Core, so a package whose Nodes need another offered package's Nodes to be admitted is not offered.
