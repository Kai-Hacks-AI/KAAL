# C128 do

The DO renames the control `attribute Changes` to `isolate Changes`, as the approved PLAN decides, and changes nothing else.

- `04-controls/CTL33-attribute-changes/` is `04-controls/CTL33-isolate-changes/`: title `isolate Changes`, flag `KAAL_RELEASE_ISOLATE_CHANGES`, the report line; the id `release/CTL33` and the Intent `release/I67` are unchanged.
- `05-src/phase/lib/attribute-changes.mjs` is `lib/isolate-changes.mjs`, exporting `isolateChanges`.
- The runner `run-controls-act.mjs` has the mode `isolate` and `isolationOf`, and its report reads `isolate Changes`.
- The workflow source `05-src/wiring/workflows/controls-act.yml` has the job `isolate-changes`, the check `isolate Changes`, the flag variable and the mode. The installed workflow is unchanged, as is every variable and ruleset.
- The words of the answers stay: `own`, `inherited` and "no attribution without <folders>".

## Accepted edits

The Cases T1352 to T1360 of release/C123 and the fixture `isolation-fixtures.mjs` (renamed from `attribution-fixtures.mjs`) read the old names; they keep their ids and file names and read the new ones, the same fixtures and the same answers. T1314 (release/A77) lists the layer `isolate-changes`. T1360 now also fails on any leftover of the old name in the control record, the library, the runner and the workflow source, and on the old paths. The records of release/C123 and the retro RT12 are not rewritten.

## Verified

T1352 to T1360 and T1314 pass. The full Cases run is in the pull request; the known failures are unchanged.
