# kaal-install (engineering)

The machinery by which this repository is itself an installed KAAL. It is not part of `kaal-core` and is not shipped. The repository is both the source of the npm packages and a checkout with KAAL installed in it; this directory keeps the second a projection of the first.

## What is installed, and from where

```
.kaal/AGENT.md, core/, seals/    from packages/kaal-core, its payload()
.kaal/skills/<capability>/       from packages/<capability>/kaal, registered through Core's registerSkill()
.kaal/seals/                     Core's seals, and each capability Node's own seal
skills/<capability>/             from packages/<capability>/skills, the Agent Skills
AGENTS.md                        wired to .kaal/AGENT.md by wire-kaal-agent
.kaal/changes/                   genuine installed state: not derived, not touched here
```

Every package under `packages/` other than `kaal-core` is a capability. Nothing under `.kaal/` (except `changes/`) or under the capabilities' `skills/` is written by hand, and the committed bytes are never the authority for package-derived state: the packages are.

## Commands

- `npm run install-kaal [-- --into <dir>]` makes a checkout hold the delivery. Core's payload is deployed into a throwaway KAAL directory, each capability is registered into it through Core, and the result is projected into the checkout. It is idempotent. Sealed material is append-only: if an installed Node, seal or Core file would take other bytes, it refuses and writes nothing, as Core's registration does. The unsealed derived files, `.kaal/AGENT.md` and the Agent Skills of the delivered capabilities, are made to match the packages. `.kaal/changes` is never read or written.
- `npm run check-kaal-install [-- --into <dir>]` exits 0 if the checkout holds exactly what the packages currently deliver, otherwise 1, naming each file that is missing, differs, or is not delivered by any package, and each installed Node that is not admitted. It never repairs.

Both default to the current directory. `--into` names another checkout; the packages are always this repository's.

## Acceptance

`npm test` here runs on what the packages actually deliver: install into an empty checkout and show Core's installed state equals Core's delivery, that Engineering KAAL Skill and Changing KAAL are registered Skills with their Nodes under `.kaal/skills/<capability>/` and their seals in `.kaal/seals/`, that the Agent Skills appear under `skills/`, and that the Agent entrypoint is wired by the existing `wire-kaal-agent`. It shows the check names damage and repairs nothing, that sealed material is not rewritten, and that `.kaal/changes` survives installing and is outside the check. The last tests hold this repository to the same, including that its change records are allocated in sequence and each is closed with a four-heading `retro.md`.

## Not here

The change directory as a sealed unit, and seal controls that cover the installed copies and `.kaal/changes`, are later work: the immutability of a change record is, for now, the behavioural rule of Changing KAAL. Running `check-kaal-install` in CI is a `.github` change and travels alone.
