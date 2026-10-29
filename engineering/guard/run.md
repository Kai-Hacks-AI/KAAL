# Guard: Run

`kaal-guard run` exists from guard/C1, `verify` from guard/C4a, and `init`, `upgrade` and `remove` from guard/C4b, so far only in this repository, where KAAL's pre-push hook and CI use `run` from guard/C3a and guard/C3c. The consumer docs ship in the package, as its README and its product contract in `docs/`; this page is the Engineering view.

## Embed: shipped in the package

The package is published to npm as `@kaihacksai/kaal-guard`, only with the Owner's authorization. How a consumer installs, declares, runs, verifies and removes it is the package's own Operations, its [README](../../packages/kaal-guard/README.md) and its Skill, and what each command must do is its [Requirements](../../packages/kaal-guard/docs/requirements.md): `verify`'s declared form is guard/F10's. This page does not restate them.

## Engineer: KAAL itself

KAAL installs `@kaihacksai/kaal-guard` from its own tree, `packages/kaal-guard`, as a development dependency (not a workspace) and declares its checks in `.kaal/config/guard/`. Its own hook and workflows run them in the declared form, so `init` reports them as executed by Guard, not managed, and `init --ci` installs nothing beside them (guard/F17). Development, the full documentation and the Engineering-only outer tests live here, in `engineering/guard/`.

## External: naked delivery by KAAL Engineering

KAAL Engineering implements Guard in the target from the target's own commands, adapting it where needed, and delivers it as one Change, normally a pull request. The Change contains a working `.githooks/pre-push`, working CI jobs (in the target's existing workflows or a new one) and the local docs to maintain them. It contains neither the `kaal-guard` package nor any other KAAL element, and never overwrites the target's existing files. From guard/C5 the tooling is `engineering/guard/external/deliver.mjs`; [its page](external/README.md) says how to deliver.
