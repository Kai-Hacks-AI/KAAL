# Core configuration: one property

Architecture of the smallest useful Core configuration experiment.

## Rule

Core owns the schema and the default. The installed KAAL carries `.kaal/core/config`: plain text, human-editable, instance-owned, not a Node and not sealed. A deterministic Core checker reads the target instance's config, resolves the effective value and reports conformance. Changing the config never renames or repairs anything.

## The one property

Deployed self-documenting, in the familiar Unix style:

```ini
# Prefix used for KAAL capability delivery names.
# capability-prefix = kaal-
```

A commented or missing setting means Core's default, `kaal-`, applies. An uncommented `capability-prefix = <value>` overrides it for that instance. Lines are blank, `#` comments, or `key = value`; an unknown key, a repeated key or an invalid value is reported, never ignored. The prefix is lowercase letters, digits and hyphens, so a delivery name stays valid under `registerSkill()`'s unchanged grammar.

## Checker

Reads `<kaal-dir>/core/config` of the target instance (never the package default; a missing file is not an error, the default applies), resolves the effective prefix, and inspects the capability delivery directories `<kaal-dir>/skills/*`. Each must start with the prefix; each that does not is reported with its current name and the required prefix. Structural only: no semantic-name derivation, no name mapping, no registry; `kaal-whatever` conforms. It observes and reports, with exit 0 or 1. No new public Core API: the checker is private to the package and reached by built path, like `bootstrap.ts`. `registerSkill()` is unchanged.

Expected on today's tree: `changing-kaal` and `engineering-kaal-skill` red, `kaal-sealing` green.

## Sealing constraint

Configuration governs only what sealed identity leaves free. A delivery directory's name is outside every Node's identity, so a later rename leaves Node bytes, IDs and seals unchanged; acceptance asserts it.

## Fixtures

Independent, hand-written KAAL directories: default (no file, and commented file) with `kaal-x` green and `x-kaal` red; `acme-` override changes the verdict with nothing renamed; unknown key, repeated key, invalid value and bad line reported; the checker reads the target instance, not the package; a directory rename leaves Node IDs unchanged.

## Carriers

Core ships the default `core/config` in its payload, so a realization is born with it. The installer writes it only when absent and never overwrites it, so a human edit survives installing and is not drift. The command that runs the checker is `check-kaal-config`; making it a repository control is outside Core and outside this Change.

## Naming migration

`changing-kaal` and `engineering-kaal-skill` are renamed to `kaal-changing` and `kaal-engineering` wherever the capability delivery identifier appears (package, Agent Skill and engineering directories, the installed projection, tests and docs). The red under the default is kept long enough to prove the checker, then migrated explicitly. The semantic Nodes `Changing KAAL`, `Engineering Skill` and `Sealing` keep their bytes, IDs and seals.
