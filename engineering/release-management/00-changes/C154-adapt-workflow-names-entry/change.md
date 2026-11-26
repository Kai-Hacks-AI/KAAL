# release/C154: one real delivered entry integrates the adapter, so verify Adapter can show a PASS

## Intent
Kai asked for a positive PASS of verify Adapter before its detective WIRE (release/C139): the first real runs say UNKNOWN, which does not show correct detection. This Change makes one real delivered release control integrate the adapter, and shows the PASS for that one control, structure only.

## The entry
`05-src/workflow-names/judge-workflow-names.mjs` (release/CTL36) wraps its pure judge in controls' `runControl` in detective mode (controls, on C154: wrap the check, not the writer):
- The check is `workflowNamesFindings` over what `readWorkflows` returned: input in, findings out. The file reads, the writing of the findings file and the printing stay outside the check, so a throw becomes UNKNOWN as controls intends.
- Behaviour is unchanged: the same findings file, the same exit codes (0 even when the list is not empty; 2 and no file when it cannot tell), the same `UNKNOWN:` line on stderr. Its existing Cases stay green without a change.
- The import specifier is the real relative path from the entry's folder to `packages/kaal-controls/skills/kaal-controls/scripts/adapter.mjs`, which climbs out of the entry folder (controls tested no such path, so T1572 does). Every occurrence of `runControl` in the entry is a call: no alias, no re-export.

## The demonstration map
`05-src/adapter/delivery-map.demo.json`, the default branch's like the real one: it inventories only what this demonstration delivers (`.github/workflows/verify-workflow-names.yml`) and claims it for `release/CTL36`. The real `delivery-map.json` is unchanged, so the real runs keep saying UNKNOWN for the six entries not yet migrated. A PASS from the demonstration map says that this one control integrates the adapter, never that release does, and that nothing here observes that it ran.

## The evidence
The runner's `adapter-evidence` line carries the digests, and `--bind` against the repository at the merge sha says BOUND (release/C139, T1558). PASS plus BOUND is the demonstration.

## Cases
- T1572: the real entry shows a recognizable integration: `recognizeIntegration` over its real text with the real relative specifier. Red on the unadapted entry.
- T1573: the runner with the demonstration map over a scratch repository holding the delivered file and the entry says PASS (exit 0, `adapter-evidence` PASS), and `--bind` says BOUND. A byte of the entry changed after the observation is UNKNOWN. Red until the entry and the map exist.
- T1574: the entry behaves as before: findings for a duplicate or missing name, an empty list for a clean folder, exit 2 and no file for a folder without workflows. It passes now and must stay green.
- The real map on the repository still says UNKNOWN naming `release/CTL1`, so a demonstration is never read as the real result.

## Not in this Change
No WIRE, flag, required check or ruleset change. The other six entries migrate later, one Change each. No runtime FAIL: structure only.
