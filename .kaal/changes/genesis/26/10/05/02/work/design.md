# Core-owned, instance-carried standards

Design for the first standard: capability delivery naming. Nothing here is implemented.

## Rule

Core defines the standard and its default. The KAAL instance carries its current value in `.kaal/core/standards.cfg` (plain `key = value`, `#` comments; not a Node, not sealed, human-editable). Core's checker reads that file in the target KAAL, observes the instance and reports conformance. It never renames or repairs.

## First standard

```
capability-delivery = kaal-<capability>
```

The semantic Node name maps to a capability: lowercase, drop the words `KAAL` and `Skill`, join the remaining words with `-`; a name that reduces to nothing is an error. The delivery identifier is the pattern with `<capability>` replaced. Examples: Changing KAAL -> `kaal-changing`, Engineering Skill -> `kaal-engineering`, Sealing -> `kaal-sealing`.

## Checker

For each Skill Core reports (`installedSkills`), find the Node's directory `skills/<dir>/` in the target KAAL and require `<dir>` to equal the expected identifier; report current and expected. A missing standards file is a failure; there is no fallback to the package default. `registerSkill()` is untouched.

Expected on today's tree: `changing-kaal` and `engineering-kaal-skill` fail, `kaal-sealing` passes.

## Fixtures (independent of the checker's own helpers)

Hand-written KAAL directories: default standard with conforming names; `kaal-whatever` for Changing KAAL (fails, not a prefix check); `acme-<capability>` standard changing every expectation with nothing renamed; missing standards file; two Skills in one directory; a name that reduces to nothing; Node bytes, IDs and seals identical before and after a directory rename.

## PR graph and merge order

0. This PR: allocate the Change with this design (draft until the Sealing Change closes).
1. A, `engineering/kaal-install` only: `core/standards.cfg` is instance-owned (written if absent, never overwritten, edits are not drift).
2. B, Core alone: default file, checker, CLI helper, acceptance; adjusts the one Core test that expects any byte edit under `core/` to be detected.
3. C, ordinary: root `check-kaal-standards` script, installed `.kaal/core/standards.cfg`, README. Not in `npm test`; red by design on legacy names.
4. D, ordinary: rename `changing-kaal` and `engineering-kaal-skill` (packages, host skills, engineering) and regenerate `.kaal`; Node bytes/IDs/seals unchanged; checker green.
5. E, optional, `.github` alone: run the checker as a control.

A and B are independent; B before C, C before D.
