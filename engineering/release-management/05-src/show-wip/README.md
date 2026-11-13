# Show WIP: the command for this repository

`node run.mjs <owner/repo> show-wip.json` reads every open piece of work through the `gh` command line the environment is signed in to (read-only API calls, 20 pieces a page, a gateway failure read again a few times), runs the Skill's `show-wip.mjs` and prints one line per piece:

```
#number TYPE from → into DISPOSITION reason
```

The disposition is WORK, REVIEW, WAIT or UNKNOWN, from what the host reports. The lines are grouped by the stations of `show-wip.json`, an explicit mapping of where a piece comes from and goes into; a piece no entry matches is listed under `unknown station`. Whatever the host did not report is listed under `not observed`, never guessed. After the board it prints a `Review sequence`: the REVIEW pieces in the order the config declares (station, then type, then number), each CLEAN, NOT CLEAN or UNKNOWN for review at that moment with the reasons and the exact head it was read at. CLEAN means suitable for review at that observed point in time; it authorizes nothing. It exits 0 when it printed a report and 2 naming what it could not read.

- `read.mjs` maps the host's records to the Script's facts (newest run per check, a cut list is not observed, an approval counts only for the current version).
- `show-wip.json` is this repository's config: the declared title prefixes, the station mapping and the review order (`review`: stations, types and the type of a sync).
- `evidence/` holds the run on the real repository (coordination/T39).

It observes and shows only. It makes no release-policy judgment and authorizes nothing.
