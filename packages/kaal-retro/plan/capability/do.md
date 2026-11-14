# DO (retro/C2)

Delivered: `capability/Retro.md` (typed by KAAL Capability), `payload/Retro.md` (typed by KAAL Skill), `ownership.kaal.json` naming the capability Retro by the exact id of `capability/Retro.md` and claiming `packages/kaal-retro/`, the package `test` script (`pretest` builds kaal-core) running retro/T1 to T15, and an updated README. The installable Skill is unchanged. The package is still not in the root workspaces and nothing is installed, wired, published or registered in this repository's `.kaal/` Engine.

## Check

`npm test` in `packages/kaal-retro` gives 15 pass, 0 fail locally: T1 to T10 unchanged, T11 to T15 now green. T12 and T13 perform Core's own admission on a temporary Engine; T15 is a naming assertion and is not evidence of a registered scope on main.

## Case corrected

retro/T14 as planned read the claim with `readClaim` using the wrong signature (a single argument, no path) and compared the whole result. It failed for that reason against a correct claim. The Case now calls `readClaim(path, bytes)` and checks `claim.owner`, `claim.paths` and `finding`, as kaal-change's does. It asserts the same things as planned: kind, name, exact Node id, the package path, and no Learning.

## Open

- `files` lists `capability`, `payload` and `skills`, as Testing does, so Core can admit the Nodes from the package. Publication is not authorized.
- Registering Retro in this repository's own `.kaal/` Engine is not done; it needs the Owner.
