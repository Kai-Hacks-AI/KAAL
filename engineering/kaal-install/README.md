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

Which Skills are installed is Core's answer, `installedSkills()`, derived from the admitted graph of the installed KAAL: no package layout, package name or list decides it. The packages supply only bytes: the package that delivers an installed Skill is the one carrying a Node with that exact ID (a package is any directory under `packages/` whose built `payload()` returns `{ kaal, skills }`). Nothing under `.kaal/` (except `changes/`) or under a delivered capability's `skills/` is written by hand, and the committed bytes are never the authority for package-derived state: the packages are. A package that exists but whose Skill is not installed is not installed; adding a capability is a visible change to `.kaal`.

Genesis was bootstrapped explicitly: deploy Core, register Engineering KAAL Skill's contribution through Core, register Changing KAAL's the same way, then `install-kaal`. From then on `installedSkills()` is the truth. How a first Skill is selected on a generic fresh checkout is not designed here.

## Commands

- `npm run install-kaal [-- --into <dir>]` makes a checkout hold the delivery. Core's payload is deployed into a throwaway KAAL directory, each delivering package's contribution is registered into it through Core, and the result is projected into the checkout. The Skills delivered are those the checkout has installed, as Core reports them; a fresh checkout is installed Core only, and there is no way to select a Skill by name. A Skill enters the installed KAAL by being registered through Core (`registerSkill()`), after which Core discovers it and this command projects it. It is idempotent. Sealed material is append-only: if an installed Node, seal or Core file would take other bytes, it refuses and writes nothing, as Core's registration does. The unsealed derived files, `.kaal/AGENTS.md` and the Agent Skills of the delivered capabilities, are made to match the packages. `.kaal/changes` is never read or written.
- `npm run check-kaal-install [-- --into <dir>]` exits 0 if the checkout holds exactly what the packages currently deliver for its installed Skills, otherwise 1, naming each file that is missing, differs, or is not delivered by any package, each installed Skill that no package delivers, and each installed Node that is not admitted. It never repairs.

Both default to the current directory. `--into` names another checkout; the packages are always this repository's.

## Acceptance

`npm test` here runs on what the packages actually deliver: install into an empty checkout (Core only, with no installed Skills), then bootstrap as genesis was (register the two contributions through Core), and show Core's installed state equals Core's delivery, that Engineering KAAL Skill and Changing KAAL are registered Skills with their Nodes under `.kaal/skills/<capability>/` and their seals in `.kaal/seals/`, that the Agent Skills appear under `skills/`, and that what is delivered follows the installed Skills and not the existence of packages, that an installed Skill no package delivers is named, and that the Agent entrypoint is wired by the existing `wire-kaal-agent`. It shows the check names damage and repairs nothing, that sealed material is not rewritten, and that `.kaal/changes` survives installing and is outside the check. The last tests hold this repository to the same, including that its change records are allocated in sequence and each is closed with a four-heading `retro.md`.

## Not here

The change directory as a sealed unit, and seal controls that cover the installed copies and `.kaal/changes`, are later work: the immutability of a change record is, for now, the behavioural rule of Changing KAAL. Running `check-kaal-install` in CI is a `.github` change and travels alone.
