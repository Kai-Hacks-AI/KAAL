# Release management (Engineering)

Release management is the end-to-end loop by which a package moves from a working branch out to the world, one station at a time. This folder is built up one control at a time; it holds only what the controls delivered so far need.

| Folder | What it is |
| --- | --- |
| `01-intent/` to `04-test/` | Intent, Requirements, Architecture and Cases of the target (B) |
| `05-src/` | components, all peers, named by what they are (`rulesets/`) |
| `06-defects/` | Defect Records, `release-management/D<n>`, each with its expected, observed, where, status and the Cases that test it |
| `00-changes/` | the Change (A to B): plans, present state, differences, the route, temporary mechanisms and the Cases of the migration; it references the target by id and never restates it |

Controls delivered so far: approve Change (F15), release-management/C19.
