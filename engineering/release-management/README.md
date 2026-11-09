# Release management (Engineering)

PLAN, nothing here is built. The root holds the full loop for how a package moves from `main` out to the world. The stations below it repeat the same loop, one station at a time.

| Folder | What it is | State |
| --- | --- | --- |
| `01-intent/` to `04-test/` | the overarching view of the root: Intent, Requirements, Architecture (the flow drawing), planned Cases | this PLAN |
| `10-npmjs/` | station: a package on the npm registry | scope of this PLAN |
| `11-main/` | station: the package's state on `main` | name only |
| `12-kaal/` | station: KAAL's own use of the package (KAAL installs it for KAAL) | name only |
| `13-change-branch/` | station: a Change on its working branch | name only |

Numbering: the root keeps `00`-`06` as in a package (`00-changes`, `01-intent`, `02-requirements`, `03-architecture`, `04-test`, `05-src`, `06-defects`); stations start at `10`, so a station number never collides with a loop number. Folders are created when they hold something, so `00-changes`, `05-src`, `06-defects` and the other stations do not exist yet.

Existing controls (`engineering/controls/`) and the release engine (`engineering/release/`, `.github/workflows/release.yml`) are untouched by this PLAN.
