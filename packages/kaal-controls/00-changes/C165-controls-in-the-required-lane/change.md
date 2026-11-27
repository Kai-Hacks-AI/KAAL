# C165 change

## PLAN

1. Record the intent I33, the Requirement F227 and the Case T1729 (plain `.test.mjs`, never renamed). The Case reads the root `package.json` and `package-lock.json` and the package's own `package.json`. It is RED on `main` (`packages/kaal-controls` is not in the root `workspaces`) and was run GREEN against a throwaway copy of the two root files with the entry added, which is not committed. The package's other Cases stay GREEN and unchanged.
2. No script, Skill word, record, workflow, required check or ruleset changes in the PLAN.

## Ownership

The root `package.json`, its lock file and the lane (`engineering/lanes/workspaces.mjs`) are Engineering's (engineering/C6, engineering/N2: the lane runs each workspace's own tests and rewrites none). The Requirement and the Case are controls', because they say what controls needs from the lane; they read the root files and change nothing in them. The DO edits two root files, so Engineering and Release are told, and the CPO reviews it as for any change that touches another capability's files.

## DO

Not authorized by this PLAN. On its merge into the collector `kaal/controls/workspace-lane`:

1. Add `"packages/kaal-controls"` to `workspaces` of the root `package.json`, and update `package-lock.json` with `npm install --package-lock-only` so it holds the workspace entry and the link. Nothing else in the root changes: no script, no lane, no workflow, no required check.
2. The package is not touched: no dependency, no script, `private: true` stays.
3. T1729 GREEN; the package suite GREEN; and the Workspaces lane (`npm run test:workspaces`) run once on the result, with its result and duration recorded in the DO pull request. A mutation: removing the entry turns T1729 RED.

## ACT

A retro entry in the collector.

## Design questions, with recommendations

1. **How the package joins.** As a workspace, so no new lane and no new required check exists (Release's finding). The alternative, a line in the Workspaces lane or a new job, would add a mechanism and a required name for no gain.
2. **What the lane now runs.** The package's `npm test` (`node --test test/*.test.mjs`) on one host (Linux), as for every workspace but Hosting. Its Cases that read the repository (they locate the root by `/packages/`) run in the full tree, where they have their siblings. The duration is measured in the DO and recorded; if the lane's time grows by more than the Owner wants, that is a decision for the Owner, not a reason to leave the suite out.
3. **Other packages outside the workspaces.** `kaal-architecture`, `kaal-backlog`, `kaal-defect`, `kaal-engineering`, `kaal-guard`, `kaal-research` and `kaal-retro` are also not workspaces. They are other capabilities' and out of this Change. The same gap may apply to them, and I say so to Engineering and Release rather than decide it here.
4. **Merge group.** The Workspaces lane runs on `merge_group` (`ci.yml`), so being a workspace is enough. A check that a required lane covers every package that has a suite would be a general Case for Engineering to own; none is added here.
5. **Collector.** `kaal/controls/workspace-lane`, branched from the tip of `main`. It never holds anything else back.

## Not here

No DO, WIRE, ruleset edit, required check or publish. The grouping and wait of the merge group is a separate decision of the Owner.
