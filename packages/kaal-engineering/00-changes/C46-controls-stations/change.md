# C46 change

Asked by Controls (28 Nov, C161): the station names become the adopter's input, so Engineering's callers must pass the repository's stations before C161 promotes. The coordinator ruled it runs in parallel with the 2 DEC work, additive, and coordinated with Release. The CTO call keeps it DRY: Release's C175 exports the single list, so this Change defines none.

## The list is Release's

release/C175 (#2999) adds `engineering/release-management/05-src/lib/stations.mjs`, one exported constant `STATIONS` with no import: Developing, Collecting, Integrating, Hotfixing, Wiring, Promoting, Publishing. Release's Case T1690 pins it against the stage declaration and the ruleset sources. Engineering imports it and holds no copy.

## Order

The DO needs `stations.mjs` on main, so it follows release/C175 on main (a dependency, named here). The PLAN and its Cases do not.

## The callers found on main

| Caller | Call today | Passes after |
| --- | --- | --- |
| `registry-run.mjs` | `registryAt(files, a.station)` | `registryAt(files, a.station, STATIONS)` |
| `evidence-run.mjs` | `findControls(files)` | `findControls(files, { stations: STATIONS })` |
| `check-run.mjs`, `judge-run.mjs` | `checkControls`, `judgeMode` | unchanged unless the DO shows they reach the finder; the DO says which |
| Release's `entry-flag.mjs` | its own caller | release/C175 |

An extra argument is ignored by today's finder, so each call is safe before C161 and correct after it. T1621 (F102) keeps its expectations: the runners still import the controls Skill and read through `hosting-files.mjs`; the new import is one more line, pinned by the new Cases.

## Design question, with recommendation

How far the import reaches: the runners import `STATIONS` by relative path from `engineering/release-management/05-src/lib/stations.mjs`. Recommend that, because the module has no import and one list is the point. If Release moves it, this Change follows the move.

## What this Change pins (Cases, plain `.test.mjs`)

- T1740: `registry-run.mjs` and `evidence-run.mjs` import `STATIONS` from Release's `stations.mjs` and pass it to the finder.
- T1741: no file of `13-source/controls/` holds a list of the station names.

T1740 is RED until the DO. T1741 is a guard and is GREEN today. T1622 and the other Cases of F102 stay GREEN.

## Not in this Change

A second list, a WIRE, a ruleset change, any edit to the controls Skill, and Release's `entry-flag.mjs`.
