# kaal-install (engineering)

The machinery by which this repository is itself an installed KAAL. It is not part of `kaal-core` and is not shipped. The repository is both the source of the npm packages and a checkout with KAAL installed in it; this directory keeps the second a projection of the first.

## What is installed, and from where

```
.kaal/AGENTS.md, core/, seals/    from packages/kaal-core, its payload()
.kaal/skills/<capability>/       from the delivering package's kaal/, registered through Core's registerSkill()
.kaal/seals/                     Core's seals, and each registered Node's own seal
skills/<capability>/             from the delivering package's skills/, the Agent Skills
AGENTS.md                        wired to .kaal/AGENTS.md by wire-kaal-agent
.kaal/core/config                born from Core's delivery, then instance-owned: written only when absent, never overwritten, edits are not drift
.kaal/changes/                   genuine installed state: not derived, not touched here
```

Which Skills are installed is Core's answer, `installedSkills()`, and which Extensions are, `installedExtensions()`, derived from the admitted graph of the installed KAAL: no package layout, package name or list decides it. The packages supply only bytes: the package that delivers an installed Skill is the one carrying a Node with that exact ID (a package is any directory under `packages/` whose built `payload()` returns `{ kaal, skills }`). Nothing under `.kaal/` (except `changes/`) or under a delivered capability's `skills/` is written by hand, and the committed bytes are never the authority for package-derived state: the packages are. An Extension is delivered the same way, registered through Core's `registerExtension()` under `.kaal/extensions/<capability>/`; its package may carry no Agent Skill (its `payload()` is `{ kaal }`) and registers under its own directory name, and one package delivers one kind of KAAL contribution, a Skill or an Extension, never both. That is a package delivery rule, not a claim of CASE about what a capability may involve: CASE keeps Skill and Extension distinct, each package is independently selectable by an instance, and a capability that needs agent-facing Skill behaviour and an Extension is two packages. A package that exists but whose Skill or Extension is not installed is not installed; adding a capability is a visible change to `.kaal`.

Genesis was bootstrapped explicitly: deploy Core, register Engineering KAAL Skill's contribution through Core, register Changing KAAL's the same way, then `install-kaal`. From then on `installedSkills()` is the truth.

## Installing into a repository that holds no KAAL

A first Skill is selected on a fresh checkout by the exact ID of its Node, with `install-kaal --select <Node ID>` (repeatable). `list-kaal-capabilities` lists what the packages can deliver, each with its Node's ID, and whether the checkout has it; it selects nothing. Nothing is selected by name, and a name or an unknown ID is refused. A selected Node is registered through Core like any other, so Core's admission decides, and from then on it is installed state: `install-kaal` with no selection reproduces the installation, and no list, lock file or registry remembers the selection. The Agent entrypoint is wired by the existing `wire-kaal-agent`, which stays a separate step, and the checks (`check-kaal-install`, `check-kaal-agent`, `check-kaal-config`) are separate commands.

```
npm run list-kaal-capabilities
npm run install-kaal -- --into <host> --select <Node ID> --select <Node ID>
npm run wire-kaal-agent -- --agents <host>/AGENTS.md
npm run check-kaal-install -- --into <host>
npm run check-kaal-agent -- --agents <host>/AGENTS.md
```

Composition is explicit, never automatic. An Agent Skill may declare in its `compatibility` (the Agent Skills standard's free-text field) that it needs a sibling capability beside it (`kaal-changing` needs `kaal-sealing`). The installer reads the string value that field decodes to (plain scalars with their comments excluded, single- and double-quoted scalars, folded and literal block scalars, over any number of lines, on the key's line or below it) for the capability names it mentions (whole words with the instance's `capability-prefix`, `kaal-` by default; Core's own package is not a capability). A named capability that the KAAL does not have installed or selected is unmet, whether or not any package delivers it: `install-kaal` refuses and writes nothing, and `check-kaal-install` reports it. The refusal names the exact Node ID that would select the missing capability; if no package of the delivery carries one, it says that there is no exact ID to select, and the installation still does not count as composed. A representation it cannot decode reliably (an escape sequence in a double-quoted scalar, an anchor, alias, tag or flow collection) is refused the same way before any write, saying that what the Skill needs cannot be established; it is never guessed at. Selecting a dependency is the caller's act, by its ID. This reads a declaration; it adds no machine-readable need and no dependency resolution, and Core does not know of it.

## Commands

- `npm run install-kaal [-- --into <dir>]` makes a checkout hold the delivery. Core's payload is deployed into a throwaway KAAL directory, each delivering package's contribution is registered into it through Core, and the result is projected into the checkout. The Skills delivered are those the checkout has installed, as Core reports them; a fresh checkout is installed Core only, and there is no way to select a Skill by name. A Skill enters the installed KAAL by being registered through Core (`registerSkill()`; an Extension by `registerExtension()`), after which Core discovers it and this command projects it. It is idempotent. Sealed material is append-only: if an installed Node, seal or Core file would take other bytes, it refuses and writes nothing, as Core's registration does. The unsealed derived files, `.kaal/AGENTS.md` and the Agent Skills of the delivered capabilities, are made to match the packages. `.kaal/changes` is never read or written.
- `npm run check-kaal-install [-- --into <dir>]` exits 0 if the checkout holds exactly what the packages currently deliver for its installed Skills, otherwise 1, naming each file that is missing, differs, or is not delivered by any package, each installed Skill that no package delivers, and each installed Node that is not admitted. It never repairs.

Both default to the current directory. `--into` names another checkout; the packages are always this repository's.

## Acceptance

`npm test` here runs on what the packages actually deliver: install into an empty checkout (Core only, with no installed Skills), then bootstrap as genesis was (register the two contributions through Core), and show Core's installed state equals Core's delivery, that Engineering KAAL Skill and Changing KAAL are registered Skills with their Nodes under `.kaal/skills/<capability>/` and their seals in `.kaal/seals/`, that the Agent Skills appear under `skills/`, and that what is delivered follows the installed Skills and not the existence of packages, that an installed Skill no package delivers is named, and that the Agent entrypoint is wired by the existing `wire-kaal-agent`. It shows the check names damage and repairs nothing, that sealed material is not rewritten, and that `.kaal/changes` survives installing and is outside the check. The repository itself is held to candidate validity: its checked-in projection and host delivery are copied into a scratch directory, the candidate packages' delivery is installed over the copy (which refuses any sealed byte that would change), and the complete check must then hold there, with no exceptions. That proves the candidate produces a complete installation and can legally advance the admitted projection, without requiring the checked-in `.kaal` to be current, which a change confined to a package cannot also update; whether the checked-in projection is current is `check-kaal-install` itself, run on the lineage. The last tests hold this repository to the same, including that its change records are allocated in sequence and each is closed with four-heading retros (the historical single `retro.md`, or `retro-work.md` and `retro-observe.md`, or the present `retro-work.md`, `retro-review.md` and `retro-owner.md` beside review rounds).

## Not here

The change directory as a sealed unit, and seal controls that cover the installed copies and `.kaal/changes`, are later work: the immutability of a change record is, for now, the behavioural rule of Changing KAAL. Running `check-kaal-install` in CI is a `.github` change and travels alone.
