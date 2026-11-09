# Release management (Engineering)

PLAN, nothing here is built. The root holds the full loop for how a package moves from a working branch out to the world. The stations below it repeat the same loop, one station at a time. Each station has **in** (the receiver's check), **stock** (what holds while work sits at the station) and **out** (the sender's check), so what is out of one station and what is in to the next may be different controls.

| Folder | What it is | State |
| --- | --- | --- |
| `01-intent/` to `04-test/` | the overarching view of the root: Intent, Requirements, Architecture (the flow drawing), planned Cases | this PLAN |
| `10-npmjs/` | station: a package on the npm registry | in scope: designed here |
| `11-main/` | station: the package's state on `main` | `out: version Package` designed here; other controls named only |
| `12-kaal/` | station: the `kaal/*` collectors | names only |

Numbering: the root keeps `00`-`06` as in a package (`00-changes`, `01-intent`, `02-requirements`, `03-architecture`, `04-test`, `05-src`, `06-defects`); stations start at `10`, so a station number never collides with a loop number. Folders are created when they hold something, so `00-changes`, `05-src`, `06-defects` and the station folders do not exist yet. Station `13-change-branch` is dropped for now (Owner, 9 Nov).

Existing controls (`engineering/controls/`), their checks and files, and the release engine (`engineering/release/`, `.github/workflows/release.yml`) are untouched and not renamed by this PLAN. The names below are the Owner's, agreed 9 Nov 2026.
