# Process PLAN: move kaal-process to main's flat package layout

Status: PLAN only. Provisional number 03/04 (03/03 is claimed by PLAN #962). No SYNC is needed to plan this, and none is requested.

## Intent

On `main`, packages live at `packages/kaal-<name>` (change, core, engineer-skill, foundation, graph, guard, hosting, review, testing). On `kaal/process`, kaal-process still lives at `packages/skills/kaal-process`. Before Process is next to promote, its path should match main's layout, so the promotion carries the package where main expects it and the SYNC at that time has no layout conflict beyond the lock. The move is a Change of its own, not part of a SYNC or of #560's content.

## What changes

A path move only, `packages/skills/kaal-process` → `packages/kaal-process`, and the references to the path:

| Where | Today | After |
|---|---|---|
| Directory | `packages/skills/kaal-process` | `packages/kaal-process` |
| `ownership.kaal.json` `paths` | `packages/skills/kaal-process/` | `packages/kaal-process/` |
| `test/process.test.mjs` claim path and `deepEqual` on `claim.paths` | `packages/skills/kaal-process/...` | `packages/kaal-process/...` |
| Root `package.json` workspaces | `packages/skills/kaal-process` | `packages/kaal-process` |
| Root `package-lock.json` | workspace entries under the old path | regenerated |
| Change record 02/01 (history) | names the old path | left as written; it records what was true then |

No Definition text, no behaviour, no claim content and no package name changes. The Process id (the node identity) does not move with a path unless it is derived from it; the DO checks that first and stops if the identity would change.

## Order (RED first)

1. RED: the package test asserts the claim path `packages/kaal-process/` (fails while the directory is at the old path).
2. DO: `git mv` the directory, update the references above, regenerate the lock.
3. CHECK: `npm test` in the package, the root workspace test lane, and Change Isolation and Branching on the PR. The move touches `package.json` and `package-lock.json` at the root, so it is checked as one Change that travels with its package.

## Risks and checks

- **Admission and the claim.** Core's registry is the authority for admission; the ownership claim's `paths` must match the new path. The test above covers it.
- **#560.** The promotion's file inventory (10 files vs main) changes paths only. Its body is updated when this lands.
- **Packaging's contract.** The flat layout is how main already ships packages, so this is expected to be neutral; confirm no Packaging requirement names the old path.
- **Where it lands.** Into `kaal/process` by squash, before any SYNC. The SYNC at Process's promotion turn then resolves only the lock.

## Out of scope

Any SYNC, promotion, publication or version bump; the Serving, ownership and nesting amendment; the release-acceptance DO (waits on Packaging's #941 and #620).

## Scope

This record only. Markdown. No Node, Definition, claim, package, workflow or policy changes.
